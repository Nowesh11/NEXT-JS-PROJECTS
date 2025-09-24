import { useState, useEffect } from 'react';
import FormBuilder from './FormBuilder';
import ResponseDashboard from './ResponseDashboard';

const RecruitmentManagement = ({ language, getText }) => {
  const [activeTab, setActiveTab] = useState('recruitment'); // recruitment or forms
  const [activeEntityTab, setActiveEntityTab] = useState('projects'); // projects, initiatives, activities
  const [entities, setEntities] = useState({ projects: [], initiatives: [], activities: [] });
  const [recruitmentForms, setRecruitmentForms] = useState([]);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedRole, setSelectedRole] = useState('crew');
  const [editingForm, setEditingForm] = useState(null);
  const [showResponseDashboard, setShowResponseDashboard] = useState(false);
  const [selectedFormForResponses, setSelectedFormForResponses] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch entities (projects, initiatives, activities)
  useEffect(() => {
    fetchEntities();
    fetchRecruitmentForms();
  }, []);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const [projectsRes, initiativesRes, activitiesRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/initiatives'),
        fetch('/api/admin/activities')
      ]);

      const projects = projectsRes.ok ? await projectsRes.json() : [];
      const initiatives = initiativesRes.ok ? await initiativesRes.json() : [];
      const activities = activitiesRes.ok ? await activitiesRes.json() : [];

      setEntities({
        projects: projects.data || projects || [],
        initiatives: initiatives.data || initiatives || [],
        activities: activities.data || activities || []
      });
    } catch (error) {
      console.error('Error fetching entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruitmentForms = async () => {
    try {
      const response = await fetch('/api/admin/recruitment');
      if (response.ok) {
        const data = await response.json();
        setRecruitmentForms(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching recruitment forms:', error);
    }
  };

  const handleCreateForm = (entity, role) => {
    setSelectedEntity(entity);
    setSelectedRole(role);
    setEditingForm(null);
    setShowFormBuilder(true);
  };

  const handleEditForm = (form) => {
    setEditingForm(form);
    setShowFormBuilder(true);
  };

  const handleFormSave = async (formData) => {
    try {
      const url = editingForm 
        ? `/api/admin/recruitment/${editingForm._id}`
        : '/api/admin/recruitment';
      
      const method = editingForm ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchRecruitmentForms();
        setShowFormBuilder(false);
        setSelectedEntity(null);
        setEditingForm(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save form');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form');
    }
  };

  const handleDeleteForm = async (formId) => {
    if (!confirm('Are you sure you want to delete this recruitment form?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/recruitment/${formId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRecruitmentForms();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  const getEntityForms = (entityId, entityType) => {
    return recruitmentForms.filter(form => 
      form.linkedId === entityId && form.type === entityType
    );
  };

  const getFormStatus = (form) => {
    const now = new Date();
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (form.status === 'expired' || endDate < now) {
      return 'expired';
    } else if (form.status === 'active' && startDate <= now && endDate >= now) {
      return 'active';
    } else if (startDate > now) {
      return 'upcoming';
    }
    return 'inactive';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      upcoming: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.inactive;
  };

  const getRoleColor = (role) => {
    const colors = {
      crew: 'bg-purple-100 text-purple-800',
      participant: 'bg-blue-100 text-blue-800',
      volunteer: 'bg-green-100 text-green-800'
    };
    return colors[role] || colors.crew;
  };

  const handleViewResponses = (form) => {
    setSelectedFormForResponses(form);
    setShowResponseDashboard(true);
  };

  if (showFormBuilder) {
    return (
      <FormBuilder
        entity={selectedEntity}
        role={selectedRole}
        editingForm={editingForm}
        onSave={handleFormSave}
        onCancel={() => {
          setShowFormBuilder(false);
          setSelectedEntity(null);
          setEditingForm(null);
        }}
        language={language}
        getText={getText}
      />
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h1>{getText('recruitment')}</h1>
      </div>

      {/* Main Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'recruitment' ? 'active' : ''}`}
          onClick={() => setActiveTab('recruitment')}
        >
          <i className="fas fa-users"></i>
          {language === 'ta' ? 'ஆட்சேர்ப்பு மேலாண்மை' : 'Recruitment Management'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'forms' ? 'active' : ''}`}
          onClick={() => setActiveTab('forms')}
        >
          <i className="fas fa-list"></i>
          {language === 'ta' ? 'படிவ மேலாண்மை' : 'Forms Management'}
        </button>
      </div>

      {/* Recruitment Management Tab */}
      {activeTab === 'recruitment' && (
        <div className="tab-content">
          {/* Entity Tabs */}
          <div className="entity-tabs">
            <button
              className={`entity-tab ${activeEntityTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveEntityTab('projects')}
            >
              {language === 'ta' ? 'திட்டங்கள்' : 'Projects'}
              <span className="count">{entities.projects.length}</span>
            </button>
            <button
              className={`entity-tab ${activeEntityTab === 'initiatives' ? 'active' : ''}`}
              onClick={() => setActiveEntityTab('initiatives')}
            >
              {language === 'ta' ? 'முன்முயற்சிகள்' : 'Initiatives'}
              <span className="count">{entities.initiatives.length}</span>
            </button>
            <button
              className={`entity-tab ${activeEntityTab === 'activities' ? 'active' : ''}`}
              onClick={() => setActiveEntityTab('activities')}
            >
              {language === 'ta' ? 'செயல்பாடுகள்' : 'Activities'}
              <span className="count">{entities.activities.length}</span>
            </button>
          </div>

          {/* Entity Cards */}
          <div className="entity-grid">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            ) : (
              entities[activeEntityTab].map((entity) => {
                const entityForms = getEntityForms(entity._id, activeEntityTab.slice(0, -1));
                return (
                  <div key={entity._id} className="entity-card">
                    <div className="entity-header">
                      <h3>{entity.title?.[language] || entity.title?.en || entity.title}</h3>
                      <span className="entity-type">
                        {activeEntityTab.slice(0, -1)}
                      </span>
                    </div>
                    
                    <div className="entity-description">
                      <p>{entity.description?.[language] || entity.description?.en || entity.description || 'No description available'}</p>
                    </div>

                    {/* Existing Forms */}
                    {entityForms.length > 0 && (
                      <div className="existing-forms">
                        <h4>{language === 'ta' ? 'தற்போதைய படிவங்கள்' : 'Current Forms'}</h4>
                        {entityForms.map((form) => {
                          const status = getFormStatus(form);
                          return (
                            <div key={form._id} className="form-item">
                              <div className="form-info">
                                <span className={`role-badge ${getRoleColor(form.role)}`}>
                                  {form.role}
                                </span>
                                <span className={`status-badge ${getStatusBadge(status)}`}>
                                  {status}
                                </span>
                                <span className="response-count">
                                  {form.responses?.length || 0} responses
                                </span>
                              </div>
                              <div className="form-actions">
                                <button
                                  className="btn-edit"
                                  onClick={() => handleEditForm(form)}
                                  title="Edit Form"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteForm(form._id)}
                                  title="Delete Form"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Create Recruitment Form Buttons */}
                    <div className="recruitment-actions">
                      <h4>{language === 'ta' ? 'ஆட்சேர்ப்பு படிவம் உருவாக்கு' : 'Create Recruitment Form'}</h4>
                      <div className="role-buttons">
                        {['crew', 'participant', 'volunteer'].map((role) => {
                          const hasActiveForm = entityForms.some(form => 
                            form.role === role && getFormStatus(form) === 'active'
                          );
                          return (
                            <button
                              key={role}
                              className={`role-btn ${hasActiveForm ? 'has-active' : ''}`}
                              onClick={() => handleCreateForm(entity, role)}
                              disabled={hasActiveForm}
                            >
                              <i className="fas fa-plus"></i>
                              {language === 'ta' ? (
                                role === 'crew' ? 'பணியாளர்' :
                                role === 'participant' ? 'பங்கேற்பாளர்' : 'தன்னார்வலர்'
                              ) : (
                                role.charAt(0).toUpperCase() + role.slice(1)
                              )}
                              {hasActiveForm && (
                                <span className="active-indicator">
                                  {language === 'ta' ? 'செயலில்' : 'Active'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Forms Management Tab */}
      {activeTab === 'forms' && (
        <div className="tab-content">
          <div className="forms-table-container">
            <div className="table-header">
              <h3>{language === 'ta' ? 'அனைத்து ஆட்சேர்ப்பு படிவங்கள்' : 'All Recruitment Forms'}</h3>
              <div className="table-stats">
                <span className="stat">
                  {language === 'ta' ? 'மொத்தம்' : 'Total'}: {recruitmentForms.length}
                </span>
                <span className="stat">
                  {language === 'ta' ? 'செயலில்' : 'Active'}: {recruitmentForms.filter(f => getFormStatus(f) === 'active').length}
                </span>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="forms-table">
                <thead>
                  <tr>
                    <th>{language === 'ta' ? 'வகை' : 'Type'}</th>
                    <th>{language === 'ta' ? 'தலைப்பு' : 'Title'}</th>
                    <th>{language === 'ta' ? 'பங்கு' : 'Role'}</th>
                    <th>{language === 'ta' ? 'தொடக்க தேதி' : 'Start Date'}</th>
                    <th>{language === 'ta' ? 'முடிவு தேதி' : 'End Date'}</th>
                    <th>{language === 'ta' ? 'நிலை' : 'Status'}</th>
                    <th>{language === 'ta' ? 'பதில்கள்' : 'Responses'}</th>
                    <th>{language === 'ta' ? 'செயல்கள்' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {recruitmentForms.map((form) => {
                    const status = getFormStatus(form);
                    return (
                      <tr key={form._id}>
                        <td>
                          <span className="type-badge">
                            {form.type}
                          </span>
                        </td>
                        <td>
                          <div className="title-cell">
                            <strong>{form.title?.[language] || form.title?.en}</strong>
                            <small>{form.linkedItem?.title?.[language] || form.linkedItem?.title?.en}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${getRoleColor(form.role)}`}>
                            {form.role}
                          </span>
                        </td>
                        <td>{new Date(form.startDate).toLocaleDateString()}</td>
                        <td>{new Date(form.endDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadge(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <span className="response-count">
                            {form.responses?.length || 0}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEditForm(form)}
                              title={language === 'ta' ? 'திருத்து' : 'Edit'}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn-action btn-responses"
                              onClick={() => handleViewResponses(form)}
                              title={language === 'ta' ? 'பதில்களைப் பார்' : 'View Responses'}
                            >
                              <i className="fas fa-chart-bar"></i>
                            </button>
                            <a
                              href={`/recruitment-responses?formId=${form._id}`}
                              className="btn-action btn-navigate"
                              title={language === 'ta' ? 'பதில்கள் பக்கத்திற்குச் செல்லவும்' : 'Go to Responses Page'}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fas fa-external-link-alt"></i>
                            </a>
                            <button
                              className="btn-action btn-export"
                              onClick={() => window.open(`/api/admin/recruitment/${form._id}/responses?export=csv`, '_blank')}
                              title={language === 'ta' ? 'CSV ஏற்றுமதி' : 'Export CSV'}
                            >
                              <i className="fas fa-download"></i>
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteForm(form._id)}
                              title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showResponseDashboard && (
        <div className="modal-overlay" onClick={() => setShowResponseDashboard(false)}>
          <div className="modal-content response-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{language === 'ta' ? 'படிவ பதில்கள்' : 'Form Responses'}</h2>
              <button 
                className="btn-close" 
                onClick={() => {
                  setShowResponseDashboard(false);
                  setSelectedFormForResponses(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <ResponseDashboard
                formId={selectedFormForResponses?._id}
                language={language}
                getText={getText}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
          max-width: 1200px;
          width: 95%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        }

        .modal-content.response-modal {
          max-width: 1400px;
          width: 98%;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .btn-close {
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-size: 1.25rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          color: #374151;
          background: #f3f4f6;
        }

        .modal-body {
          overflow-y: auto;
          max-height: calc(90vh - 80px);
        }
        .admin-section {
          background: var(--bg-primary, #ffffff);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .section-header {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .tab-btn {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tab-btn:hover {
          color: #3b82f6;
          background: #f3f4f6;
        }

        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background: #eff6ff;
        }

        .entity-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: #f8fafc;
          padding: 0.5rem;
          border-radius: 0.75rem;
        }

        .entity-tab {
          flex: 1;
          padding: 1rem;
          background: none;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .entity-tab:hover {
          background: #e2e8f0;
          color: #475569;
        }

        .entity-tab.active {
          background: #3b82f6;
          color: white;
        }

        .count {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .entity-tab.active .count {
          background: rgba(255, 255, 255, 0.3);
        }

        .entity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .entity-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .entity-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .entity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .entity-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .entity-type {
          background: #ddd6fe;
          color: #7c3aed;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .entity-description {
          margin-bottom: 1.5rem;
        }

        .entity-description p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .existing-forms {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .existing-forms h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .form-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .form-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .form-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit, .btn-delete {
          padding: 0.5rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .btn-edit {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .btn-edit:hover {
          background: #bfdbfe;
        }

        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .recruitment-actions h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .role-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .role-btn {
          flex: 1;
          min-width: 120px;
          padding: 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .role-btn:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .role-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .role-btn.has-active {
          background: #10b981;
        }

        .active-indicator {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
        }

        .role-badge, .status-badge, .type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .response-count {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .forms-table-container {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .table-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .table-stats {
          display: flex;
          gap: 1rem;
        }

        .stat {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .forms-table {
          width: 100%;
          border-collapse: collapse;
        }

        .forms-table th,
        .forms-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }

        .forms-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .forms-table tr:hover {
          background: #f9fafb;
        }

        .title-cell strong {
          display: block;
          font-weight: 600;
          color: #1f2937;
        }

        .title-cell small {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-action {
          padding: 0.5rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-responses {
          background: #fef3c7;
          color: #d97706;
        }

        .btn-responses:hover {
          background: #fde68a;
        }

        .btn-export {
          background: #d1fae5;
          color: #059669;
        }

        .btn-export:hover {
          background: #a7f3d0;
        }

        .loading-state {
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

        @media (max-width: 768px) {
          .entity-grid {
            grid-template-columns: 1fr;
          }

          .role-buttons {
            flex-direction: column;
          }

          .role-btn {
            min-width: auto;
          }

          .entity-tabs {
            flex-direction: column;
            gap: 0.5rem;
          }

          .table-wrapper {
            overflow-x: scroll;
          }

          .forms-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default RecruitmentManagement;