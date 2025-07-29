'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardDirection, ExperienceCard } from '@/types/card';
import './combination.css';

interface CombinationOption {
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
}

export default function CombinationPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>('custom');
  const [directions, setDirections] = useState<CardDirection[]>([]);
  const [selectedCards, setSelectedCards] = useState<ExperienceCard[]>([]);
  const [combinationOptions] = useState<CombinationOption[]>([
    { id: 'custom', name: 'Custom', description: '', isSelected: true },
    { id: 'option1', name: 'Option 1', description: '', isSelected: false },
    { id: 'option2', name: 'Option 2', description: '', isSelected: false },
    { id: 'option3', name: 'Option 3', description: '', isSelected: false },
  ]);

  useEffect(() => {
    // Load experience directions from localStorage
    const storedDirections = localStorage.getItem('experienceDirections');
    if (storedDirections) {
      setDirections(JSON.parse(storedDirections));
    } else {
      // If no data, redirect back to experience page
      router.push('/experience');
    }
  }, [router]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleCardSelect = (card: ExperienceCard) => {
    setSelectedCards(prev => {
      const isAlreadySelected = prev.some(c => c.id === card.id);
      if (isAlreadySelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  const handleClear = () => {
    setSelectedCards([]);
  };

  const handleBack = () => {
    router.push('/experience');
  };

  const handleNext = () => {
    // Save combination data and proceed to next step
    localStorage.setItem('selectedCombination', JSON.stringify({
      option: selectedOption,
      cards: selectedCards
    }));
    
    // TODO: Navigate to analysis/results page
    console.log('Proceeding to analysis page...');
    alert('Analysis page will be implemented in the next phase. Your combination has been saved.');
  };

  // Get all cards from all directions
  const allCards = directions.flatMap(direction => direction.cards);

  return (
    <div className="combination-page">
      <div className="combination-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">CARD COMBINATION OPTIONS</h1>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Custom Combination Area */}
          <div className="custom-area">
            <div className="custom-header">
              <span className="custom-label">CUSTOM</span>
              <div className="info-icon">ⓘ</div>
            </div>

            <div className="custom-content">
              <div className="custom-instructions">
                <h3>Customize your combination by selecting cards from the pool.</h3>
                <p>Ready to craft a set that screams you? Let's do it!</p>
                <p className="tip">
                  <span className="tip-icon">👉</span>
                  Not sure where to start? Check out the auto-generated options for inspiration!
                </p>
              </div>

              <button className="clear-button" onClick={handleClear}>
                Clear
              </button>
            </div>

            {/* Selected Cards Display Area */}
            <div className="selected-cards-area">
              {selectedCards.map(card => (
                <div key={card.id} className="selected-card">
                  <div className="card-content">
                    <h4>{card.cardPreview.experienceName}</h4>
                    <p>{card.cardPreview.timeAndLocation}</p>
                    <p>{card.cardPreview.oneSentenceSummary}</p>
                  </div>
                  <button
                    className="remove-card-btn"
                    onClick={() => handleCardSelect(card)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Options Sidebar */}
          <div className="options-sidebar">
            {combinationOptions.map(option => (
              <div
                key={option.id}
                className={`option-item ${selectedOption === option.id ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="option-radio">
                  <div className={`radio-dot ${selectedOption === option.id ? 'active' : ''}`}></div>
                </div>
                <span className="option-name">{option.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Pool */}
        <div className="card-pool">
          <div className="card-pool-grid">
            {allCards.map(card => {
              const isSelected = selectedCards.some(c => c.id === card.id);
              return (
                <div
                  key={card.id}
                  className={`pool-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="card-category-indicator">
                    <div className={`category-icon ${card.category.toLowerCase().replace(' ', '-')}`}>
                      {card.category === 'Focus Match' ? 'F' :
                       card.category === 'Growth Potential' ? 'G' : 'S'}
                    </div>
                  </div>
                  <div className="card-info">
                    <h4>{card.cardPreview.experienceName}</h4>
                    <p className="card-time">{card.cardPreview.timeAndLocation}</p>
                    <p className="card-summary">{card.cardPreview.oneSentenceSummary}</p>
                  </div>
                  <div className="card-source-indicator">
                    <div className={`source-icon ${card.source.type}`}>
                      {card.source.type === 'ai_generated' ? 'AI' :
                       card.source.type === 'uploaded_resume' ? 'R' : 'U'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button className="nav-button back-button" onClick={handleBack}>
            Back
          </button>
          <button className="nav-button next-button" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
