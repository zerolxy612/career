'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardDirection, ExperienceCard } from '@/types/card';
import { ExperienceCardDetail, ExperienceDetailData } from '@/components/ExperienceCardDetail';
import { CombinationDetailsModal } from '@/components/CombinationDetailsModal';
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

// AI推荐数据结构 - 来自组合推荐API的响应
interface AIRecommendationData {
  故事主题: string;
  叙述逻辑: string;
  选择的卡片: Array<{
    卡片名称: string;
    在故事中的角色: string;
  }>;
  故事亮点: string[];
}

// 详细分析数据结构 - 来自详细分析API的响应
interface DetailedAnalysisData {
  推荐路径选项: {
    option名称: string;
    匹配逻辑摘要: string;
    "Why this combination": {
      目标岗位: string;
      识别能力: string[];
      组合解释: string;
    };
    卡片组合: Array<{
      卡片名称: string;
      角色定位: string;
    }>;
    补充建议方向: string[];
    风险与建议: {
      潜在挑战: string[];
      行动建议: string[];
    };
  };
}

// 推荐组合中的卡片结构
interface RecommendedCard {
  卡片名称: string;
  在故事中的角色: string;
}

interface CombinationOption {
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
  aiRecommendation?: AIRecommendationData; // AI推荐数据
  recommendedCards?: ExperienceCard[]; // 推荐的卡片列表
  isLoading?: boolean; // 加载状态
}

export default function CombinationPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>('custom');
  const [directions, setDirections] = useState<CardDirection[]>([]);
  const [selectedCards, setSelectedCards] = useState<ExperienceCard[]>([]);
  const [draggedCard, setDraggedCard] = useState<ExperienceCard | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentCardData, setCurrentCardData] = useState<ExperienceDetailData | undefined>(undefined);

  // Combination details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOptionForDetails, setSelectedOptionForDetails] = useState<string>('');

  // User data from localStorage
  const [userGoal, setUserGoal] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  // 新增状态管理
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  // Suppress unused variable warnings - these will be used in UI
  void isLoadingRecommendation;

  // 配置拖拽传感器，设置距离阈值来区分点击和拖拽
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 需要移动8px才开始拖拽
      },
    })
  );
  const [combinationOptions, setCombinationOptions] = useState<CombinationOption[]>([
    { id: 'custom', name: 'Custom', description: 'Build your own combination', isSelected: true },
    { id: 'option1', name: 'Option 1', description: 'Balanced approach (auto-apply)', isSelected: false, isLoading: false },
    { id: 'option2', name: 'Option 2', description: 'Growth-focused (auto-apply)', isSelected: false, isLoading: false },
    { id: 'option3', name: 'Option 3', description: 'Safe transition (auto-apply)', isSelected: false, isLoading: false },
  ]);

  useEffect(() => {
    // Load experience directions from localStorage
    const storedDirections = localStorage.getItem('experienceDirections');
    if (storedDirections) {
      try {
        const parsedDirections = JSON.parse(storedDirections);
        console.log('📋 [COMBINATION] Loaded directions with cards:', {
          directionsCount: parsedDirections.length,
          totalCards: parsedDirections.reduce((sum: number, dir: any) => sum + (dir.cards?.length || 0), 0),
          cardsByDirection: parsedDirections.map((dir: any) => ({
            id: dir.id,
            title: dir.title,
            cardCount: dir.cards?.length || 0
          }))
        });
        setDirections(parsedDirections);
      } catch (error) {
        console.error('❌ [COMBINATION] Error parsing stored directions:', error);
        // If data is corrupted, redirect back to experience page
        router.push('/experience');
      }
    } else {
      // If no data, redirect back to experience page
      console.log('📋 [COMBINATION] No stored directions found, redirecting to experience page');
      router.push('/experience');
    }

    // Load user goal and selected industry
    const storedGoal = localStorage.getItem('userGoal');
    const storedIndustry = localStorage.getItem('selectedIndustry');

    if (storedGoal) {
      setUserGoal(storedGoal);
    }

    if (storedIndustry) {
      try {
        const industryData = JSON.parse(storedIndustry);
        setSelectedIndustry(industryData.title || industryData.name || storedIndustry);
      } catch {
        setSelectedIndustry(storedIndustry);
      }
    }
  }, [router]);

  // 辅助函数：匹配推荐的卡片名称到实际的卡片对象
  const matchRecommendedCards = (recommendedCardCombination: Array<{卡片名称: string; 在故事中的角色?: string; 角色定位?: string}>, availableCards: ExperienceCard[]): ExperienceCard[] => {
    console.log('🔍 [MATCH] Starting card matching process:', {
      recommendedCount: recommendedCardCombination.length,
      availableCount: availableCards.length
    });

    const matchedCards: ExperienceCard[] = [];

    recommendedCardCombination.forEach((recommendedCard, index) => {
      console.log(`🔍 [MATCH] Processing recommended card ${index + 1}:`, {
        recommendedName: recommendedCard.卡片名称,
        role: recommendedCard.在故事中的角色 || recommendedCard.角色定位 || 'No role specified'
      });

      // 尝试精确匹配
      let matchedCard = availableCards.find(card =>
        card.cardPreview.experienceName === recommendedCard.卡片名称
      );

      // 如果精确匹配失败，尝试模糊匹配
      if (!matchedCard) {
        console.log(`⚠️ [MATCH] Exact match failed for "${recommendedCard.卡片名称}", trying fuzzy match...`);

        matchedCard = availableCards.find(card => {
          const cardName = card.cardPreview.experienceName.toLowerCase();
          const recommendedName = recommendedCard.卡片名称.toLowerCase();

          // 检查是否包含关键词
          return cardName.includes(recommendedName) || recommendedName.includes(cardName);
        });
      }

      if (matchedCard) {
        console.log(`✅ [MATCH] Successfully matched "${recommendedCard.卡片名称}" to card:`, {
          cardId: matchedCard.id,
          actualName: matchedCard.cardPreview.experienceName,
          category: matchedCard.category
        });
        matchedCards.push(matchedCard);
      } else {
        console.warn(`❌ [MATCH] No match found for recommended card: "${recommendedCard.卡片名称}"`);
        console.warn(`❌ [MATCH] Available card names:`, availableCards.map(c => c.cardPreview.experienceName));
      }
    });

    console.log('🎯 [MATCH] Card matching completed:', {
      totalRecommended: recommendedCardCombination.length,
      successfulMatches: matchedCards.length,
      matchRate: `${Math.round((matchedCards.length / recommendedCardCombination.length) * 100)}%`
    });

    return matchedCards;
  };

  const handleOptionSelect = async (optionId: string) => {
    console.log('🎯 [COMBINATION] Option selected:', {
      optionId,
      timestamp: new Date().toISOString(),
      currentSelectedOption: selectedOption
    });

    setRecommendationError(null);

    // 如果选择的是Custom，不需要调用AI
    if (optionId === 'custom') {
      console.log('📝 [COMBINATION] Custom option selected, no AI call needed');
      setSelectedOption(optionId);
      return;
    }

    // 检查是否已经有推荐数据，如果有则直接应用
    const currentOption = combinationOptions.find(opt => opt.id === optionId);
    if (currentOption?.aiRecommendation && currentOption?.recommendedCards) {
      console.log('✅ [COMBINATION] Using cached recommendation for:', optionId);
      applyRecommendationDirectly(currentOption.recommendedCards, optionId);
      return;
    }

    // 获取用户数据
    const userGoal = localStorage.getItem('userGoal');
    const selectedIndustryStr = localStorage.getItem('selectedIndustry');

    if (!userGoal || !selectedIndustryStr) {
      console.error('❌ [COMBINATION] Missing user data in localStorage');
      setRecommendationError('Missing user goal or selected industry data');
      return;
    }

    let selectedIndustryData;
    try {
      selectedIndustryData = JSON.parse(selectedIndustryStr);
    } catch (error) {
      console.error('❌ [COMBINATION] Failed to parse selected industry data:', error);
      setRecommendationError('Invalid industry data format');
      return;
    }

    console.log('📋 [COMBINATION] Preparing AI request:', {
      userGoal: userGoal.substring(0, 100) + '...',
      selectedIndustry: selectedIndustryData.cardPreview?.fieldName,
      availableCardsCount: allCards.length,
      optionType: optionId
    });

    // 设置加载状态
    setIsLoadingRecommendation(true);
    setCombinationOptions(prev => prev.map(opt =>
      opt.id === optionId
        ? { ...opt, isLoading: true }
        : opt
    ));

    try {
      console.log('📤 [COMBINATION] Sending request to AI API...');
      const requestStartTime = Date.now();

      const response = await fetch('/api/ai/generate-combination-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGoal,
          selectedIndustry: selectedIndustryData.cardPreview?.fieldName,
          availableCards: allCards,
          optionType: optionId
        })
      });

      const requestEndTime = Date.now();
      console.log('📥 [COMBINATION] API response received:', {
        status: response.status,
        statusText: response.statusText,
        responseTime: requestEndTime - requestStartTime + 'ms'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [COMBINATION] API request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const recommendationData = await response.json();
      console.log('✅ [COMBINATION] Recommendation data received:', {
        hasRecommendation: !!recommendationData.推荐组合,
        storyTheme: recommendationData.推荐组合?.故事主题,
        selectedCardsCount: recommendationData.推荐组合?.选择的卡片?.length || 0
      });

      // 匹配推荐的卡片到实际的卡片对象
      const recommendedCards = matchRecommendedCards(recommendationData.推荐组合?.选择的卡片 || [], allCards);

      console.log('🔗 [COMBINATION] Card matching result:', {
        recommendedCardNames: recommendationData.推荐组合?.选择的卡片?.map((c: RecommendedCard) => c.卡片名称) || [],
        matchedCardsCount: recommendedCards.length,
        matchedCardIds: recommendedCards.map((c: ExperienceCard) => c.id)
      });

      // 更新选项数据
      setCombinationOptions(prev => prev.map(opt =>
        opt.id === optionId
          ? {
              ...opt,
              isLoading: false,
              aiRecommendation: recommendationData.推荐组合,
              recommendedCards: recommendedCards
            }
          : opt
      ));

      console.log('🎉 [COMBINATION] Recommendation generated, auto-applying to custom area:', optionId);

      // 自动应用推荐到Custom区域
      applyRecommendationDirectly(recommendedCards, optionId);

    } catch (error) {
      console.error('❌ [COMBINATION] Failed to generate recommendation:', error);
      console.error('❌ [COMBINATION] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      setRecommendationError(error instanceof Error ? error.message : 'Failed to generate recommendation');

      // 清除加载状态
      setCombinationOptions(prev => prev.map(opt =>
        opt.id === optionId
          ? { ...opt, isLoading: false }
          : opt
      ));
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  // 直接应用推荐组合（自动化流程）
  const applyRecommendationDirectly = (recommendedCards: ExperienceCard[], optionId: string) => {
    console.log('🚀 [AUTO-APPLY] Auto-applying recommendation for option:', optionId);

    if (!recommendedCards || recommendedCards.length === 0) {
      console.error('❌ [AUTO-APPLY] No recommended cards to apply');
      return;
    }

    console.log('📋 [AUTO-APPLY] Recommended cards to apply:', {
      count: recommendedCards.length,
      cardNames: recommendedCards.map(c => c.cardPreview.experienceName),
      cardIds: recommendedCards.map(c => c.id)
    });

    // 应用推荐的卡片组合
    const validCards = recommendedCards.filter(card =>
      allCards.some(availableCard => availableCard.id === card.id)
    );

    console.log('✅ [AUTO-APPLY] Valid cards after filtering:', {
      originalCount: recommendedCards.length,
      validCount: validCards.length,
      validCardNames: validCards.map(c => c.cardPreview.experienceName)
    });

    // 清空当前选择并应用新的推荐
    setSelectedCards(validCards);
    localStorage.setItem('selectedCards', JSON.stringify(validCards));

    // 自动切换到Custom视图显示应用的组合
    setSelectedOption('custom');

    console.log('🎉 [AUTO-APPLY] Recommendation auto-applied successfully:', {
      appliedCardsCount: validCards.length,
      switchedToCustom: true,
      optionId: optionId
    });

    // 显示简短的成功提示
    if (validCards.length > 0) {
      // 可以考虑使用toast通知，这里暂时使用console提示
      console.log(`✨ [USER-FEEDBACK] ${validCards.length} recommended cards automatically applied to your custom combination!`);
    }
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

  // Handle info icon click for combination details
  const handleInfoClick = (optionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔍 [INFO] Info icon clicked for option:', optionId);

    // Only show details for options that have AI recommendations
    const option = combinationOptions.find(opt => opt.id === optionId);
    if (!option || !option.aiRecommendation) {
      console.log('❌ [INFO] No AI recommendation available for option:', optionId);
      return;
    }

    setSelectedOptionForDetails(optionId);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedOptionForDetails('');
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

    // Navigate to results page
    router.push('/result');
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
              <div key={option.id} className="option-container">
                <div
                  className={`option-item ${selectedOption === option.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="option-radio">
                    <div className={`radio-dot ${selectedOption === option.id ? 'active' : ''}`}></div>
                  </div>
                  <div className="option-content">
                    <span className="option-name">{option.name}</span>
                    {option.isLoading && (
                      <div className="option-loading">
                        <div className="loading-spinner"></div>
                        <span>Generating...</span>
                      </div>
                    )}
                    {option.description && !option.isLoading && (
                      <span className="option-description">{option.description}</span>
                    )}
                  </div>

                  {/* Info icon for options with AI recommendations */}
                  {option.id !== 'custom' && option.aiRecommendation && !option.isLoading && (
                    <div
                      className="info-icon"
                      onClick={(e) => handleInfoClick(option.id, e)}
                      title="View detailed analysis"
                    >
                      ⓘ
                    </div>
                  )}
                </div>

                {/* 简化的状态显示 */}
                {selectedOption === option.id && option.aiRecommendation && !option.isLoading && (
                  <div className="recommendation-applied">
                    <div className="success-message">
                      ✅ Recommendation applied to Custom area
                    </div>
                  </div>
                )}

                {/* 错误显示 */}
                {selectedOption === option.id && recommendationError && !option.aiRecommendation && (
                  <div className="recommendation-error">
                    ❌ {recommendationError}
                    <button
                      className="retry-btn"
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      Retry
                    </button>
                  </div>
                )}
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

      {/* Combination Details Modal */}
      {selectedOptionForDetails && (
        <CombinationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleDetailsModalClose}
          optionType={selectedOptionForDetails}
          userGoal={userGoal || ''}
          selectedIndustry={selectedIndustry || ''}
          recommendedCards={
            combinationOptions.find(opt => opt.id === selectedOptionForDetails)?.aiRecommendation?.选择的卡片 || []
          }
          availableCards={allCards}
        />
      )}
    </DndContext>
  );
}
