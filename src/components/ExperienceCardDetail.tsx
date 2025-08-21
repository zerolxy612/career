import React, { useState, useEffect } from 'react';

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
  _cardId?: string; // Internal field to track which card is being edited
  _placeholderHints?: {
    experienceName?: string;
    oneSentenceSummary?: string;
    backgroundContext?: string;
    myRoleAndTasks?: string;
    taskDetails?: string;
    reflectionAndResults?: string;
    highlightSentence?: string;
  }; // AI建议的灰色提示文本
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

  // Update formData when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        console.log('🔄 [ExperienceCardDetail] Updating formData with initialData:', initialData);
        setFormData(initialData);
      } else {
        console.log('🆕 [ExperienceCardDetail] Creating new card - resetting formData');
        setFormData({
          experienceName: '',
          locationAndTime: '',
          scenarioIntroduction: '',
          myRole: '',
          eventProcess: '',
          reflection: '',
          oneLineHighlight: ''
        });
      }
      // Reset editing field when modal opens
      setEditingField(null);
    }
  }, [initialData, isOpen]);

  // Calculate completion percentage
  const calculateCompletionPercentage = (data: ExperienceDetailData): number => {
    // Exclude _cardId from calculation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _cardId, ...fieldsToCheck } = data;
    const fields = Object.values(fieldsToCheck).filter(field => typeof field === 'string');

    // Filter out empty fields and placeholder text
    const filledFields = fields.filter(field => {
      if (!field || field.trim().length === 0) return false;

      // Check for placeholder patterns
      const trimmedField = field.trim();
      const isPlaceholder =
        trimmedField.includes('[') && trimmedField.includes('待补充]') ||
        trimmedField.includes('[') && trimmedField.includes('信息缺失]') ||
        trimmedField.includes('信息缺失') ||
        trimmedField.includes('结果信息缺失') ||
        trimmedField.includes('时间地点信息缺失') ||
        trimmedField === '[待补充]' ||
        trimmedField === '[信息缺失]' ||
        trimmedField.startsWith('（例如：') || // AI推测的占位符文本
        trimmedField.includes('(AI建议可输入内容)'); // AI建议标识

      return !isPlaceholder;
    });

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
    console.log('💾 [ExperienceCardDetail] Saving formData:', formData);
    console.log('💾 [ExperienceCardDetail] Card ID in formData:', formData._cardId);
    onSave(formData);
    onClose();
  };

  const renderField = (
    fieldName: keyof ExperienceDetailData,
    label: string,
    placeholder: string,
    isTextarea: boolean = false,
    hintKey?: string
  ) => {
    const isEditing = editingField === fieldName;
    const value = formData[fieldName];

    // 获取AI建议的灰色提示文本
    const aiHint = hintKey && formData._placeholderHints ? formData._placeholderHints[hintKey as keyof typeof formData._placeholderHints] : undefined;
    const displayPlaceholder = aiHint || placeholder;
    const isAIHint = !!aiHint;

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
              placeholder={displayPlaceholder}
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
              placeholder={displayPlaceholder}
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
            color: value ? '#374151' : (isAIHint ? '#999' : '#9ca3af'),
            lineHeight: '1.5',
            minHeight: '1.2rem',
            whiteSpace: 'pre-wrap'
          }}>
            {/* 🔧 SIMPLIFIED: 现在AI推测卡片的字段都是空的，直接显示placeholder */}
            {value || displayPlaceholder}
            {!value && isAIHint && (
              <span style={{
                color: '#bbb',
                fontSize: '0.8rem',
                fontStyle: 'italic',
                marginLeft: '0.5rem'
              }}>
                (AI建议可输入内容)
              </span>
            )}
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
          {renderField('experienceName', 'Experience Name:', 'Enter experience name...', false, 'experienceName')}
          {renderField('locationAndTime', 'Location & Time:', 'e.g., Beijing | July 2024 - September 2024', false, 'timeAndLocation')}
          {renderField('scenarioIntroduction', 'Scenario Introduction:', 'Describe the background and context...', true, 'backgroundContext')}
          {renderField('myRole', 'My Role:', 'Describe your role and responsibilities...', true, 'myRoleAndTasks')}
          {renderField('eventProcess', 'Event Summary:', 'Detail the process and tasks you completed...', true, 'taskDetails')}
          {renderField('reflection', 'Personal Reflection & Outcome Summary:', 'Summarize your learnings, experiences and achievements...', true, 'reflectionAndResults')}
          {renderField('oneLineHighlight', 'One-line Highlight:', 'Summarize the most impactful or memorable aspect in one sentence...', false, 'highlightSentence')}
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
