'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardDirection, ExperienceCard } from '@/types/card';
import { ExperienceCardDetail, ExperienceDetailData } from '@/components/ExperienceCardDetail';
import { CombinationDetailsModal } from '@/components/CombinationDetailsModal';
import { CardDataManager } from '@/lib/CardDataManager';
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
    { id: 'option1', name: 'Option', description: 'Loading...', isSelected: false, isLoading: false },
  ]);

  useEffect(() => {
    // 🔧 PROFESSIONAL: 使用CardDataManager统一加载数据
    console.log('📋 [COMBINATION] Loading data from CardDataManager...');

    // 验证会话数据
    const isValidSession = CardDataManager.validateSession();

    if (isValidSession) {
      // 从CardDataManager获取方向数据
      const directionsData = CardDataManager.getDirectionsData();
      const sessionStats = CardDataManager.getSessionStats();

      console.log('✅ [COMBINATION] Data loaded from CardDataManager:', {
        directionsCount: directionsData.length,
        totalCards: directionsData.reduce((sum, dir) => sum + dir.cards.length, 0),
        sessionStats,
        cardDetails: directionsData.map(dir => ({
          title: dir.title,
          cardCount: dir.cards.length,
          cardNames: dir.cards.map(c => c.cardPreview.experienceName)
        }))
      });

      setDirections(directionsData);

      // 🔧 NEW: 获取动态方向并更新组合选项
      const dynamicDirections = CardDataManager.getDynamicDirections();
      if (dynamicDirections && dynamicDirections.length >= 1) {
        console.log('🎯 [COMBINATION] Loading dynamic directions for option:', {
          directionTitles: dynamicDirections.map(d => d.方向标题)
        });

        // 只保留一个推荐选项
        setCombinationOptions(prev => [
          prev[0], // Keep Custom option unchanged
          {
            ...prev[1],
            name: 'Option',
            description: 'AI recommendation based on your profile (auto-apply)'
          }
        ]);
      } else {
        console.log('⚠️ [COMBINATION] No dynamic directions found, using default option');
        setCombinationOptions(prev => [
          prev[0], // Keep Custom option unchanged
          {
            ...prev[1],
            name: 'Option',
            description: 'AI recommendation based on your profile (auto-apply)'
          }
        ]);
      }
    } else {
      // 🔧 FIX: 移除向后兼容逻辑，强制使用CardDataManager确保数据一致性
      console.log('❌ [COMBINATION] No valid CardDataManager session found, redirecting to experience page');
      console.log('🔧 [COMBINATION] This ensures data consistency between Experience and Combination pages');
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
      setSelectedOption(optionId); // 设置选中的选项
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

      // 获取动态方向信息
      const dynamicDirections = CardDataManager.getDynamicDirections();

      const response = await fetch('/api/ai/generate-combination-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGoal,
          selectedIndustry: selectedIndustry || 'Unknown Industry',
          availableCards: allCards,
          optionType: optionId,
          dynamicDirections: dynamicDirections
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

      // 设置选中的选项
      setSelectedOption(optionId);

      // 自动应用推荐到Custom区域（恢复原有功能）
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

    // 保持当前选中的选项，不要切换回custom
    // setSelectedOption('custom'); // 移除这行，保持用户选择的选项状态

    console.log('🎉 [AUTO-APPLY] Recommendation auto-applied successfully:', {
      appliedCardsCount: validCards.length,
      optionId: optionId
    });
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

  // Handle Apply button click - switches to custom option view
  const handleApply = () => {
    console.log('🎯 [APPLY] Apply button clicked for option:', selectedOption);

    if (selectedOption === 'custom') {
      console.log('❌ [APPLY] Already in custom option');
      return;
    }

    // 只切换到Custom选项显示，不重新应用推荐（推荐已经自动应用了）
    setSelectedOption('custom');
    console.log('🔄 [APPLY] Switched to custom option view');
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
      selectedOption: selectedOption,
      timestamp: new Date().toISOString()
    });

    // 只有在Custom选项时才允许拖拽添加卡片
    if (over?.id === 'custom-area' && selectedOption === 'custom') {
      const card = allCards.find(c => c.id === active.id);
      if (card && !selectedCards.some(c => c.id === card.id)) {
        console.log('✅ Adding card to selection:', card.cardPreview.experienceName);
        const newSelectedCards = [...selectedCards, card];
        setSelectedCards(newSelectedCards);
        localStorage.setItem('selectedCards', JSON.stringify(newSelectedCards));
      } else {
        console.log('❌ Card already selected or not found');
      }
    } else if (over?.id === 'custom-area' && selectedOption !== 'custom') {
      console.log('❌ Drag not allowed in AI recommendation mode');
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

  // Handle info icon click for combination details - shows details for the most recent AI recommendation
  const handleCustomAreaInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔍 [INFO] Custom area info icon clicked');
    console.log('🔍 [INFO] Current combination options:', combinationOptions.map(opt => ({
      id: opt.id,
      name: opt.name,
      hasAiRecommendation: !!opt.aiRecommendation,
      isSelected: selectedOption === opt.id
    })));

    // Find the most recent option with AI recommendation
    const optionsWithRecommendations = combinationOptions.filter(opt =>
      opt.id !== 'custom' && opt.aiRecommendation
    );

    if (optionsWithRecommendations.length === 0) {
      console.log('❌ [INFO] No AI recommendations available');
      alert('No AI recommendations available. Please select Option 1, 2, or 3 to generate recommendations first.');
      return;
    }

    // Use the most recent recommendation (last one in the array)
    const mostRecentOption = optionsWithRecommendations[optionsWithRecommendations.length - 1];

    console.log('✅ [INFO] Opening details modal for most recent recommendation:', mostRecentOption.id);
    setSelectedOptionForDetails(mostRecentOption.id);
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
      disabled: isSelected || selectedOption !== 'custom', // 在非Custom选项时禁用拖拽
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

    // 确定能力类型：Focus Match 和 Growth Potential 为客观能力(O)，Foundation Skills 为主观能力(S)
    const isSubjectiveAbility = card.category === 'Foundation Skills';
    const abilityType = isSubjectiveAbility ? 'S' : 'O';

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`pool-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging-source' : ''} ${isSubjectiveAbility ? 'subjective-ability' : 'objective-ability'}`}
        onClick={handleClick}
      >
        <div className="card-category-indicator">
          <div className={`category-icon ${abilityType.toLowerCase()}-ability`}>
            {abilityType}
          </div>
        </div>
        <div className="card-info">
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

  // 🔧 DEBUG: 添加调试日志来跟踪卡片数量
  console.log('🎯 [COMBINATION] Card pool analysis:', {
    directionsCount: directions.length,
    cardsByDirection: directions.map(dir => ({
      title: dir.title,
      cardCount: dir.cards.length,
      cardNames: dir.cards.map(c => c.cardPreview.experienceName)
    })),
    totalCards: allCards.length,
    allCardNames: allCards.map(c => c.cardPreview.experienceName),
    cardSources: allCards.map(c => c.source.type)
  });

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

              <div
                className="info-icon"
                onClick={handleCustomAreaInfoClick}
                title="View detailed analysis for AI recommendations"
                style={{
                  cursor: combinationOptions.some(opt => opt.id !== 'custom' && opt.aiRecommendation) ? 'pointer' : 'not-allowed',
                  opacity: combinationOptions.some(opt => opt.id !== 'custom' && opt.aiRecommendation) ? 1 : 0.5
                }}
              >
                ⓘ
              </div>

              <div className="custom-content">
                {selectedCards.length === 0 && (
                  <div className="custom-instructions">
                    <h3>Drag cards from the pool below to customize your combination.</h3>
                    <p>Ready to craft a set that screams you? Let&apos;s do it!</p>
                    <p className="tip">
                      <span className="tip-icon">👉</span>
                      Not sure where to start? Check out the auto-generated options for inspiration!
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic button: Apply for AI recommendations, Clear for custom */}
              {selectedOption !== 'custom' ? (
                <button className="apply-button" onClick={handleApply}>
                  Apply
                </button>
              ) : (
                <button className="clear-button" onClick={handleClear}>
                  Clear
                </button>
              )}

              {/* Selected Cards Display Area */}
              <div className="selected-cards-area">
                {selectedCards.map(card => {
                  // 确定能力类型：Focus Match 和 Growth Potential 为客观能力(O)，Foundation Skills 为主观能力(S)
                  const isSubjectiveAbility = card.category === 'Foundation Skills';
                  const abilityClass = isSubjectiveAbility ? 'subjective-ability' : 'objective-ability';

                  return (
                    <div key={card.id} className={`selected-card ${abilityClass}`}>
                      <div className="card-content">
                        <h4>{card.cardPreview.experienceName}</h4>
                        <p>{card.cardPreview.oneSentenceSummary}</p>
                      </div>
                      {/* 只在Custom选项时显示删除按钮 */}
                      {selectedOption === 'custom' && (
                        <button
                          className="remove-card-btn"
                          onClick={() => handleCardSelect(card)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
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



                </div>



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
        {draggedCard ? (() => {
          const isSubjectiveAbility = draggedCard.category === 'Foundation Skills';
          const abilityType = isSubjectiveAbility ? 'S' : 'O';

          return (
            <div className={`pool-card drag-overlay ${isSubjectiveAbility ? 'subjective-ability' : 'objective-ability'}`}>
              <div className="card-category-indicator">
                <div className={`category-icon ${abilityType.toLowerCase()}-ability`}>
                  {abilityType}
                </div>
              </div>
              <div className="card-info">
                <h4>{draggedCard.cardPreview.experienceName}</h4>
                <p className="card-summary">{draggedCard.cardPreview.oneSentenceSummary}</p>
              </div>
            </div>
          );
        })() : null}
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
