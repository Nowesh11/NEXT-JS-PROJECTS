import { useState, useEffect } from 'react';

const FormBuilder = ({ entity, role, editingForm, onSave, onCancel, language, getText }) => {
  const [formData, setFormData] = useState({
    type: entity?.type || 'project',
    linkedId: entity?._id || '',
    title: { en: '', ta: '' },
    description: { en: '', ta: '' },
    role: role || 'crew',
    startDate: '',
    endDate: '',
    fields: [],
    settings: {
      allowMultipleSubmissions: false,
      requireLogin: true,
      showProgressBar: true,
      confirmationMessage: { en: 'Thank you for your submission!', ta: 'உங்கள் சமர்ப்பணத்திற்கு நன்றி!' }
    }
  });

  const [activeFieldIndex, setActiveFieldIndex] = useState(null);
  const [showFieldTypes, setShowFieldTypes] = useState(false);

  const fieldTypes = [
    { type: 'short-text', icon: 'fas fa-font', label: { en: 'Short Text', ta: 'குறுகிய உரை' } },
    { type: 'paragraph', icon: 'fas fa-align-left', label: { en: 'Paragraph', ta: 'பத்தி' } },
    { type: 'dropdown', icon: 'fas fa-chevron-down', label: { en: 'Dropdown', ta: 'கீழ்விழும் பட்டியல்' } },
    { type: 'multiple-choice', icon: 'fas fa-list-ul', label: { en: 'Multiple Choice', ta: 'பல தேர்வு' } },
    { type: 'checkboxes', icon: 'fas fa-check-square', label: { en: 'Checkboxes', ta: 'தேர்வுப்பெட்டிகள்' } },
    { type: 'date', icon: 'fas fa-calendar', label: { en: 'Date', ta: 'தேதி' } },
    { type: 'file-upload', icon: 'fas fa-upload', label: { en: 'File Upload', ta: 'கோப்பு பதிவேற்றம்' } },
    { type: 'section-break', icon: 'fas fa-minus', label: { en: 'Section Break', ta: 'பிரிவு இடைவெளி' } }
  ];

  useEffect(() => {
    if (editingForm) {
      setFormData({
        ...editingForm,
        startDate: editingForm.startDate ? new Date(editingForm.startDate).toISOString().slice(0, 16) : '',
        endDate: editingForm.endDate ? new Date(editingForm.endDate).toISOString().slice(0, 16) : ''
      });
    } else if (entity && role) {
      const roleLabels = {
        crew: { en: 'Crew Recruitment', ta: 'பணியாளர் சேர்க்கை' },
        participant: { en: 'Participant Recruitment', ta: 'பங்கேற்பாளர் சேர்க்கை' },
        volunteer: { en: 'Volunteer Recruitment', ta: 'தன்னார்வலர் சேர்க்கை' }
      };

      setFormData(prev => ({
        ...prev,
        type: entity.type || 'project',
        linkedId: entity._id,
        title: roleLabels[role] || roleLabels.crew,
        description: {
          en: `Join us as a ${role} for ${entity.title?.en || entity.title}`,
          ta: `${entity.title?.ta || entity.title?.en || entity.title} க்கு ${role === 'crew' ? 'பணியாளராக' : role === 'participant' ? 'பங்கேற்பாளராக' : 'தன்னார்வலராக'} சேருங்கள்`
        },
        role
      }));
    }
  }, [editingForm, entity, role]);

  const addField = (fieldType) => {
    const newField = {
      id: Date.now().toString(),
      type: fieldType,
      label: { en: '', ta: '' },
      required: false,
      placeholder: { en: '', ta: '' },
      description: { en: '', ta: '' }
    };

    // Add type-specific properties
    if (['dropdown', 'multiple-choice', 'checkboxes'].includes(fieldType)) {
      newField.options = { en: [''], ta: [''] };
    }

    if (fieldType === 'file-upload') {
      newField.acceptedTypes = ['.pdf', '.doc', '.docx'];
      newField.maxSize = 5; // MB
      newField.uploadPath = `uploads/recruitments/${formData.linkedId}/`;
    }

    if (fieldType === 'section-break') {
      newField.title = { en: 'Section Title', ta: 'பிரிவு தலைப்பு' };
      newField.description = { en: 'Section description', ta: 'பிரிவு விளக்கம்' };
    }

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));

    setActiveFieldIndex(formData.fields.length);
    setShowFieldTypes(false);
  };

  const updateField = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteField = (index) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
    setActiveFieldIndex(null);
  };

  const moveField = (index, direction) => {
    const newFields = [...formData.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFormData(prev => ({ ...prev, fields: newFields }));
      setActiveFieldIndex(targetIndex);
    }
  };

  const addOption = (fieldIndex, language) => {
    updateField(fieldIndex, {
      options: {
        ...formData.fields[fieldIndex].options,
        [language]: [...formData.fields[fieldIndex].options[language], '']
      }
    });
  };

  const updateOption = (fieldIndex, optionIndex, language, value) => {
    const newOptions = [...formData.fields[fieldIndex].options[language]];
    newOptions[optionIndex] = value;
    
    updateField(fieldIndex, {
      options: {
        ...formData.fields[fieldIndex].options,
        [language]: newOptions
      }
    });
  };

  const removeOption = (fieldIndex, optionIndex, language) => {
    const newOptions = formData.fields[fieldIndex].options[language].filter((_, i) => i !== optionIndex);
    
    updateField(fieldIndex, {
      options: {
        ...formData.fields[fieldIndex].options,
        [language]: newOptions
      }
    });
  };

  const handleSave = () => {
    // Validation
    if (!formData.title.en.trim()) {
      alert('Please enter a title in English');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert('Please set start and end dates');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('End date must be after start date');
      return;
    }

    if (formData.fields.length === 0) {
      alert('Please add at least one field to the form');
      return;
    }

    // Validate fields
    for (let i = 0; i < formData.fields.length; i++) {
      const field = formData.fields[i];
      if (!field.label.en.trim() && field.type !== 'section-break') {
        alert(`Please enter a label for field ${i + 1}`);
        return;
      }

      if (['dropdown', 'multiple-choice', 'checkboxes'].includes(field.type)) {
        if (!field.options.en.some(opt => opt.trim())) {
          alert(`Please add at least one option for field "${field.label.en}"`);
          return;
        }
      }
    }

    // Convert dates to ISO format
    const saveData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      status: 'active'
    };

    onSave(saveData);
  };

  const renderFieldEditor = (field, index) => {
    const isActive = activeFieldIndex === index;

    return (
      <div key={field.id} className={`field-editor ${isActive ? 'active' : ''}`}>
        <div className="field-header" onClick={() => setActiveFieldIndex(isActive ? null : index)}>
          <div className="field-info">
            <i className={fieldTypes.find(ft => ft.type === field.type)?.icon || 'fas fa-question'}></i>
            <span className="field-label">
              {field.label?.[language] || field.label?.en || field.title?.[language] || field.title?.en || `${field.type} field`}
            </span>
            {field.required && <span className="required-indicator">*</span>}
          </div>
          <div className="field-actions">
            <button
              type="button"
              className="btn-move"
              onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }}
              disabled={index === 0}
            >
              <i className="fas fa-chevron-up"></i>
            </button>
            <button
              type="button"
              className="btn-move"
              onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }}
              disabled={index === formData.fields.length - 1}
            >
              <i className="fas fa-chevron-down"></i>
            </button>
            <button
              type="button"
              className="btn-delete"
              onClick={(e) => { e.stopPropagation(); deleteField(index); }}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        {isActive && (
          <div className="field-config">
            {field.type === 'section-break' ? (
              <>
                <div className="form-group">
                  <label>Section Title</label>
                  <div className="bilingual-input">
                    <input
                      type="text"
                      placeholder="English title"
                      value={field.title?.en || ''}
                      onChange={(e) => updateField(index, {
                        title: { ...field.title, en: e.target.value }
                      })}
                    />
                    <input
                      type="text"
                      placeholder="Tamil title"
                      value={field.title?.ta || ''}
                      onChange={(e) => updateField(index, {
                        title: { ...field.title, ta: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Section Description</label>
                  <div className="bilingual-input">
                    <textarea
                      placeholder="English description"
                      value={field.description?.en || ''}
                      onChange={(e) => updateField(index, {
                        description: { ...field.description, en: e.target.value }
                      })}
                    />
                    <textarea
                      placeholder="Tamil description"
                      value={field.description?.ta || ''}
                      onChange={(e) => updateField(index, {
                        description: { ...field.description, ta: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Field Label</label>
                  <div className="bilingual-input">
                    <input
                      type="text"
                      placeholder="English label"
                      value={field.label?.en || ''}
                      onChange={(e) => updateField(index, {
                        label: { ...field.label, en: e.target.value }
                      })}
                    />
                    <input
                      type="text"
                      placeholder="Tamil label"
                      value={field.label?.ta || ''}
                      onChange={(e) => updateField(index, {
                        label: { ...field.label, ta: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <div className="bilingual-input">
                    <textarea
                      placeholder="English description"
                      value={field.description?.en || ''}
                      onChange={(e) => updateField(index, {
                        description: { ...field.description, en: e.target.value }
                      })}
                    />
                    <textarea
                      placeholder="Tamil description"
                      value={field.description?.ta || ''}
                      onChange={(e) => updateField(index, {
                        description: { ...field.description, ta: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {['short-text', 'paragraph'].includes(field.type) && (
                  <div className="form-group">
                    <label>Placeholder</label>
                    <div className="bilingual-input">
                      <input
                        type="text"
                        placeholder="English placeholder"
                        value={field.placeholder?.en || ''}
                        onChange={(e) => updateField(index, {
                          placeholder: { ...field.placeholder, en: e.target.value }
                        })}
                      />
                      <input
                        type="text"
                        placeholder="Tamil placeholder"
                        value={field.placeholder?.ta || ''}
                        onChange={(e) => updateField(index, {
                          placeholder: { ...field.placeholder, ta: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                )}

                {['dropdown', 'multiple-choice', 'checkboxes'].includes(field.type) && (
                  <div className="form-group">
                    <label>Options</label>
                    <div className="options-editor">
                      {['en', 'ta'].map(lang => (
                        <div key={lang} className="language-options">
                          <h4>{lang === 'en' ? 'English' : 'Tamil'}</h4>
                          {field.options?.[lang]?.map((option, optIndex) => (
                            <div key={optIndex} className="option-input">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, lang, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              <button
                                type="button"
                                className="btn-remove-option"
                                onClick={() => removeOption(index, optIndex, lang)}
                                disabled={field.options[lang].length <= 1}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn-add-option"
                            onClick={() => addOption(index, lang)}
                          >
                            <i className="fas fa-plus"></i> Add Option
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {field.type === 'file-upload' && (
                  <>
                    <div className="form-group">
                      <label>Accepted File Types</label>
                      <input
                        type="text"
                        value={field.acceptedTypes?.join(', ') || ''}
                        onChange={(e) => updateField(index, {
                          acceptedTypes: e.target.value.split(',').map(t => t.trim())
                        })}
                        placeholder=".pdf, .doc, .docx, .jpg, .png"
                      />
                    </div>
                    <div className="form-group">
                      <label>Max File Size (MB)</label>
                      <input
                        type="number"
                        value={field.maxSize || 5}
                        onChange={(e) => updateField(index, {
                          maxSize: parseInt(e.target.value) || 5
                        })}
                        min="1"
                        max="50"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    Required field
                  </label>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="form-builder">
      <div className="builder-header">
        <div className="header-info">
          <h2>
            {editingForm ? 
              (language === 'ta' ? 'படிவத்தைத் திருத்து' : 'Edit Form') : 
              (language === 'ta' ? 'புதிய படிவம் உருவாக்கு' : 'Create New Form')
            }
          </h2>
          <p>
            {entity?.title?.[language] || entity?.title?.en || entity?.title} - 
            <span className="role-indicator">{role}</span>
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <i className="fas fa-times"></i>
            {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
          </button>
          <button type="button" className="btn-save" onClick={handleSave}>
            <i className="fas fa-save"></i>
            {language === 'ta' ? 'சேமி' : 'Save'}
          </button>
        </div>
      </div>

      <div className="builder-content">
        <div className="form-settings">
          <h3>{language === 'ta' ? 'படிவ அமைப்புகள்' : 'Form Settings'}</h3>
          
          <div className="form-group">
            <label>Form Title</label>
            <div className="bilingual-input">
              <input
                type="text"
                placeholder="English title"
                value={formData.title.en}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  title: { ...prev.title, en: e.target.value }
                }))}
              />
              <input
                type="text"
                placeholder="Tamil title"
                value={formData.title.ta}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  title: { ...prev.title, ta: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <div className="bilingual-input">
              <textarea
                placeholder="English description"
                value={formData.description.en}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, en: e.target.value }
                }))}
              />
              <textarea
                placeholder="Tamil description"
                value={formData.description.ta}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, ta: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Form Settings</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.settings.allowMultipleSubmissions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, allowMultipleSubmissions: e.target.checked }
                  }))}
                />
                Allow multiple submissions
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.settings.requireLogin}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, requireLogin: e.target.checked }
                  }))}
                />
                Require user login
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.settings.showProgressBar}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, showProgressBar: e.target.checked }
                  }))}
                />
                Show progress bar
              </label>
            </div>
          </div>
        </div>

        <div className="form-fields">
          <div className="fields-header">
            <h3>{language === 'ta' ? 'படிவ புலங்கள்' : 'Form Fields'}</h3>
            <button
              type="button"
              className="btn-add-field"
              onClick={() => setShowFieldTypes(!showFieldTypes)}
            >
              <i className="fas fa-plus"></i>
              {language === 'ta' ? 'புலம் சேர்' : 'Add Field'}
            </button>
          </div>

          {showFieldTypes && (
            <div className="field-types">
              {fieldTypes.map(fieldType => (
                <button
                  key={fieldType.type}
                  className="field-type-btn"
                  onClick={() => addField(fieldType.type)}
                >
                  <i className={fieldType.icon}></i>
                  <span>{fieldType.label[language] || fieldType.label.en}</span>
                </button>
              ))}
            </div>
          )}

          <div className="fields-list">
            {formData.fields.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-plus-circle"></i>
                <p>{language === 'ta' ? 'படிவத்தில் புலங்களைச் சேர்க்கத் தொடங்குங்கள்' : 'Start adding fields to your form'}</p>
              </div>
            ) : (
              formData.fields.map((field, index) => renderFieldEditor(field, index))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-builder {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .builder-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .header-info h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .header-info p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .role-indicator {
          background: #ddd6fe;
          color: #7c3aed;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          margin-left: 0.5rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-cancel, .btn-save {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-save {
          background: #3b82f6;
          color: white;
        }

        .btn-save:hover {
          background: #2563eb;
        }

        .builder-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .form-settings {
          width: 350px;
          padding: 2rem;
          border-right: 1px solid #e5e7eb;
          overflow-y: auto;
          background: #fafbfc;
        }

        .form-settings h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-row .form-group {
          flex: 1;
        }

        .bilingual-input {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bilingual-input input,
        .bilingual-input textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }

        .bilingual-input input:first-child::placeholder,
        .bilingual-input textarea:first-child::placeholder {
          color: #3b82f6;
        }

        .bilingual-input input:last-child::placeholder,
        .bilingual-input textarea:last-child::placeholder {
          color: #f59e0b;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: normal;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }

        .form-fields {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .fields-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .fields-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .btn-add-field {
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

        .btn-add-field:hover {
          background: #059669;
        }

        .field-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .field-type-btn {
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .field-type-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #3b82f6;
        }

        .field-type-btn i {
          font-size: 1.25rem;
        }

        .field-type-btn span {
          font-size: 0.875rem;
          font-weight: 500;
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

        .field-editor {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .field-editor.active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .field-header {
          padding: 1rem 1.5rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .field-editor.active .field-header {
          background: #eff6ff;
        }

        .field-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .field-info i {
          color: #6b7280;
          width: 16px;
        }

        .field-label {
          font-weight: 500;
          color: #374151;
        }

        .required-indicator {
          color: #ef4444;
          font-weight: 600;
        }

        .field-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-move, .btn-delete {
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

        .btn-move {
          background: #f3f4f6;
          color: #6b7280;
        }

        .btn-move:hover:not(:disabled) {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-move:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .field-config {
          padding: 1.5rem;
        }

        .options-editor {
          display: flex;
          gap: 1.5rem;
        }

        .language-options {
          flex: 1;
        }

        .language-options h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .option-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .option-input input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
        }

        .btn-remove-option {
          padding: 0.5rem;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-remove-option:hover:not(:disabled) {
          background: #fecaca;
        }

        .btn-remove-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-add-option {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px dashed #d1d5db;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          justify-content: center;
        }

        .btn-add-option:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        @media (max-width: 1024px) {
          .builder-content {
            flex-direction: column;
          }

          .form-settings {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }

          .options-editor {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FormBuilder;