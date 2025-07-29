'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardDirection, ExperienceCard } from '@/types/card';
import { ExperienceCardDetail, ExperienceDetailData } from '@/components/ExperienceCardDetail';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentCardData, setCurrentCardData] = useState<ExperienceDetailData | undefined>(undefined);

  // 配置拖拽传感器，设置距离阈值来区分点击和拖拽
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 需要移动8px才开始拖拽
      },
    })
  );
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
    console.log('🔄 handleCardSelect called (should only be for remove button):', {
      cardId: card.id,
      cardName: card.cardPreview.experienceName,
      timestamp: new Date().toISOString()
    });

    setSelectedCards(prev => {
      const isAlreadySelected = prev.some(c => c.id === card.id);
      if (isAlreadySelected) {
        console.log('➖ Removing card from selection');
        return prev.filter(c => c.id !== card.id);
      } else {
        console.log('➕ Adding card to selection (unexpected from handleCardSelect)');
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
    console.log('🚀 Drag started:', {
      cardId: event.active.id,
      cardName: card?.cardPreview.experienceName,
      timestamp: new Date().toISOString()
    });
    setDraggedCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('🎯 Drag ended:', {
      activeId: active.id,
      overId: over?.id,
      isOverCustomArea: over?.id === 'custom-area',
      timestamp: new Date().toISOString()
    });

    if (over?.id === 'custom-area') {
      const card = allCards.find(c => c.id === active.id);
      if (card && !selectedCards.some(c => c.id === card.id)) {
        console.log('✅ Adding card to selection:', card.cardPreview.experienceName);
        const newSelectedCards = [...selectedCards, card];
        setSelectedCards(newSelectedCards);
        localStorage.setItem('selectedCards', JSON.stringify(newSelectedCards));
      } else {
        console.log('❌ Card already selected or not found');
      }
    }

    setDraggedCard(null);
  };

  const handleCardClick = (card: ExperienceCard, eventType: string = 'unknown') => {
    console.log('🔍 handleCardClick called:', {
      cardId: card.id,
      cardName: card.cardPreview.experienceName,
      eventType,
      timestamp: new Date().toISOString()
    });

    // Convert card detail to ExperienceDetailData format
    const cardData: ExperienceDetailData = {
      experienceName: card.cardDetail.experienceName,
      locationAndTime: card.cardDetail.timeAndLocation,
      scenarioIntroduction: card.cardDetail.backgroundContext,
      myRole: card.cardDetail.myRoleAndTasks,
      eventProcess: card.cardDetail.taskDetails,
      reflection: card.cardDetail.reflectionAndResults,
      oneLineHighlight: card.cardDetail.highlightSentence
    };
    setCurrentCardData(cardData);
    setIsDetailModalOpen(true);

    console.log('✅ Modal should be opening now');
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setCurrentCardData(undefined);
  };

  const handleDetailModalSave = (data: ExperienceDetailData) => {
    console.log('Saving experience data:', data);
    // Here you could update the card data if needed
    setIsDetailModalOpen(false);
    setCurrentCardData(undefined);
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

    const handleClick = (e: React.MouseEvent) => {
      console.log('🖱️ Card clicked:', {
        cardId: card.id,
        cardName: card.cardPreview.experienceName,
        isSelected,
        isDragging
      });

      // 如果是已选中的卡片，不处理点击
      if (isSelected) {
        console.log('❌ Card is selected, ignoring click');
        return;
      }

      // 阻止事件冒泡
      e.preventDefault();
      e.stopPropagation();

      console.log('✅ Opening card detail modal');
      handleCardClick(card, 'direct-click');
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`pool-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging-source' : ''}`}
        onClick={handleClick}
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
      sensors={sensors}
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
                  <p>Ready to craft a set that screams you? Let&apos;s do it!</p>
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

      {/* Experience Card Detail Modal */}
      <ExperienceCardDetail
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        onSave={handleDetailModalSave}
        initialData={currentCardData}
      />
    </DndContext>
  );
}
