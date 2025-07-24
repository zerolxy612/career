'use client';

import { useState } from 'react';
import YellowIndustryCard from '@/components/cards/YellowIndustryCard';

const mockIndustries = [
  {
    id: 1,
    title: "Digital Product Management",
    summary: "Lead cross-functional teams to design, build, and grow digital products.",
    tags: ["Cross-functional", "Product Thinking", "User Insight"]
  },
  {
    id: 2,
    title: "UX/UI Design",
    summary: "Create intuitive and engaging user experiences for digital products.",
    tags: ["User Research", "Design Systems", "Prototyping"]
  },
  {
    id: 3,
    title: "Data Science",
    summary: "Extract insights from data to drive business decisions and innovation.",
    tags: ["Machine Learning", "Analytics", "Statistical Modeling"]
  },
  {
    id: 4,
    title: "Software Engineering",
    summary: "Build scalable and robust software solutions for various platforms.",
    tags: ["Full-stack", "System Design", "Code Quality"]
  }
];

export default function TestCardsPage() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showCards, setShowCards] = useState(false);

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  const handleConfirm = () => {
    setShowCards(true);
  };

  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      gap: '2rem'
    }}>
      {/* Left side - Input simulation */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <img
              src="/ai_avatar.png"
              alt="AI Avatar"
              style={{ width: '64px', height: '64px', marginBottom: '1rem' }}
            />
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>Enter your career goals here!</p>
            <p style={{ color: '#666' }}>Let's explore your career profile together!</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#3b82f6', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
              Your target industry or field?
            </label>
            <textarea
              placeholder="Enter Message..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                resize: 'vertical'
              }}
              defaultValue="I want to work in digital product management and user experience design"
            />
          </div>

          <button
            onClick={handleConfirm}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Confirm
          </button>
        </div>
      </div>

      {/* Right side - Cards */}
      {showCards && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '400px',
            width: '100%'
          }}>
            {mockIndustries.map((industry) => (
              <YellowIndustryCard
                key={industry.id}
                title={industry.title}
                summary={industry.summary}
                tags={industry.tags}
                isSelected={selectedCard === industry.id}
                onSelect={() => handleCardSelect(industry.id)}
              />
            ))}
          </div>

          {selectedCard && (
            <button
              style={{
                marginTop: '2rem',
                padding: '0.75rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
