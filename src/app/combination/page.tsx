'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardDirection, ExperienceCard } from '@/types/card';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core';
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
  const [draggedCard, setDraggedCard] = useState<ExperienceCard | null>(null);
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
    localStorage.removeItem('selectedCards');
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = allCards.find(c => c.id === event.active.id);
    setDraggedCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id === 'custom-area') {
      const card = allCards.find(c => c.id === active.id);
      if (card && !selectedCards.some(c => c.id === card.id)) {
        const newSelectedCards = [...selectedCards, card];
        setSelectedCards(newSelectedCards);
        localStorage.setItem('selectedCards', JSON.stringify(newSelectedCards));
      }
    }

    setDraggedCard(null);
  };

  // Draggable Card Component
  const DraggableCard = ({ card, isSelected }: { card: ExperienceCard; isSelected: boolean }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: card.id,
      disabled: isSelected,
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`pool-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging-source' : ''}`}
      >
        <div className="card-category-indicator">
          <div className={`category-icon ${card.category.toLowerCase().replace(' ', '-')}`}>
            {card.category === 'Focus Match' ? 'F' :
             card.category === 'Growth Potential' ? 'G' : 'S'}
          </div>
        </div>
        <div className="card-info">
          <p className="card-time">{card.cardPreview.timeAndLocation}</p>
          <h4>{card.cardPreview.experienceName}</h4>
          <p className="card-summary">{card.cardPreview.oneSentenceSummary}</p>
        </div>
      </div>
    );
  };

  // Droppable Custom Area Component
  const DroppableCustomArea = ({ children }: { children: React.ReactNode }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: 'custom-area',
    });

    return (
      <div
        ref={setNodeRef}
        className={`custom-area ${isOver ? 'drag-over' : ''}`}
      >
        {children}
      </div>
    );
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
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="combination-page">
        <div className="combination-container">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">CARD COMBINATION OPTIONS</h1>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {/* Custom Combination Area */}
            <DroppableCustomArea>
              <div className="custom-header">
                <span className="custom-label">CUSTOM</span>
              </div>

              <div className="info-icon">ⓘ</div>

              <div className="custom-content">
                <div className="custom-instructions">
                  <h3>Drag cards from the pool below to customize your combination.</h3>
                  <p>Ready to craft a set that screams you? Let's do it!</p>
                  <p className="tip">
                    <span className="tip-icon">👉</span>
                    Not sure where to start? Check out the auto-generated options for inspiration!
                  </p>
                </div>
              </div>

              <button className="clear-button" onClick={handleClear}>
                Clear
              </button>

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
            </DroppableCustomArea>

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
                  <DraggableCard
                    key={card.id}
                    card={card}
                    isSelected={isSelected}
                  />
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

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedCard ? (
          <div className="pool-card drag-overlay">
            <div className="card-category-indicator">
              <div className={`category-icon ${draggedCard.category.toLowerCase().replace(' ', '-')}`}>
                {draggedCard.category === 'Focus Match' ? 'F' :
                 draggedCard.category === 'Growth Potential' ? 'G' : 'S'}
              </div>
            </div>
            <div className="card-info">
              <p className="card-time">{draggedCard.cardPreview.timeAndLocation}</p>
              <h4>{draggedCard.cardPreview.experienceName}</h4>
              <p className="card-summary">{draggedCard.cardPreview.oneSentenceSummary}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
