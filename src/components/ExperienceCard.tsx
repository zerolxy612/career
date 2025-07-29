import React from 'react';
import { ExperienceCard as ExperienceCardType } from '@/types/card';

interface ExperienceCardProps {
  card?: ExperienceCardType;
  type?: 'real' | 'ai-suggested' | 'create-new';
  title?: string;
  description?: string;
  completionPercentage?: number;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  card,
  type = 'real',
  title,
  description,
  completionPercentage,
  onClick,
  onDelete,
  className = ''
}) => {
  // Handle create new card type
  if (type === 'create-new') {
    return (
      <div 
        className={`experience-card create-new ${className}`}
        style={{
          border: '2px dashed #4285f4',
          borderRadius: '8px',
          padding: '1rem',
          backgroundColor: '#f8faff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={onClick}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f7ff';
          e.currentTarget.style.borderColor = '#1976d2';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#f8faff';
          e.currentTarget.style.borderColor = '#4285f4';
        }}
      >
        <div style={{
          fontSize: '2rem',
          color: '#4285f4',
          marginBottom: '0.5rem'
        }}>
          +
        </div>
        <p style={{
          fontSize: '0.9rem',
          color: '#4285f4',
          textAlign: 'center',
          margin: 0,
          fontWeight: '500'
        }}>
          {title || 'Create New Experience Card'}
        </p>
      </div>
    );
  }

  // Use card data if provided, otherwise use individual props
  const cardTitle = card?.cardPreview?.experienceName || title || 'Untitled Experience';
  const cardDescription = card?.cardPreview?.oneSentenceSummary || description || 'No description available';
  const completion = completionPercentage ?? (card ? getCompletionPercentage(card.completionLevel) : 0);

  // 🔧 FIX: Correct card type determination logic
  const cardType = card?.source?.type === 'user_input' ? 'real' : 'ai-suggested';

  return (
    <div
      className={`experience-card ${cardType} ${className}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#f0f5ff',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onClick={onClick}
      onMouseOver={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = '#e6f2ff';
          e.currentTarget.style.borderColor = '#d1d5db';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#f0f5ff';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      {/* Completion Progress Bar */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        left: '0.75rem',
        backgroundColor: '#e5e7eb',
        borderRadius: '12px',
        height: '20px',
        width: '60px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${completion}%`,
          backgroundColor: getCompletionColor(completion),
          borderRadius: '12px',
          transition: 'width 0.3s ease'
        }} />
        <span style={{
          position: 'relative',
          fontSize: '0.7rem',
          fontWeight: '600',
          color: completion > 50 ? 'white' : '#374151',
          zIndex: 1
        }}>
          {completion}%
        </span>
      </div>

      {/* Delete Button */}
      {onDelete && (
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            width: '20px',
            height: '20px',
            backgroundColor: '#4285f4',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1976d2';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#4285f4';
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/>
          </svg>
        </div>
      )}

      {/* Card Title */}
      <h5 style={{
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#4285f4',
        margin: '2rem 0 0.5rem 0',
        lineHeight: '1.2'
      }}>
        {cardTitle}
      </h5>

      {/* Card Description */}
      <p style={{
        fontSize: '0.8rem',
        color: '#666',
        margin: 0,
        lineHeight: '1.4'
      }}>
        {cardDescription}
      </p>

      {/* Time and Location (if available) */}
      {card?.cardPreview?.timeAndLocation && (
        <p style={{
          fontSize: '0.7rem',
          color: '#999',
          margin: '0.5rem 0 0 0',
          fontStyle: 'italic'
        }}>
          {card.cardPreview.timeAndLocation}
        </p>
      )}
    </div>
  );
};

// Helper function to get completion percentage from completion level
function getCompletionPercentage(completionLevel: string): number {
  switch (completionLevel) {
    case 'complete':
      return 100;
    case 'partial':
      return 60;
    case 'incomplete':
    default:
      return 20;
  }
}

// Helper function to get completion color based on percentage
function getCompletionColor(percentage: number): string {
  if (percentage >= 70) {
    return '#10b981'; // Green (70%+)
  } else if (percentage >= 30) {
    return '#f59e0b'; // Yellow (30-70%)
  } else {
    return '#ef4444'; // Red (0-30%)
  }
}

export default ExperienceCard;
