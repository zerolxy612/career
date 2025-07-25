import React from 'react';
import { ExperienceCard as ExperienceCardType } from '@/types/card';

interface ExperienceCardProps {
  card?: ExperienceCardType;
  type?: 'real' | 'ai-suggested' | 'create-new';
  title?: string;
  description?: string;
  completionPercentage?: number;
  onClick?: () => void;
  className?: string;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  card,
  type = 'real',
  title,
  description,
  completionPercentage,
  onClick,
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
  const cardType = card?.source?.type === 'ai_generated' ? 'ai-suggested' : type;

  return (
    <div 
      className={`experience-card ${cardType} ${className}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#fafafa',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onClick={onClick}
      onMouseOver={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
          e.currentTarget.style.borderColor = '#d1d5db';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      {/* Completion Badge */}
      <div style={{
        backgroundColor: getCompletionColor(completion),
        color: 'white',
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        display: 'inline-block',
        marginBottom: '0.5rem',
        fontWeight: '500'
      }}>
        {completion}%
      </div>

      {/* Card Type Badge (for AI suggested cards) */}
      {cardType === 'ai-suggested' && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          backgroundColor: '#ff9800',
          color: 'white',
          fontSize: '0.6rem',
          padding: '0.2rem 0.4rem',
          borderRadius: '3px',
          fontWeight: '500'
        }}>
          AI
        </div>
      )}

      {/* Card Title */}
      <h5 style={{
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#4285f4',
        margin: '0 0 0.5rem 0',
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
  if (percentage >= 80) {
    return '#4caf50'; // Green
  } else if (percentage >= 50) {
    return '#ff9800'; // Orange
  } else {
    return '#f44336'; // Red
  }
}

export default ExperienceCard;
