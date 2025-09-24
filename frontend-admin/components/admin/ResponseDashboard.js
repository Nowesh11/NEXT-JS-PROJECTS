import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ResponseDashboard = ({ formId, language, getText }) => {
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // summary, individual, analytics
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (formId) {
      fetchFormData();
    }
  }, [formId]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/recruitment/${formId}/responses`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setForm(data.form);
          setResponses(data.responses || []);
          setAnalytics(data.analytics);
        } else {
          console.error('API returned error:', data.error);
        }
      } else {
        console.error('Failed to fetch form data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      const response = await fetch(`/api/admin/recruitment/${formId}/responses?export=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${form?.title?.en || form?.title || 'recruitment-responses'}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(`Export failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert(`Failed to export CSV: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  const getFieldAnalytics = (field) => {
    if (!analytics?.fieldAnalytics) return null;
    return analytics.fieldAnalytics.find(fa => fa.fieldId === field.id);
  };

  const renderFieldChart = (field, fieldAnalytics) => {
    if (!fieldAnalytics || !fieldAnalytics.values) return null;

    const chartData = {
      labels: Object.keys(fieldAnalytics.values),
      datasets: [
        {
          data: Object.values(fieldAnalytics.values),
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            }
          }
        }
      }
    };

    if (['dropdown', 'multiple-choice', 'checkboxes'].includes(field.type)) {
      return (
        <div className="chart-container">
          <Pie data={chartData} options={options} />
        </div>
      );
    }

    if (field.type === 'date') {
      const barOptions = {
        ...options,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      };
      return (
        <div className="chart-container">
          <Bar data={chartData} options={barOptions} />
        </div>
      );
    }

    return null;
  };

  const renderTextResponses = (field, fieldAnalytics) => {
    if (!fieldAnalytics?.responses) return null;

    return (
      <div className="text-responses">
        <div className="response-stats">
          <span className="stat">
            {language === 'ta' ? 'மொத்த பதில்கள்' : 'Total responses'}: {fieldAnalytics.responses.length}
          </span>
          {fieldAnalytics.averageLength && (
            <span className="stat">
              {language === 'ta' ? 'சராசரி நீளம்' : 'Average length'}: {Math.round(fieldAnalytics.averageLength)} {language === 'ta' ? 'எழுத்துகள்' : 'characters'}
            </span>
          )}
        </div>
        <div className="response-list">
          {fieldAnalytics.responses.slice(0, 10).map((response, index) => (
            <div key={index} className="response-item">
              <div className="response-text">{response}</div>
              <div className="response-meta">
                {new Date().toLocaleDateString()} • {response.length} {language === 'ta' ? 'எழுத்துகள்' : 'chars'}
              </div>
            </div>
          ))}
          {fieldAnalytics.responses.length > 10 && (
            <div className="more-responses">
              +{fieldAnalytics.responses.length - 10} {language === 'ta' ? 'மேலும் பதில்கள்' : 'more responses'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-US');
  };

  const getResponseValue = (response, fieldId) => {
    const answer = response.answers?.find(a => a.fieldId === fieldId);
    if (!answer || (!answer.value && !answer.file)) return '-';
    
    if (answer.file) {
      return (
        <a href={answer.file} target="_blank" rel="noopener noreferrer" className="file-link">
          <i className="fas fa-file"></i>
          {answer.file.split('/').pop()}
        </a>
      );
    }
    
    if (Array.isArray(answer.value)) {
      return answer.value.join(', ');
    }
    
    return answer.value || '-';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{language === 'ta' ? 'படிவம் கிடைக்கவில்லை' : 'Form not found'}</p>
      </div>
    );
  }

  return (
    <div className="response-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h1>{form.title?.[language] || form.title?.en}</h1>
          <div className="form-meta">
            <span className="meta-item">
              <i className="fas fa-users"></i>
              {responses.length} {language === 'ta' ? 'பதில்கள்' : 'responses'}
            </span>
            <span className="meta-item">
              <i className="fas fa-calendar"></i>
              {formatDate(form.startDate)} - {formatDate(form.endDate)}
            </span>
            <span className={`meta-item status-${form.status}`}>
              <i className="fas fa-circle"></i>
              {form.status}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-export"
            onClick={exportToCSV}
            disabled={exportLoading || responses.length === 0}
          >
            <i className={exportLoading ? 'fas fa-spinner fa-spin' : 'fas fa-download'}></i>
            {language === 'ta' ? 'CSV ஏற்றுமதி' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <i className="fas fa-chart-pie"></i>
          {language === 'ta' ? 'சுருக்கம்' : 'Summary'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveTab('individual')}
        >
          <i className="fas fa-list"></i>
          {language === 'ta' ? 'தனிப்பட்ட பதில்கள்' : 'Individual Responses'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-line"></i>
          {language === 'ta' ? 'பகுப்பாய்வு' : 'Analytics'}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'summary' && (
          <div className="summary-tab">
            {responses.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <h3>{language === 'ta' ? 'பதில்கள் இல்லை' : 'No responses yet'}</h3>
                <p>{language === 'ta' ? 'இந்த படிவத்திற்கு இன்னும் பதில்கள் வரவில்லை' : 'No responses have been submitted for this form yet'}</p>
              </div>
            ) : (
              <div className="summary-grid">
                {form.fields?.filter(field => field.type !== 'section-break').map((field) => {
                  const fieldAnalytics = getFieldAnalytics(field);
                  return (
                    <div key={field.id} className="field-summary">
                      <div className="field-header">
                        <h3>{field.label?.[language] || field.label?.en}</h3>
                        <span className="response-count">
                          {fieldAnalytics?.totalResponses || 0} {language === 'ta' ? 'பதில்கள்' : 'responses'}
                        </span>
                      </div>
                      
                      {['dropdown', 'multiple-choice', 'checkboxes', 'date'].includes(field.type) ? (
                        renderFieldChart(field, fieldAnalytics)
                      ) : (
                        renderTextResponses(field, fieldAnalytics)
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'individual' && (
          <div className="individual-tab">
            {responses.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <h3>{language === 'ta' ? 'பதில்கள் இல்லை' : 'No responses yet'}</h3>
              </div>
            ) : (
              <div className="responses-table">
                <div className="table-header">
                  <h3>{language === 'ta' ? 'அனைத்து பதில்கள்' : 'All Responses'} ({responses.length})</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>{language === 'ta' ? 'நேரம்' : 'Timestamp'}</th>
                        {form.fields?.filter(field => field.type !== 'section-break').map((field) => (
                          <th key={field.id}>{field.label?.[language] || field.label?.en}</th>
                        ))}
                        <th>{language === 'ta' ? 'செயல்கள்' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response, index) => (
                        <tr key={response._id || index}>
                          <td className="timestamp-cell">
                            {formatDate(response.submittedAt)}
                          </td>
                          {form.fields?.filter(field => field.type !== 'section-break').map((field) => (
                            <td key={field.id} className="response-cell">
                              {getResponseValue(response, field.id)}
                            </td>
                          ))}
                          <td className="actions-cell">
                            <button
                              className="btn-view"
                              onClick={() => setSelectedResponse(response)}
                              title={language === 'ta' ? 'விரிவாகப் பார்' : 'View Details'}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            {analytics ? (
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>{language === 'ta' ? 'சமர்ப்பண போக்குகள்' : 'Submission Trends'}</h3>
                  <div className="trend-stats">
                    <div className="stat-item">
                      <span className="stat-label">{language === 'ta' ? 'மொத்த சமர்ப்பணங்கள்' : 'Total Submissions'}</span>
                      <span className="stat-value">{analytics.totalSubmissions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{language === 'ta' ? 'சராசரி நேரம்' : 'Average Time'}</span>
                      <span className="stat-value">{analytics.averageCompletionTime || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{language === 'ta' ? 'முடிக்கும் விகிதம்' : 'Completion Rate'}</span>
                      <span className="stat-value">{analytics.completionRate || 'N/A'}%</span>
                    </div>
                  </div>
                </div>

                {analytics.deviceBreakdown && (
                  <div className="analytics-card">
                    <h3>{language === 'ta' ? 'சாதன பிரிவு' : 'Device Breakdown'}</h3>
                    <div className="device-stats">
                      {Object.entries(analytics.deviceBreakdown).map(([device, count]) => (
                        <div key={device} className="device-item">
                          <span className="device-name">{device}</span>
                          <span className="device-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.submissionsByDate && (
                  <div className="analytics-card full-width">
                    <h3>{language === 'ta' ? 'தினசரி சமர்ப்பணங்கள்' : 'Daily Submissions'}</h3>
                    <div className="chart-container">
                      <Bar
                        data={{
                          labels: Object.keys(analytics.submissionsByDate),
                          datasets: [
                            {
                              label: language === 'ta' ? 'சமர்ப்பணங்கள்' : 'Submissions',
                              data: Object.values(analytics.submissionsByDate),
                              backgroundColor: '#3b82f6',
                              borderColor: '#2563eb',
                              borderWidth: 1
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-chart-line"></i>
                <h3>{language === 'ta' ? 'பகுப்பாய்வு கிடைக்கவில்லை' : 'No analytics available'}</h3>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="modal-overlay" onClick={() => setSelectedResponse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{language === 'ta' ? 'பதில் விவரங்கள்' : 'Response Details'}</h3>
              <button className="btn-close" onClick={() => setSelectedResponse(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="response-meta">
                <p><strong>{language === 'ta' ? 'சமர்ப்பிக்கப்பட்ட நேரம்' : 'Submitted at'}:</strong> {formatDate(selectedResponse.submittedAt)}</p>
                {selectedResponse.userId && (
                  <p><strong>{language === 'ta' ? 'பயனர் ID' : 'User ID'}:</strong> {selectedResponse.userId}</p>
                )}
              </div>
              <div className="response-answers">
                {form.fields?.filter(field => field.type !== 'section-break').map((field) => {
                  const answer = selectedResponse.answers.find(a => a.fieldId === field.id);
                  return (
                    <div key={field.id} className="answer-item">
                      <label>{field.label?.[language] || field.label?.en}</label>
                      <div className="answer-value">
                        {answer ? getResponseValue(selectedResponse, field.id) : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .response-dashboard {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .dashboard-header {
          padding: 2rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: #f8fafc;
        }

        .header-info h1 {
          margin: 0 0 1rem 0;
          font-size: 1.75rem;
          font-weight: 600;
          color: #1f2937;
        }

        .form-meta {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .meta-item i {
          width: 16px;
        }

        .status-active {
          color: #10b981;
        }

        .status-expired {
          color: #ef4444;
        }

        .btn-export {
          padding: 0.75rem 1.5rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-export:hover:not(:disabled) {
          background: #059669;
        }

        .btn-export:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .dashboard-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .tab-btn {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: #3b82f6;
          background: #f3f4f6;
        }

        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background: white;
        }

        .dashboard-content {
          padding: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #d1d5db;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .field-summary {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          padding: 1.5rem;
        }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .field-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
        }

        .response-count {
          background: #ddd6fe;
          color: #7c3aed;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .chart-container {
          height: 300px;
          position: relative;
        }

        .text-responses {
          max-height: 300px;
          overflow-y: auto;
        }

        .response-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .stat {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .response-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .response-item {
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }

        .response-text {
          margin-bottom: 0.5rem;
          color: #374151;
          line-height: 1.5;
        }

        .response-meta {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .more-responses {
          text-align: center;
          padding: 1rem;
          color: #6b7280;
          font-style: italic;
        }

        .responses-table {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .table-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .table-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }

        th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        tr:hover {
          background: #f9fafb;
        }

        .timestamp-cell {
          white-space: nowrap;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .response-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-link {
          color: #3b82f6;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .file-link:hover {
          text-decoration: underline;
        }

        .actions-cell {
          width: 60px;
        }

        .btn-view {
          padding: 0.5rem;
          background: #dbeafe;
          color: #1d4ed8;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-view:hover {
          background: #bfdbfe;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .analytics-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          padding: 1.5rem;
        }

        .analytics-card.full-width {
          grid-column: 1 / -1;
        }

        .analytics-card h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
        }

        .trend-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 0.5rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .stat-value {
          font-weight: 600;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .device-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .device-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 0.5rem;
        }

        .device-name {
          color: #374151;
          font-weight: 500;
          text-transform: capitalize;
        }

        .device-count {
          background: #ddd6fe;
          color: #7c3aed;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .btn-close {
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-size: 1.25rem;
        }

        .btn-close:hover {
          color: #374151;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
        }

        .response-answers {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .answer-item {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.5rem;
        }

        .answer-item label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .answer-value {
          color: #6b7280;
          line-height: 1.5;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #6b7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #ef4444;
        }

        .error-container i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .form-meta {
            flex-direction: column;
            gap: 0.75rem;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .table-container {
            overflow-x: scroll;
          }

          table {
            min-width: 800px;
          }

          .modal-content {
            width: 95%;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponseDashboard;