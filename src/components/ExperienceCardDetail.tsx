import React, { useState } from 'react';

interface ExperienceCardDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExperienceDetailData) => void;
  initialData?: ExperienceDetailData;
}

export interface ExperienceDetailData {
  experienceName: string;
  locationAndTime: string;
  scenarioIntroduction: string;
  myRole: string;
  eventProcess: string;
  reflection: string;
  oneLineHighlight: string;
}

export const ExperienceCardDetail: React.FC<ExperienceCardDetailProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<ExperienceDetailData>(
    initialData || {
      experienceName: '',
      locationAndTime: '',
      scenarioIntroduction: '',
      myRole: '',
      eventProcess: '',
      reflection: '',
      oneLineHighlight: ''
    }
  );

  const [editingField, setEditingField] = useState<string | null>(null);

  // Calculate completion percentage
  const calculateCompletionPercentage = (data: ExperienceDetailData): number => {
    const fields = Object.values(data);
    const filledFields = fields.filter(field => field.trim().length > 0);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 70) return '#10b981'; // Green
    if (percentage >= 30) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const completionPercentage = calculateCompletionPercentage(formData);
  const progressColor = getProgressColor(completionPercentage);

  if (!isOpen) return null;

  const handleFieldClick = (fieldName: string) => {
    setEditingField(fieldName);
  };

  const handleFieldChange = (fieldName: keyof ExperienceDetailData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleFieldBlur = () => {
    setEditingField(null);
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const renderField = (
    fieldName: keyof ExperienceDetailData,
    label: string,
    placeholder: string,
    isTextarea: boolean = false
  ) => {
    const isEditing = editingField === fieldName;
    const value = formData[fieldName];

    return (
      <div style={{
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: isEditing ? '#ffffff' : '#f8fafc',
        borderRadius: '8px',
        border: isEditing ? '2px solid #4285f4' : '1px solid #e5e7eb',
        cursor: isEditing ? 'default' : 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => !isEditing && handleFieldClick(fieldName)}
      >
        <h4 style={{
          fontSize: '0.85rem',
          fontWeight: '600',
          color: '#4285f4',
          margin: '0 0 0.75rem 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {label}
        </h4>
        
        {isEditing ? (
          isTextarea ? (
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              onBlur={handleFieldBlur}
              placeholder={placeholder}
              autoFocus
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.9rem',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              onBlur={handleFieldBlur}
              placeholder={placeholder}
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          )
        ) : (
          <div style={{
            fontSize: '0.9rem',
            color: value ? '#374151' : '#9ca3af',
            lineHeight: '1.5',
            minHeight: '1.2rem',
            whiteSpace: 'pre-wrap'
          }}>
            {value || placeholder}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#4285f4',
              margin: 0
            }}>
              Experience Card Details
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              flex: 1,
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${completionPercentage}%`,
                height: '100%',
                backgroundColor: progressColor,
                transition: 'all 0.3s ease'
              }} />
            </div>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: progressColor,
              minWidth: '3rem'
            }}>
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem'
        }}>
          {renderField('experienceName', 'Experience Name:', 'Enter experience name...')}
          {renderField('locationAndTime', 'Location & Time:', 'e.g., Beijing | July 2024 - September 2024')}
          {renderField('scenarioIntroduction', 'Scenario Introduction:', 'Describe the background and context...', true)}
          {renderField('myRole', 'My Role:', 'Describe your role and responsibilities...', true)}
          {renderField('eventProcess', 'Event Summary:', 'Detail the process and tasks you completed...', true)}
          {renderField('reflection', 'Personal Reflection & Outcome Summary:', 'Summarize your learnings, experiences and achievements...', true)}
          {renderField('oneLineHighlight', 'One-line Highlight:', 'Summarize the most impactful or memorable aspect in one sentence...')}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={handleSave}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3367d6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4285f4'}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCardDetail;
