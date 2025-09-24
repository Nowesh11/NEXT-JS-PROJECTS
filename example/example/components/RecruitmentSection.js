import { useState, useEffect } from 'react';

const RecruitmentSection = ({ entityId, entityType, language = 'en' }) => {
  const [activeForms, setActiveForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (entityId && entityType) {
      fetchActiveForms();
    }
  }, [entityId, entityType, language]);

  const fetchActiveForms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recruitment/active?type=${entityType}&linkedId=${entityId}&language=${language}`);
      if (response.ok) {
        const data = await response.json();
        // Enhance forms with additional status information
        const enhancedForms = (data.forms || []).map(form => {
          const now = new Date();
          const endDate = new Date(form.endDate);
          const startDate = new Date(form.startDate);
          
          let dynamicStatus = form.status;
          if (now > endDate) {
            dynamicStatus = 'expired';
          } else if (now < startDate) {
            dynamicStatus = 'upcoming';
          } else {
            dynamicStatus = 'active';
          }
          
          return {
            ...form,
            dynamicStatus,
            daysLeft: Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))),
            responseCount: form.responseCount || 0,
            spotsLeft: form.responseLimit ? Math.max(0, form.responseLimit - (form.responseCount || 0)) : null
          };
        });
        setActiveForms(enhancedForms);
      } else {
        console.error('Failed to fetch active forms');
      }
    } catch (error) {
      console.error('Error fetching active forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRecruitmentForm = async (form) => {
    try {
      // Fetch full form details
      const response = await fetch(`/api/recruitment/${form._id}?language=${language}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedForm(data.form);
        setShowFormModal(true);
        // Initialize form data
        const initialData = {};
        data.form.fields?.forEach(field => {
          if (field.type !== 'section-break') {
            initialData[field.id] = field.type === 'checkboxes' ? [] : '';
          }
        });
        setFormData(initialData);
      } else {
        showNotification('Failed to load form details', 'error');
      }
    } catch (error) {
      console.error('Error loading form:', error);
      showNotification('Error loading form', 'error');
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setSelectedForm(null);
    setFormData({});
  };

  const handleInputChange = (fieldId, value, fieldType) => {
    setFormData(prev => {
      if (fieldType === 'checkboxes') {
        const currentValues = prev[fieldId] || [];
        if (currentValues.includes(value)) {
          return { ...prev, [fieldId]: currentValues.filter(v => v !== value) };
        } else {
          return { ...prev, [fieldId]: [...currentValues, value] };
        }
      }
      return { ...prev, [fieldId]: value };
    });
  };

  const handleFileChange = (fieldId, file) => {
    setFormData(prev => ({ ...prev, [fieldId]: file }));
  };

  const validateForm = () => {
    const errors = [];
    
    selectedForm.fields?.forEach(field => {
      if (field.required && field.type !== 'section-break') {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors.push(`${field.label?.[language] || field.label?.en} is required`);
        }
      }
    });
    
    return errors;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showNotification(validationErrors[0], 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      
      // Add form answers
      const answers = [];
      selectedForm.fields?.forEach(field => {
        if (field.type !== 'section-break') {
          const value = formData[field.id];
          if (value !== undefined && value !== '') {
            if (field.type === 'file-upload' && value instanceof File) {
              submitData.append(`file_${field.id}`, value);
              answers.push({ fieldId: field.id, value: value.name });
            } else {
              answers.push({ fieldId: field.id, value });
            }
          }
        }
      });
      
      submitData.append('answers', JSON.stringify(answers));
      
      const response = await fetch(`/api/recruitment/${selectedForm._id}/submit`, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification(
          language === 'ta' ? 'உங்கள் விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : 'Your application has been submitted successfully!',
          'success'
        );
        closeFormModal();
      } else {
        showNotification(result.error || 'Failed to submit application', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('Error submitting application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const getRoleIcon = (role) => {
    const icons = {
      crew: 'fas fa-users',
      volunteer: 'fas fa-hands-helping',
      participant: 'fas fa-user-plus'
    };
    return icons[role] || 'fas fa-user-plus';
  };

  const getRoleText = (role) => {
    const texts = {
      en: {
        crew: 'Join as Crew',
        volunteer: 'Volunteer',
        participant: 'Participate'
      },
      ta: {
        crew: 'குழுவில் சேர',
        volunteer: 'தன்னார்வலர்',
        participant: 'பங்கேற்க'
      }
    };
    return texts[language]?.[role] || texts.en[role] || 'Join';
  };

  const getStatusText = (status) => {
    const texts = {
      en: {
        active: 'Open for applications',
        upcoming: 'Opening soon',
        expired: 'Applications closed'
      },
      ta: {
        active: 'விண்ணப்பங்களுக்கு திறந்துள்ளது',
        upcoming: 'விரைவில் திறக்கும்',
        expired: 'விண்ணப்பங்கள் மூடப்பட்டுள்ளன'
      }
    };
    return texts[language]?.[status] || texts.en[status] || status;
  };

  const renderField = (field) => {
    const label = field.label?.[language] || field.label?.en;
    const placeholder = field.placeholder?.[language] || field.placeholder?.en;
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'section-break':
        return (
          <div key={field.id} className="section-break">
            <h4>{label}</h4>
            {field.description?.[language] && (
              <p className="section-description">{field.description[language]}</p>
            )}
          </div>
        );

      case 'short-text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="form-group">
            <label>
              {label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
              placeholder={placeholder}
              required={field.required}
              className="form-control"
            />
          </div>
        );

      case 'long-text':
        return (
          <div key={field.id} className="form-group">
            <label>
              {label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
              placeholder={placeholder}
              required={field.required}
              className="form-control"
              rows={4}
            />
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.id} className="form-group">
            <label>
              {label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
              required={field.required}
              className="form-control"
            >
              <option value="">{language === 'ta' ? 'தேர்ந்தெடுக்கவும்' : 'Select an option'}</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option[language] || option.en}>
                  {option[language] || option.en}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiple-choice':
        return (
          <div key={field.id} className="form-group">
            <label>
              {label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="radio-group">
              {field.options?.map((option, index) => (
                <label key={index} className="radio-option">
                  <input
                    type="radio"
                    name={field.id}
                    value={option[language] || option.en}
                    checked={value === (option[language] || option.en)}
                    onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
                    required={field.required}
                  />
                  <span>{option[language] || option.en}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'checkboxes':
        return (
          <div key={field.id} className="form-group">
            <label>
              {label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="checkbox-group">
              {field.options?.map((option, index) => (
                <label key={index} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option[language] || option.en}
                    checked={(value || []).includes(option[language] || option.en)}
                    onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
                  />
                  <span>{option[language] || option.en}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="form-group">
            <label>
              {label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
              required={field.required}
              className="form-control"
            />
          </div>
        );

      case 'file-upload':
        return (
          <div key={field.id} className="form-group">
            <label>
              {label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange(field.id, e.target.files[0])}
              required={field.required}
              className="form-control"
              accept={field.acceptedTypes?.join(',')}
            />
            {field.maxSize && (
              <small className="file-info">
                {language === 'ta' ? 'அதிகபட்ச அளவு' : 'Max size'}: {field.maxSize}MB
              </small>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="recruitment-loading">
        <div className="spinner"></div>
        <p>{language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading recruitment opportunities...'}</p>
      </div>
    );
  }

  if (activeForms.length === 0) {
    return null; // Don't show section if no active forms
  }

  return (
    <>
      <section className="recruitment-section">
        <div className="container">
          <div className="section-header">
            <h2>{language === 'ta' ? 'சேர்க்கை வாய்ப்புகள்' : 'Join Our Team'}</h2>
            <p>{language === 'ta' ? 'எங்கள் குழுவில் சேர்ந்து தமிழ் கலாச்சார பாதுகாப்பில் பங்களிக்கவும்' : 'Be part of our mission to preserve and promote Tamil culture'}</p>
          </div>
          
          <div className="recruitment-grid">
            {activeForms.map((form) => (
              <div key={form._id} className={`recruitment-card ${form.status}`}>
                <div className="card-header">
                  <div className="role-icon">
                    <i className={getRoleIcon(form.role)}></i>
                  </div>
                  <h3>{form.title?.[language] || form.title?.en}</h3>
                  <span className={`status-badge ${form.dynamicStatus}`}>
                    {getStatusText(form.dynamicStatus)}
                  </span>
                  {form.dynamicStatus === 'active' && form.daysLeft <= 7 && (
                    <span className="urgency-badge">
                      <i className="fas fa-clock"></i>
                      {form.daysLeft === 0 ? (language === 'ta' ? 'இன்று கடைசி நாள்!' : 'Last day!') : 
                       `${form.daysLeft} ${language === 'ta' ? 'நாட்கள் மீதம்' : 'days left'}`}
                    </span>
                  )}
                </div>
                
                <div className="card-body">
                  <p>{form.description?.[language] || form.description?.en}</p>
                  
                  {form.requirements && (
                    <div className="requirements">
                      <h4>{language === 'ta' ? 'தேவைகள்' : 'Requirements'}:</h4>
                      <ul>
                        {form.requirements[language]?.map((req, index) => (
                          <li key={index}>{req}</li>
                        )) || form.requirements.en?.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="form-meta">
                    {form.responseLimit && (
                      <span className="meta-item">
                        <i className="fas fa-users"></i>
                        {language === 'ta' ? 'இடங்கள்' : 'Positions'}: {form.spotsLeft}/{form.responseLimit}
                        {form.spotsLeft === 0 && <span className="full-badge">{language === 'ta' ? 'நிரம்பியது' : 'Full'}</span>}
                      </span>
                    )}
                    <span className="meta-item">
                      <i className="fas fa-paper-plane"></i>
                      {language === 'ta' ? 'விண்ணப்பங்கள்' : 'Applications'}: {form.responseCount}
                    </span>
                    <span className="meta-item">
                      <i className="fas fa-calendar"></i>
                      {language === 'ta' ? 'கடைசி தேதி' : 'Deadline'}: {new Date(form.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button
                    className={`apply-btn ${form.dynamicStatus} ${form.spotsLeft === 0 ? 'full' : ''}`}
                    onClick={() => openRecruitmentForm(form)}
                    disabled={form.dynamicStatus !== 'active' || form.spotsLeft === 0}
                  >
                    <i className={getRoleIcon(form.role)}></i>
                    {form.spotsLeft === 0 ? 
                      (language === 'ta' ? 'இடங்கள் நிரம்பியது' : 'Positions Full') :
                      form.dynamicStatus === 'expired' ? 
                        (language === 'ta' ? 'காலாவதியானது' : 'Expired') :
                        form.dynamicStatus === 'upcoming' ?
                          (language === 'ta' ? 'விரைவில்' : 'Coming Soon') :
                          getRoleText(form.role)
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Modal */}
      {showFormModal && selectedForm && (
        <div className="recruitment-modal show">
          <div className="modal-overlay" onClick={closeFormModal}></div>
          <div className="recruitment-modal-content">
            <div className="recruitment-modal-header">
              <h3>
                <i className={getRoleIcon(selectedForm.role)}></i>
                {selectedForm.title?.[language] || selectedForm.title?.en}
              </h3>
              <button className="close-btn" onClick={closeFormModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form className="recruitment-form" onSubmit={submitForm}>
              <div className="recruitment-modal-body">
                {selectedForm.description && (
                  <div className="form-description">
                    <p>{selectedForm.description[language] || selectedForm.description.en}</p>
                  </div>
                )}
                
                {selectedForm.fields?.map(field => renderField(field))}
              </div>
              
              <div className="recruitment-modal-footer">
                <button type="button" className="btn-cancel" onClick={closeFormModal}>
                  {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {language === 'ta' ? 'சமர்ப்பிக்கிறது...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      {language === 'ta' ? 'விண்ணப்பிக்கவும்' : 'Submit Application'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type} show`}>
          <div className="notification-content">
            <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
          <button className="notification-close" onClick={() => setNotification({ show: false, message: '', type: '' })}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <style jsx>{`
        .recruitment-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #4a5568;
          max-width: 600px;
          margin: 0 auto;
        }

        .recruitment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .recruitment-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .recruitment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .recruitment-card.active {
          border-color: #10b981;
        }

        .recruitment-card.upcoming {
          border-color: #3b82f6;
        }

        .recruitment-card.expired {
          border-color: #ef4444;
          opacity: 0.7;
        }

        .card-header {
          padding: 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          text-align: center;
        }

        .role-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          font-size: 1.5rem;
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .urgency-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: #fbbf24;
          color: #92400e;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .full-badge {
          background: #ef4444;
          color: white;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.625rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.upcoming {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-badge.expired {
          background: #fee2e2;
          color: #991b1b;
        }

        .card-body {
          padding: 1.5rem;
        }

        .card-body p {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .requirements {
          margin: 1rem 0;
        }

        .requirements h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .requirements ul {
          list-style: none;
          padding: 0;
        }

        .requirements li {
          padding: 0.25rem 0;
          color: #4a5568;
          font-size: 0.9rem;
          position: relative;
          padding-left: 1.5rem;
        }

        .requirements li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }

        .form-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .card-footer {
          padding: 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .apply-btn {
          width: 100%;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .apply-btn.active {
          background: #10b981;
          color: white;
        }

        .apply-btn.active:hover {
          background: #059669;
        }

        .apply-btn.upcoming {
          background: #3b82f6;
          color: white;
        }

        .apply-btn.expired,
        .apply-btn:disabled {
          background: #9ca3af;
          color: white;
          cursor: not-allowed;
        }

        .apply-btn.full {
          background: #ef4444;
          color: white;
          cursor: not-allowed;
        }

        .apply-btn.full:hover {
          background: #ef4444;
          transform: none;
        }

        .apply-btn.expired:hover,
        .apply-btn:disabled:hover {
          background: #9ca3af;
          transform: none;
        }

        .recruitment-loading {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .recruitment-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .recruitment-modal.show {
          opacity: 1;
          visibility: visible;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .recruitment-modal-content {
          background: white;
          border-radius: 1rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          z-index: 1001;
          display: flex;
          flex-direction: column;
        }

        .recruitment-modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .recruitment-modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .close-btn {
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-size: 1.25rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          color: #374151;
          background: #f3f4f6;
        }

        .recruitment-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .form-description {
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f0f9ff;
          border-radius: 0.5rem;
          border-left: 4px solid #3b82f6;
        }

        .form-description p {
          margin: 0;
          color: #1e40af;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .required {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .section-break {
          margin: 2rem 0;
          padding: 1rem 0;
          border-top: 2px solid #e2e8f0;
        }

        .section-break h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .section-description {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .radio-group,
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .radio-option,
        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s ease;
        }

        .radio-option:hover,
        .checkbox-option:hover {
          background: #f3f4f6;
        }

        .radio-option input,
        .checkbox-option input {
          margin: 0;
        }

        .file-info {
          display: block;
          margin-top: 0.25rem;
          color: #6b7280;
          font-size: 0.75rem;
        }

        .recruitment-modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          background: #f8fafc;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-submit {
          padding: 0.75rem 1.5rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-submit:hover:not(:disabled) {
          background: #059669;
        }

        .btn-submit:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .notification {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 1100;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #10b981;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 300px;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s ease;
        }

        .notification.show {
          opacity: 1;
          transform: translateX(0);
        }

        .notification.error {
          border-left-color: #ef4444;
        }

        .notification.success {
          border-left-color: #10b981;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .notification.success .notification-content i {
          color: #10b981;
        }

        .notification.error .notification-content i {
          color: #ef4444;
        }

        .notification-close {
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .notification-close:hover {
          color: #374151;
          background: #f3f4f6;
        }

        @media (max-width: 768px) {
          .recruitment-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .recruitment-modal-content {
            width: 95%;
            margin: 1rem;
          }

          .form-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .recruitment-modal-footer {
            flex-direction: column;
          }

          .notification {
            right: 1rem;
            left: 1rem;
            min-width: auto;
          }
        }
      `}</style>
    </>
  );
};

export default RecruitmentSection;