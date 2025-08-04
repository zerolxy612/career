'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IndustryRecommendation } from '@/types/api';
import { CardDirection, CompletionLevel, ExperienceCard, CardCategory as CardCategoryType } from '@/types/card';
import { CardCategory } from '@/components/CardCategory';
import { FloatingUploadButton } from '@/components/FileUpload';
import { ExperienceCardDetail, ExperienceDetailData } from '@/components/ExperienceCardDetail';
import { CardDataManager } from '@/lib/CardDataManager';

// Define types for AI response structure
interface AIGenerationSource {
  类型: string;
  置信度?: string;
}

interface AICardPreview {
  经历名称: string;
  时间与地点: string;
  一句话概述: string;
}

interface AICardDetail {
  经历名称: string;
  时间与地点: string;
  背景与情境说明: string;
  我的角色与任务: string;
  任务细节描述: string;
  反思与结果总结: string;
  高光总结句: string;
  生成来源: AIGenerationSource;
}

interface AICardResponse {
  卡片分组: string;
  小卡展示: AICardPreview;
  详情卡展示: AICardDetail;
}

interface AIGeneratedCardsResponse {
  经验卡片推荐: AICardResponse[];
}

export default function ExperiencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryRecommendation | null>(null);
  const [userGoal, setUserGoal] = useState<string>('');
  const [directions, setDirections] = useState<CardDirection[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentCardData, setCurrentCardData] = useState<ExperienceDetailData | undefined>(undefined);
  const [savedCards, setSavedCards] = useState<Map<string, ExperienceDetailData>>(new Map());

  // 🔧 FIX: Prevent multiple useEffect executions
  const hasInitialized = useRef(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(true); // 初始为true
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Suppress unused variable warnings for future use
  void savedCards;
  void uploadedFiles;

  // Helper function to update directions and save to localStorage
  const updateDirections = (newDirections: CardDirection[]) => {
    setDirections(newDirections);
    localStorage.setItem('experienceDirections', JSON.stringify(newDirections));
    console.log('💾 [DIRECTIONS] Updated and saved to localStorage');
  };

  // Calculate completion percentage for experience data
  const calculateCompletionPercentage = (data: ExperienceDetailData): number => {
    const fields = Object.values(data);
    const filledFields = fields.filter(field => field.trim().length > 0);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  // 🔧 FIX: Determine correct source type based on AI response and context
  const determineSourceType = (aiSourceType: string | undefined, fromHomepage: boolean): 'uploaded_resume' | 'user_input' | 'ai_generated' => {
    console.log('🔍 [SOURCE] Determining source type:', { aiSourceType, fromHomepage });

    // If from homepage with files, it should be uploaded_resume
    if (fromHomepage) {
      console.log('✅ [SOURCE] From homepage with files -> uploaded_resume');
      return 'uploaded_resume';
    }

    // Check AI response source type
    if (aiSourceType) {
      const lowerType = aiSourceType.toLowerCase();
      console.log('🔍 [SOURCE] AI source type (lowercase):', lowerType);

      switch (lowerType) {
        case 'uploaded_resume':
        case 'resume':
        case 'file':
        case 'document':
          console.log('✅ [SOURCE] AI indicates file source -> uploaded_resume');
          return 'uploaded_resume';
        case 'user_input':
        case 'manual':
          console.log('✅ [SOURCE] AI indicates manual input -> user_input');
          return 'user_input';
        case 'ai_generated':
        case 'ai':
        case 'generated':
        default:
          console.log('✅ [SOURCE] AI indicates generated content -> ai_generated');
          return 'ai_generated';
      }
    }

    // Default fallback
    console.log('⚠️ [SOURCE] No source type info, defaulting to ai_generated');
    return 'ai_generated';
  };

  useEffect(() => {
    // 🔧 PROFESSIONAL: 使用CardDataManager进行统一的数据管理
    console.log('🚀 [EXPERIENCE] Initializing with professional CardDataManager...');

    // 检查是否有有效的会话数据
    const isValidSession = CardDataManager.validateSession();
    const fromHomepage = searchParams.get('fromHomepage') === 'true';

    console.log('📋 [EXPERIENCE] Session validation:', {
      isValidSession,
      fromHomepage,
      sessionStats: CardDataManager.getSessionStats()
    });

    // 🔧 PROFESSIONAL: 重置组件状态
    setDirections([]);
    setHasInteracted(false);
    setSavedCards(new Map());

    // 加载用户基础信息
    const storedIndustry = localStorage.getItem('selectedIndustry');
    const storedGoal = localStorage.getItem('userGoal');

    if (storedIndustry) {
      setSelectedIndustry(JSON.parse(storedIndustry));
    }

    if (storedGoal) {
      setUserGoal(storedGoal);
    }

    // If no selected industry, redirect back to goal setting
    if (!storedIndustry) {
      router.push('/');
      return;
    }

    // 🔧 PROFESSIONAL: 检查是否有首页数据需要处理
    const homepageGeneratedCards = localStorage.getItem('homepageGeneratedCards');
    const hasHomepageData = fromHomepage && homepageGeneratedCards;

    if (hasHomepageData) {
      // 处理首页传递的数据
      console.log('📁 [EXPERIENCE] Processing homepage data...');

      if (storedIndustry && storedGoal) {
        try {
          const cardsData = JSON.parse(homepageGeneratedCards);
          processGeneratedCards(cardsData, true); // true indicates from homepage

          // 清理首页数据
          localStorage.removeItem('homepageGeneratedCards');
          localStorage.removeItem('hasHomepageFiles');

          console.log('✅ [EXPERIENCE] Homepage data processed and cleaned up');
        } catch (error) {
          console.error('❌ [EXPERIENCE] Error processing homepage data:', error);
          // 降级处理：生成新的AI卡片
          generateAICards(storedGoal, JSON.parse(storedIndustry), []);
        }
      }
    } else if (isValidSession) {
      // 从CardDataManager加载现有数据
      console.log('📊 [EXPERIENCE] Loading existing data from CardDataManager...');
      const directionsData = CardDataManager.getDirectionsData();
      const totalCards = directionsData.reduce((sum, dir) => sum + dir.cards.length, 0);

      if (totalCards > 0) {
        setDirections(directionsData);
        setIsGeneratingCards(false);
        console.log('✅ [EXPERIENCE] Existing data loaded from CardDataManager:', {
          directionsCount: directionsData.length,
          totalCards
        });
      } else {
        // 没有现有数据，生成新的AI卡片
        console.log('🤖 [EXPERIENCE] No existing data, generating new AI cards...');
        if (storedIndustry && storedGoal) {
          generateAICards(storedGoal, JSON.parse(storedIndustry), []);
        }
      }
    } else {
      // 生成新的AI卡片
      console.log('🤖 [EXPERIENCE] Generating new AI cards...');
      if (storedIndustry && storedGoal) {
        generateAICards(storedGoal, JSON.parse(storedIndustry), []);
      }
    }
  }, [router, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔧 FIX: Process generated cards from homepage or experience page
  const processGeneratedCards = (data: AIGeneratedCardsResponse, fromHomepage: boolean = false) => {
    console.log(`🎯 [PROCESS] Processing generated cards (from ${fromHomepage ? 'homepage' : 'experience page'}):`, data);

    if (!data.经验卡片推荐 || !Array.isArray(data.经验卡片推荐)) {
      console.error('❌ [PROCESS] Invalid cards data structure');
      return;
    }

    // 🔧 FIX: Filter out invalid cards and validate data structure
    const validCards = data.经验卡片推荐.filter((card: AICardResponse) => {
      if (!card || typeof card !== 'object') {
        console.warn('⚠️ [PROCESS] Skipping invalid card (not an object):', card);
        return false;
      }

      if (!card.小卡展示 || !card.详情卡展示) {
        console.warn('⚠️ [PROCESS] Skipping card with missing required fields:', card);
        return false;
      }

      return true;
    });

    if (validCards.length === 0) {
      console.log('ℹ️ [PROCESS] No valid cards found, skipping card generation');
      return;
    }

    console.log(`✅ [PROCESS] Found ${validCards.length} valid cards out of ${data.经验卡片推荐.length} total`);

    // Convert AI cards to our format
    // 🔧 PROFESSIONAL: 确保从文件生成的卡片被正确标记为uploaded_resume类型
    const aiCards = validCards.map((card: AICardResponse) =>
      convertAICardToExperienceCard(card, fromHomepage, true) // true = forceUploadedResume
    );

    console.log('🔄 [PROCESS] Converted AI cards:', {
      totalCards: aiCards.length,
      sourceTypes: aiCards.map(c => ({ name: c.cardPreview.experienceName, sourceType: c.source.type })),
      fromHomepage
    });

    // 🔧 PROFESSIONAL: 使用CardDataManager统一管理卡片数据
    const source = fromHomepage ? 'homepage' : 'experience';

    console.log('📝 [PROCESS] About to add cards to CardDataManager:', {
      cardsToAdd: aiCards.length,
      source,
      cardDetails: aiCards.map(c => ({
        name: c.cardPreview.experienceName,
        sourceType: c.source.type,
        category: c.category
      }))
    });

    const success = CardDataManager.addCards(aiCards, source);

    if (success) {
      // 从CardDataManager获取更新后的方向数据
      const updatedDirections = CardDataManager.getDirectionsData();
      const totalCards = updatedDirections.reduce((sum, dir) => sum + dir.cards.length, 0);

      setDirections(updatedDirections);
      setIsGeneratingCards(false);

      console.log('🎉 [PROCESS] Cards successfully added to CardDataManager and directions updated:', {
        directionsCount: updatedDirections.length,
        totalCards,
        sessionStats: CardDataManager.getSessionStats()
      });
    } else {
      console.error('❌ [PROCESS] Failed to add cards to CardDataManager');
    }
  };

  // Convert AI response to ExperienceCard format
  const convertAICardToExperienceCard = (aiCard: AICardResponse, fromHomepage: boolean = false, forceUploadedResume: boolean = false): ExperienceCard => {
    const cardId = `ai-card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Map AI card category to our category system
    const categoryMap: { [key: string]: CardCategoryType } = {
      'Focus Match': 'Focus Match',
      'Growth Potential': 'Growth Potential',
      'Foundation Skills': 'Foundation Skills'
    };

    const category = categoryMap[aiCard.卡片分组] || 'Focus Match';

    // 🔧 FIX: Safe field access with fallback values
    const safeGet = (obj: unknown, path: string, fallback: string = '') => {
      try {
        if (obj && typeof obj === 'object' && obj !== null) {
          const value = (obj as Record<string, unknown>)[path];
          return value ? String(value) : fallback;
        }
        return fallback;
      } catch {
        return fallback;
      }
    };

    // Calculate completion level based on actual content
    const calculateCompletionLevel = (): CompletionLevel => {
      const fields = [
        safeGet(aiCard.小卡展示, '经历名称'),
        safeGet(aiCard.小卡展示, '时间与地点'),
        safeGet(aiCard.小卡展示, '一句话概述'),
        safeGet(aiCard.详情卡展示, '经历名称'),
        safeGet(aiCard.详情卡展示, '时间与地点'),
        safeGet(aiCard.详情卡展示, '背景与情境说明'),
        safeGet(aiCard.详情卡展示, '我的角色与任务'),
        safeGet(aiCard.详情卡展示, '任务细节描述'),
        safeGet(aiCard.详情卡展示, '反思与结果总结'),
        safeGet(aiCard.详情卡展示, '高光总结句')
      ];

      const filledFields = fields.filter(field => field && field.trim().length > 0);
      const fillRatio = filledFields.length / fields.length;

      if (fillRatio === 0) return 'incomplete';
      if (fillRatio < 1) return 'partial';
      return 'complete';
    };

    return {
      id: cardId,
      category: category,
      cardPreview: {
        experienceName: safeGet(aiCard.小卡展示, '经历名称', 'Untitled Experience'),
        timeAndLocation: safeGet(aiCard.小卡展示, '时间与地点', 'Time and location not specified'),
        oneSentenceSummary: safeGet(aiCard.小卡展示, '一句话概述', 'No summary available')
      },
      cardDetail: {
        experienceName: safeGet(aiCard.详情卡展示, '经历名称', 'Untitled Experience'),
        timeAndLocation: safeGet(aiCard.详情卡展示, '时间与地点', 'Time and location not specified'),
        backgroundContext: safeGet(aiCard.详情卡展示, '背景与情境说明', ''),
        myRoleAndTasks: safeGet(aiCard.详情卡展示, '我的角色与任务', ''),
        taskDetails: safeGet(aiCard.详情卡展示, '任务细节描述', ''),
        reflectionAndResults: safeGet(aiCard.详情卡展示, '反思与结果总结', ''),
        highlightSentence: safeGet(aiCard.详情卡展示, '高光总结句', ''),
        editableFields: ['experienceName', 'timeAndLocation', 'backgroundContext', 'myRoleAndTasks', 'taskDetails', 'reflectionAndResults', 'highlightSentence']
      },
      completionLevel: calculateCompletionLevel(),
      source: {
        // 🔧 FIX: Improved source type detection logic with force override
        type: forceUploadedResume ? 'uploaded_resume' : determineSourceType(safeGet(aiCard.详情卡展示?.生成来源, '类型'), fromHomepage)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  // Generate AI cards based on user goal and industry
  const generateAICards = async (goal: string, industry: IndustryRecommendation, files: File[] = []) => {
    console.log('🤖 Generating AI cards...', { goal, industry: industry.cardPreview.fieldName, filesCount: files.length });
    setIsGeneratingCards(true);

    try {
      // 🔧 FIX: If no files provided, don't call API and just show empty directions
      if (files.length === 0) {
        console.log('📝 [GENERATE] No files provided, showing empty directions for manual card creation');

        // Create empty directions structure
        const emptyDirections = [
          {
            id: 'direction-1',
            title: 'Focus Match',
            subtitle: 'Experiences highly aligned with your career goal',
            description: 'Add experiences that directly support your target industry and role',
            isExpanded: true,
            cards: [],
            extractedCount: 0,
            aiRecommendedCount: 0
          },
          {
            id: 'direction-2',
            title: 'Growth Potential',
            subtitle: 'Experiences that show your development potential',
            description: 'Add experiences that demonstrate your ability to learn and grow',
            isExpanded: false,
            cards: [],
            extractedCount: 0,
            aiRecommendedCount: 0
          },
          {
            id: 'direction-3',
            title: 'Foundation Skills',
            subtitle: 'Core skills and foundational experiences',
            description: 'Add experiences that build the foundation for your career development',
            isExpanded: false,
            cards: [],
            extractedCount: 0,
            aiRecommendedCount: 0
          }
        ];

        updateDirections(emptyDirections);
        setIsGeneratingCards(false);
        return;
      }

      const formData = new FormData();
      formData.append('userGoal', goal);
      formData.append('selectedIndustry', industry.cardPreview.fieldName);

      // Add files if available (though we can't restore File objects from localStorage)
      // This is a limitation - in a real app, files would be stored on server
      files.forEach((file, index) => {
        console.log(`File ${index + 1} info:`, file.name);
        // We can't recreate File objects, so we'll just generate AI suggestions
      });

      console.log('📤 Sending request to generate experience cards...');
      const response = await fetch('/api/ai/generate-experience-cards', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AI cards generated successfully:', data);

      // Use the new processGeneratedCards function
      processGeneratedCards(data, false); // false indicates not from homepage

    } catch (error) {
      console.error('❌ Error generating AI cards:', error);
      // Keep the mock directions as fallback
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const toggleDirection = (directionId: string) => {
    const updatedDirections = directions.map(dir =>
      dir.id === directionId
        ? { ...dir, isExpanded: !dir.isExpanded }
        : dir
    );
    updateDirections(updatedDirections);
  };

  const handleCardClick = (cardId: string) => {
    console.log('Card clicked:', cardId);
    setHasInteracted(true);

    // Find the card in all directions
    let foundCard = null;
    for (const direction of directions) {
      foundCard = direction.cards.find(card => card.id === cardId);
      if (foundCard) break;
    }

    if (foundCard) {
      // Convert card detail to ExperienceDetailData format
      const cardData: ExperienceDetailData = {
        experienceName: foundCard.cardDetail.experienceName,
        locationAndTime: foundCard.cardDetail.timeAndLocation,
        scenarioIntroduction: foundCard.cardDetail.backgroundContext,
        myRole: foundCard.cardDetail.myRoleAndTasks,
        eventProcess: foundCard.cardDetail.taskDetails,
        reflection: foundCard.cardDetail.reflectionAndResults,
        oneLineHighlight: foundCard.cardDetail.highlightSentence
      };
      setCurrentCardData(cardData);
    } else {
      setCurrentCardData(undefined); // Create new card
    }

    setIsDetailModalOpen(true);
  };

  const handleCreateNewCard = () => {
    console.log('Create new card clicked');
    setHasInteracted(true);
    setCurrentCardData(undefined); // Create new card
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setCurrentCardData(undefined);
  };

  const handleDetailModalSave = (data: ExperienceDetailData) => {
    console.log('Saving experience data:', data);
    setHasInteracted(true);

    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(data);

    // Check if we're editing an existing card
    let existingCardId = null;
    let existingCard = null;

    for (const direction of directions) {
      existingCard = direction.cards.find(card => {
        const cardData = {
          experienceName: card.cardDetail.experienceName,
          locationAndTime: card.cardDetail.timeAndLocation,
          scenarioIntroduction: card.cardDetail.backgroundContext,
          myRole: card.cardDetail.myRoleAndTasks,
          eventProcess: card.cardDetail.taskDetails,
          reflection: card.cardDetail.reflectionAndResults,
          oneLineHighlight: card.cardDetail.highlightSentence
        };
        return JSON.stringify(cardData) === JSON.stringify(currentCardData);
      });
      if (existingCard) {
        existingCardId = existingCard.id;
        break;
      }
    }

    if (existingCardId && existingCard) {
      // Update existing card
      console.log('Updating existing card:', existingCardId);

      const updatedCard = {
        ...existingCard,
        cardPreview: {
          experienceName: data.experienceName || 'Untitled Experience',
          timeAndLocation: data.locationAndTime || '',
          oneSentenceSummary: data.oneLineHighlight || 'No summary available'
        },
        cardDetail: {
          ...existingCard.cardDetail,
          experienceName: data.experienceName || 'Untitled Experience',
          timeAndLocation: data.locationAndTime || '',
          backgroundContext: data.scenarioIntroduction || '',
          myRoleAndTasks: data.myRole || '',
          taskDetails: data.eventProcess || '',
          reflectionAndResults: data.reflection || '',
          highlightSentence: data.oneLineHighlight || ''
        },
        completionLevel: (completionPercentage >= 70 ? 'complete' : completionPercentage >= 30 ? 'partial' : 'incomplete') as CompletionLevel,
        updatedAt: new Date()
      };

      // Update the card in directions
      const updatedDirections = directions.map(dir => ({
        ...dir,
        cards: dir.cards.map(card =>
          card.id === existingCardId ? updatedCard : card
        )
      }));
      updateDirections(updatedDirections);

      // Update saved cards
      setSavedCards(prev => new Map(prev.set(existingCardId, data)));

      alert(`Experience card updated successfully! Completion: ${completionPercentage}%`);
    } else {
      // Create new card
      const cardId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      const newCard = {
        id: cardId,
        category: 'Focus Match' as const,
        cardPreview: {
          experienceName: data.experienceName || 'Untitled Experience',
          timeAndLocation: data.locationAndTime || '',
          oneSentenceSummary: data.oneLineHighlight || 'No summary available'
        },
        cardDetail: {
          experienceName: data.experienceName || 'Untitled Experience',
          timeAndLocation: data.locationAndTime || '',
          backgroundContext: data.scenarioIntroduction || '',
          myRoleAndTasks: data.myRole || '',
          taskDetails: data.eventProcess || '',
          reflectionAndResults: data.reflection || '',
          highlightSentence: data.oneLineHighlight || '',
          editableFields: ['experienceName', 'timeAndLocation', 'backgroundContext', 'myRoleAndTasks', 'taskDetails', 'reflectionAndResults', 'highlightSentence']
        },
        completionLevel: (completionPercentage >= 70 ? 'complete' : completionPercentage >= 30 ? 'partial' : 'incomplete') as CompletionLevel,
        source: {
          type: 'user_input' as const
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add the card to the first direction (Focus Match)
      const updatedDirections = directions.map(dir =>
        dir.id === 'direction-1'
          ? { ...dir, cards: [...dir.cards, newCard] }
          : dir
      );
      updateDirections(updatedDirections);

      // Save the card data
      setSavedCards(prev => new Map(prev.set(cardId, data)));

      alert(`Experience card created successfully! Completion: ${completionPercentage}%`);
    }

    setIsDetailModalOpen(false);
    setCurrentCardData(undefined);
  };

  const handleDeleteCard = (cardId: string) => {
    // Remove from saved cards
    setSavedCards(prev => {
      const newMap = new Map(prev);
      newMap.delete(cardId);
      return newMap;
    });

    // Remove from directions
    const updatedDirections = directions.map(dir => ({
      ...dir,
      cards: dir.cards.filter(card => card.id !== cardId)
    }));
    updateDirections(updatedDirections);
  };

  const handleFileUpload = async (file: File) => {
    console.log('File uploaded:', file.name);
    setHasInteracted(true);
    setUploadedFiles(prev => [...prev, file]);

    if (!selectedIndustry || !userGoal) {
      alert('Missing user goal or selected industry. Please go back and complete the setup.');
      return;
    }

    try {
      setIsGeneratingCards(true);

      // Process the uploaded file and generate new AI cards
      const formData = new FormData();
      formData.append('userGoal', userGoal);
      formData.append('selectedIndustry', selectedIndustry.cardPreview.fieldName);
      formData.append('files', file);

      console.log('📤 Processing uploaded file and generating new cards...');
      const response = await fetch('/api/ai/generate-experience-cards', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ New AI cards generated from uploaded file:', data);

      // 🔧 FIX: Convert AI cards with proper source type (uploaded_resume for file uploads)
      // Force uploaded_resume type for experience page file uploads
      const newAICards = data.经验卡片推荐.map((card: AICardResponse) => convertAICardToExperienceCard(card, false, true)) || [];

      console.log('🔄 [FILE UPLOAD] Converted cards from experience page upload:', {
        totalCards: newAICards.length,
        sourceTypes: newAICards.map((c: ExperienceCard) => c.source.type),
        cardNames: newAICards.map((c: ExperienceCard) => c.cardPreview.experienceName)
      });

      // Add new cards to existing directions
      const updatedDirections = directions.map(dir => {
        const newCards = newAICards.filter((card: ExperienceCard) => {
          if (dir.id === 'direction-1' && card.category === 'Focus Match') return true;
          if (dir.id === 'direction-2' && card.category === 'Growth Potential') return true;
          if (dir.id === 'direction-3' && card.category === 'Foundation Skills') return true;
          return false;
        });

        if (newCards.length > 0) {
          return {
            ...dir,
            cards: [...dir.cards, ...newCards],
            extractedCount: dir.extractedCount + newCards.filter((c: ExperienceCard) => c.source.type === 'uploaded_resume').length,
            aiRecommendedCount: dir.aiRecommendedCount + newCards.filter((c: ExperienceCard) => c.source.type === 'ai_generated').length
          };
        }
        return dir;
      });
      updateDirections(updatedDirections);

      alert(`File "${file.name}" processed successfully! Generated ${newAICards.length} new experience cards.`);

    } catch (error) {
      console.error('❌ Error processing uploaded file:', error);
      alert(`Error processing file "${file.name}". Please try again.`);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleNext = () => {
    // Check if user has at least one card or has interacted with the interface
    const hasCards = directions.some(dir => dir.cards.length > 0);

    if (!hasCards && !hasInteracted) {
      alert('Please add at least one experience card or upload a file before proceeding.');
      return;
    }

    // Save current state to localStorage for next page
    localStorage.setItem('experienceDirections', JSON.stringify(directions));
    localStorage.setItem('hasInteracted', JSON.stringify(hasInteracted));

    // Navigate to card combination page
    router.push('/combination');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: '#333',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            i
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#4285f4',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            RELEVANT CARDS
          </h1>

          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid #4285f4',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '1rem',
              height: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#4285f4' }}></div>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#4285f4' }}></div>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#4285f4' }}></div>
            </div>
          </div>
        </div>

        {/* Loading State or Card Directions */}
        {isGeneratingCards ? (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '2px solid #2196f3',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            marginBottom: '2rem',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              width: '3rem',
              height: '3rem',
              border: '4px solid #e3f2fd',
              borderTop: '4px solid #2196f3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1.5rem'
            }} />
            <h2 style={{ color: '#1976d2', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
              🤖 Generating AI Experience Cards...
            </h2>
            <p style={{ color: '#666', margin: 0, fontSize: '1.1rem', maxWidth: '500px' }}>
              Analyzing your career goal and uploaded content to create personalized experience cards across three strategic directions
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '2rem' }}>
            {directions.map((direction, index) => (
              <CardCategory
                key={direction.id}
                direction={direction}
                onToggle={toggleDirection}
                onCardClick={handleCardClick}
                onCreateNewCard={handleCreateNewCard}
                onDeleteCard={handleDeleteCard}
                isFirstDirection={index === 0}
              />
            ))}
          </div>
        )}

        {/* Floating Upload Button */}
        <FloatingUploadButton onFileSelect={handleFileUpload} />

        {/* Navigation Buttons */}
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          display: 'flex',
          gap: '1rem',
          zIndex: 100
        }}>
          <button
            onClick={handleBack}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            style={{
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3367d6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4285f4'}
          >
            Next
          </button>
        </div>

        {/* Experience Card Detail Modal */}
        <ExperienceCardDetail
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          onSave={handleDetailModalSave}
          initialData={currentCardData}
        />
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
