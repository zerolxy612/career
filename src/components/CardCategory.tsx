import React from 'react';
import { CardDirection } from '@/types/card';
import { ExperienceCard } from './ExperienceCard';

interface CardCategoryProps {
  direction: CardDirection;
  onToggle: (directionId: string) => void;
  onCardClick?: (cardId: string) => void;
  onCreateNewCard?: () => void;
  onDeleteCard?: (cardId: string) => void;
  isFirstDirection?: boolean;
}

export const CardCategory: React.FC<CardCategoryProps> = ({
  direction,
  onToggle,
  onCardClick,
  onCreateNewCard,
  onDeleteCard,
  isFirstDirection = false
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{
        backgroundColor: '#eff6ff',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* Direction Header */}
        <div
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
          onClick={() => onToggle(direction.id)}
        >
          {/* Info Icon - positioned absolutely to left */}
          <div style={{
            position: 'absolute',
            left: '1.5rem',
            width: '1.5rem',
            height: '1.5rem',
            backgroundColor: '#333',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            i
          </div>

          {/* Direction Content - centered */}
          <div style={{
            textAlign: 'center',
            flex: 1,
            margin: '0 3rem' // Add margin to account for icons on both sides
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#4285f4',
              margin: '0 0 0.5rem 0',
              letterSpacing: '0.05em'
            }}>
              {direction.title}
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#666',
              margin: 0,
              fontStyle: 'italic'
            }}>
              {direction.subtitle}
            </p>
          </div>

          {/* Expand/Collapse Icon - positioned absolutely to right */}
          <div style={{
            position: 'absolute',
            right: '1.5rem',
            transform: direction.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            fontSize: '1.5rem',
            color: '#666'
          }}>
            ▼
          </div>
        </div>

        {/* Direction Content */}
        {direction.isExpanded && (
          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
            {isFirstDirection ? (
              <FirstDirectionContent
                direction={direction}
                onCardClick={onCardClick}
                onCreateNewCard={onCreateNewCard}
                onDeleteCard={onDeleteCard}
              />
            ) : (
              <OtherDirectionContent direction={direction} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Component for the first direction (expanded with detailed content)
const FirstDirectionContent: React.FC<{
  direction: CardDirection;
  onCardClick?: (cardId: string) => void;
  onCreateNewCard?: () => void;
  onDeleteCard?: (cardId: string) => void;
}> = ({ direction, onCardClick, onCreateNewCard, onDeleteCard }) => {
  return (
    <div>
      {/* MY STORY Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#4285f4',
          textAlign: 'center',
          margin: '0 0 0.5rem 0'
        }}>
          MY STORY
        </h4>
        <p style={{
          fontSize: '0.8rem',
          color: '#666',
          textAlign: 'center',
          margin: '0 0 1.5rem 0'
        }}>
          (Your own experience cards)
        </p>
        
        {/* Real experience cards - only user_input type */}
        {direction.cards.filter(card => card.source.type === 'user_input').length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {direction.cards
              .filter(card => card.source.type === 'user_input')
              .map(card => (
                <ExperienceCard
                  key={card.id}
                  card={card}
                  onClick={() => onCardClick?.(card.id)}
                  onDelete={() => onDeleteCard?.(card.id)}
                />
              ))}
          </div>
        ) : (
          /* No cards message */
          <div style={{
            textAlign: 'center',
            padding: '2rem'
          }}>
            <p style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              color: '#9ca3af'
            }}>
              No cards from your past experiences yet
            </p>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              fontWeight: '400'
            }}>
              Try adding one to get started!
            </p>
          </div>
        )}
      </div>

      {/* MAYBE YOU? Section */}
      <div>
        <h4 style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#4285f4',
          textAlign: 'center',
          margin: '0 0 0.5rem 0'
        }}>
          MAYBE YOU?
        </h4>
        <p style={{
          fontSize: '0.8rem',
          color: '#666',
          textAlign: 'center',
          margin: '0 0 1.5rem 0'
        }}>
          (Cards AI guessed you might relate to)
        </p>
        
        {/* Cards container */}
        <div style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'stretch'
        }}>
          {/* AI suggested cards - includes both ai_generated and uploaded_resume */}
          {direction.cards
            .filter(card => card.source.type === 'ai_generated' || card.source.type === 'uploaded_resume')
            .slice(0, 2) // Show only first 2 AI cards
            .map(card => (
              <ExperienceCard
                key={card.id}
                card={card}
                type="ai-suggested"
                onClick={() => onCardClick?.(card.id)}
              />
            ))}



          {/* Add New Card Button */}
          <ExperienceCard
            type="create-new"
            title="Create New Experience Card"
            onClick={onCreateNewCard}
          />
        </div>
      </div>
    </div>
  );
};

// Component for other directions (collapsed with summary)
const OtherDirectionContent: React.FC<{
  direction: CardDirection;
}> = ({ direction }) => {
  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <p style={{
        fontSize: '1rem',
        color: '#4285f4',
        margin: '0 0 0.5rem 0'
      }}>
        There are currently {direction.extractedCount + direction.aiRecommendedCount} Cards in the direction, Includes {direction.extractedCount}
      </p>
      <p style={{
        fontSize: '1rem',
        color: '#4285f4',
        margin: 0
      }}>
        extracted cards and {direction.aiRecommendedCount} AI-recommended cards.
      </p>
    </div>
  );
};

export default CardCategory;
