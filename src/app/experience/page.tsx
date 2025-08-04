'use client';

import { useState, useEffect } from 'react';
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

  const [isGeneratingCards, setIsGeneratingCards] = useState(true); // 初始为true
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Suppress unused variable warnings for future use
  void savedCards;
  void uploadedFiles;

  // 🔧 UNIFIED FIX: 移除updateDirections函数，现在使用CardDataManager统一管理

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
    console.log('🚀 [EXPERIENCE] Initializing with unified CardDataManager...');

    // 重置组件状态
    setDirections([]);
    setHasInteracted(false);
    setSavedCards(new Map());
    setIsGeneratingCards(true);

    // 加载用户基础信息
    const storedIndustry = localStorage.getItem('selectedIndustry');
    const storedGoal = localStorage.getItem('userGoal');

    if (storedIndustry) {
      setSelectedIndustry(JSON.parse(storedIndustry));
    }

    if (storedGoal) {
      setUserGoal(storedGoal);
    }

    // 如果没有选择行业，重定向到首页
    if (!storedIndustry || !storedGoal) {
      console.log('❌ [EXPERIENCE] Missing required data, redirecting to homepage');
      router.push('/');
      return;
    }

    // 🔧 UNIFIED FIX: 统一的数据加载逻辑
    initializeExperienceData(storedGoal, JSON.parse(storedIndustry));
  }, [router, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔧 NEW: 初始化动态方向分类
  const initializeDynamicDirections = async (userGoal: string, selectedIndustry: string) => {
    console.log('🎯 [DYNAMIC_DIRECTIONS] Initializing dynamic directions...');

    // 检查是否已经有动态方向
    const existingDirections = CardDataManager.getDynamicDirections();
    if (existingDirections && existingDirections.length === 3) {
      console.log('✅ [DYNAMIC_DIRECTIONS] Using existing dynamic directions:', {
        directionTitles: existingDirections.map(d => d.方向标题)
      });
      return;
    }

    try {
      // 调用API生成动态方向
      console.log('📤 [DYNAMIC_DIRECTIONS] Requesting dynamic directions from API...');
      const response = await fetch('/api/ai/generate-dynamic-directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGoal,
          selectedIndustry
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 [DYNAMIC_DIRECTIONS] API response received:', data);

      if (data.个性化方向分类 && Array.isArray(data.个性化方向分类) && data.个性化方向分类.length === 3) {
        // 存储动态方向到CardDataManager
        const success = CardDataManager.setDynamicDirections(data.个性化方向分类);
        if (success) {
          console.log('✅ [DYNAMIC_DIRECTIONS] Dynamic directions generated and stored successfully');
        } else {
          console.error('❌ [DYNAMIC_DIRECTIONS] Failed to store dynamic directions');
        }
      } else {
        console.error('❌ [DYNAMIC_DIRECTIONS] Invalid API response structure');
      }

    } catch (error) {
      console.error('❌ [DYNAMIC_DIRECTIONS] Error generating dynamic directions:', error);
      console.log('🔄 [DYNAMIC_DIRECTIONS] Will use default directions as fallback');
    }
  };

  // 🔧 UNIFIED FIX: 统一的数据初始化函数
  const initializeExperienceData = async (userGoal: string, selectedIndustry: IndustryRecommendation) => {
    console.log('📊 [EXPERIENCE] Initializing experience data...');

    // 1. 首先生成或加载动态方向分类
    await initializeDynamicDirections(userGoal, selectedIndustry.cardPreview.fieldName);

    // 2. 检查CardDataManager中是否有现有数据
    const existingCards = CardDataManager.getAllCards();
    console.log('📋 [EXPERIENCE] Existing cards in CardDataManager:', existingCards.length);

    if (existingCards.length > 0) {
      // 有现有数据，直接加载
      console.log('✅ [EXPERIENCE] Loading existing cards from CardDataManager');
      const directionsData = CardDataManager.getDirectionsData();
      setDirections(directionsData);
      setIsGeneratingCards(false);
      return;
    }

    // 3. 检查是否有首页传递的AI响应需要处理
    const homepageAIResponse = localStorage.getItem('homepageAIResponse');
    const homepageFileCount = localStorage.getItem('homepageFileCount');

    if (homepageAIResponse) {
      console.log('📁 [EXPERIENCE] Processing homepage AI response...');
      try {
        const aiResponse = JSON.parse(homepageAIResponse);
        const fileCount = parseInt(homepageFileCount || '0');

        // 处理首页数据并添加到CardDataManager（使用智能分类）
        await processHomepageAIResponse(aiResponse, fileCount);

        // 清理首页数据
        localStorage.removeItem('homepageAIResponse');
        localStorage.removeItem('homepageFileCount');

        console.log('✅ [EXPERIENCE] Homepage data processed and cleaned up');
        return;
      } catch (error) {
        console.error('❌ [EXPERIENCE] Error processing homepage AI response:', error);
      }
    }

    // 4. 没有现有数据，生成新的AI建议卡片或显示空结构
    console.log('🤖 [EXPERIENCE] No existing data, generating AI suggestion cards...');
    await generateAICards(userGoal, selectedIndustry, []);
  };

  // 🔧 UNIFIED FIX: 处理首页AI响应的专用函数
  const processHomepageAIResponse = async (aiResponse: AIGeneratedCardsResponse, fileCount: number) => {
    console.log('📁 [HOMEPAGE_PROCESS] Processing AI response from homepage:', {
      cardsCount: aiResponse.经验卡片推荐?.length || 0,
      fileCount
    });

    if (!aiResponse.经验卡片推荐 || !Array.isArray(aiResponse.经验卡片推荐)) {
      console.error('❌ [HOMEPAGE_PROCESS] Invalid AI response structure');
      return;
    }

    // 转换AI响应为ExperienceCard格式
    const experienceCards = aiResponse.经验卡片推荐
      .filter((card: AICardResponse) => card && card.小卡展示 && card.详情卡展示)
      .map((card: AICardResponse) => convertAICardToExperienceCard(card, true, true)); // fromHomepage=true, forceUploadedResume=true

    console.log('🔄 [HOMEPAGE_PROCESS] Converted cards:', {
      originalCount: aiResponse.经验卡片推荐.length,
      convertedCount: experienceCards.length,
      sourceTypes: experienceCards.map(c => c.source.type)
    });

    // 🔧 SMART CLASSIFICATION: 通过CardDataManager智能添加卡片
    const success = await CardDataManager.addCardsWithSmartClassification(experienceCards, 'homepage', fileCount);

    if (success) {
      // 🔧 CRITICAL FIX: 使用setTimeout确保状态更新正确执行
      setTimeout(() => {
        const directionsData = CardDataManager.getDirectionsData();

        console.log('🔄 [HOMEPAGE_PROCESS] About to update directions state:', {
          newTotalCards: directionsData.reduce((sum, dir) => sum + dir.cards.length, 0)
        });

        setDirections(directionsData);
        setIsGeneratingCards(false);

        console.log('✅ [HOMEPAGE_PROCESS] Homepage cards successfully processed and UI updated');
      }, 100);
    } else {
      console.error('❌ [HOMEPAGE_PROCESS] Failed to add homepage cards to CardDataManager');
    }
  };

  // 🔧 UNIFIED FIX: 移除未使用的processGeneratedCards函数，现在直接在各个工作流中处理

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

  // 🔧 UNIFIED FIX: 生成AI建议卡片（当没有现有数据时）
  const generateAICards = async (goal: string, industry: IndustryRecommendation, files: File[] = []) => {
    console.log('🤖 [AI_GENERATE] Generating AI suggestion cards...', {
      goal: goal.substring(0, 50) + '...',
      industry: industry.cardPreview.fieldName,
      filesCount: files.length
    });
    setIsGeneratingCards(true);

    try {
      // 🔧 UNIFIED FIX: 如果没有文件，显示空的方向结构供手动创建
      if (files.length === 0) {
        console.log('📝 [AI_GENERATE] No files provided, showing empty directions for manual card creation');

        // 使用CardDataManager获取方向数据（包括动态方向）
        const directionsData = CardDataManager.getDirectionsData();
        setDirections(directionsData);
        setIsGeneratingCards(false);
        return;
      }

      // 🔧 UNIFIED FIX: 如果有文件，通过AI生成建议卡片
      const formData = new FormData();
      formData.append('userGoal', goal);
      formData.append('selectedIndustry', industry.cardPreview.fieldName);

      files.forEach((file) => {
        formData.append('files', file);
      });

      console.log('📤 [AI_GENERATE] Sending request to generate AI suggestion cards...');
      const response = await fetch('/api/ai/generate-experience-cards', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResponse = await response.json();
      console.log('✅ [AI_GENERATE] AI suggestion cards generated:', aiResponse);

      // 🔧 UNIFIED FIX: 处理AI响应并通过CardDataManager管理
      if (aiResponse.经验卡片推荐 && Array.isArray(aiResponse.经验卡片推荐)) {
        const suggestionCards = aiResponse.经验卡片推荐
          .filter((card: AICardResponse) => card && card.小卡展示 && card.详情卡展示)
          .map((card: AICardResponse) => convertAICardToExperienceCard(card, false, false)); // AI建议卡片

        // 🔧 SMART CLASSIFICATION: 通过CardDataManager智能添加AI建议卡片
        const success = await CardDataManager.addCardsWithSmartClassification(suggestionCards, 'experience', files.length);

        if (success) {
          // 🔧 CRITICAL FIX: 使用setTimeout确保状态更新正确执行
          setTimeout(() => {
            const directionsData = CardDataManager.getDirectionsData();

            console.log('🔄 [AI_GENERATE] About to update directions state:', {
              newTotalCards: directionsData.reduce((sum, dir) => sum + dir.cards.length, 0)
            });

            setDirections(directionsData);
            console.log('✅ [AI_GENERATE] AI suggestion cards added and UI updated');
          }, 100);
        } else {
          console.error('❌ [AI_GENERATE] Failed to add AI suggestion cards to CardDataManager');
        }
      }

    } catch (error) {
      console.error('❌ [AI_GENERATE] Error generating AI suggestion cards:', error);
      // 显示空方向作为降级处理，使用CardDataManager获取方向数据
      const directionsData = CardDataManager.getDirectionsData();
      setDirections(directionsData);
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
    setDirections(updatedDirections);
  };

  const handleCardClick = (cardId: string) => {
    console.log('Card clicked:', cardId);
    setHasInteracted(true);

    // Find the card in all directions
    let foundCard: ExperienceCard | null = null;
    for (const direction of directions) {
      foundCard = direction.cards.find(card => card.id === cardId) || null;
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
        oneLineHighlight: foundCard.cardDetail.highlightSentence,
        _cardId: foundCard.id // 添加卡片ID用于编辑识别
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

  // 🔧 UNIFIED FIX: 手动创建/编辑卡片 - 工作流3
  const handleDetailModalSave = (data: ExperienceDetailData) => {
    console.log('💾 [MANUAL_CARD] Saving experience data:', data);
    setHasInteracted(true);

    // 计算完整度百分比
    const completionPercentage = calculateCompletionPercentage(data);

    // 检查是否是编辑现有卡片
    const isEditing = data._cardId !== undefined;

    if (isEditing) {
      // 🔧 UNIFIED FIX: 更新现有卡片（暂时通过directions更新，后续可以扩展CardDataManager支持更新）
      console.log('✏️ [MANUAL_CARD] Updating existing card:', data._cardId);

      const updatedDirections = directions.map(dir => ({
        ...dir,
        cards: dir.cards.map(card => {
          if (card.id === data._cardId) {
            return {
              ...card,
              cardPreview: {
                experienceName: data.experienceName || 'Untitled Experience',
                timeAndLocation: data.locationAndTime || '',
                oneSentenceSummary: data.oneLineHighlight || 'No summary available'
              },
              cardDetail: {
                ...card.cardDetail,
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
          }
          return card;
        })
      }));

      setDirections(updatedDirections);
      setSavedCards(prev => new Map(prev.set(data._cardId!, data)));

      console.log('✅ [MANUAL_CARD] Card updated successfully');
      alert(`Experience card updated successfully! Completion: ${completionPercentage}%`);
    } else {
      // 🔧 UNIFIED FIX: 创建新卡片并通过CardDataManager管理
      console.log('➕ [MANUAL_CARD] Creating new manual card');

      const newCard: ExperienceCard = {
        id: `manual-card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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

      // 🔧 UNIFIED FIX: 通过CardDataManager添加手动创建的卡片
      const success = CardDataManager.addCards([newCard], 'manual');

      if (success) {
        // 🔧 CRITICAL FIX: 使用setTimeout确保状态更新正确执行
        setTimeout(() => {
          const updatedDirections = CardDataManager.getDirectionsData();

          console.log('🔄 [MANUAL_CARD] About to update directions state:', {
            newTotalCards: updatedDirections.reduce((sum, dir) => sum + dir.cards.length, 0)
          });

          setDirections(updatedDirections);

          // 保存卡片数据
          setSavedCards(prev => new Map(prev.set(newCard.id, data)));

          console.log('✅ [MANUAL_CARD] Manual card created and UI updated');
          alert(`Experience card created successfully! Completion: ${completionPercentage}%`);
        }, 100);
      } else {
        console.error('❌ [MANUAL_CARD] Failed to add manual card to CardDataManager');
        alert('Failed to save card. Please try again.');
      }
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
    setDirections(updatedDirections);
  };

  // 🔧 UNIFIED FIX: Experience页面文件上传 - 工作流2
  const handleFileUpload = async (file: File) => {
    console.log('📁 [EXPERIENCE_UPLOAD] File uploaded:', file.name);
    setHasInteracted(true);
    setUploadedFiles(prev => [...prev, file]);

    if (!selectedIndustry || !userGoal) {
      alert('Missing user goal or selected industry. Please go back and complete the setup.');
      return;
    }

    try {
      setIsGeneratingCards(true);

      // 处理上传的文件并生成新的AI卡片
      const formData = new FormData();
      formData.append('userGoal', userGoal);
      formData.append('selectedIndustry', selectedIndustry.cardPreview.fieldName);
      formData.append('files', file);

      console.log('📤 [EXPERIENCE_UPLOAD] Processing file through AI...');
      const response = await fetch('/api/ai/generate-experience-cards', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResponse = await response.json();
      console.log('✅ [EXPERIENCE_UPLOAD] AI response received:', aiResponse);

      // 🔧 UNIFIED FIX: 转换AI响应为ExperienceCard格式
      if (!aiResponse.经验卡片推荐 || !Array.isArray(aiResponse.经验卡片推荐)) {
        console.error('❌ [EXPERIENCE_UPLOAD] Invalid AI response structure');
        alert('Failed to process file. Invalid response from AI.');
        return;
      }

      const newCards = aiResponse.经验卡片推荐
        .filter((card: AICardResponse) => card && card.小卡展示 && card.详情卡展示)
        .map((card: AICardResponse) => convertAICardToExperienceCard(card, false, true)); // forceUploadedResume=true

      console.log('🔄 [EXPERIENCE_UPLOAD] Converted cards:', {
        originalCount: aiResponse.经验卡片推荐.length,
        convertedCount: newCards.length,
        sourceTypes: newCards.map((c: ExperienceCard) => c.source.type),
        cardCategories: newCards.map((c: ExperienceCard) => ({ name: c.cardPreview.experienceName, category: c.category })),
        aiResponseCategories: aiResponse.经验卡片推荐.map((c: AICardResponse) => ({ name: c.小卡展示?.经历名称, category: c.卡片分组 }))
      });

      // 🔧 SMART CLASSIFICATION: 通过CardDataManager智能添加卡片
      const success = await CardDataManager.addCardsWithSmartClassification(newCards, 'experience', 1);

      if (success) {
        // 🔧 CRITICAL FIX: 使用setTimeout确保状态更新在下一个事件循环中执行
        // 这解决了React状态更新时机的问题
        setTimeout(() => {
          const updatedDirections = CardDataManager.getDirectionsData();

          console.log('🔄 [EXPERIENCE_UPLOAD] About to update directions state:', {
            currentDirectionsCount: directions.length,
            currentTotalCards: directions.reduce((sum, dir) => sum + dir.cards.length, 0),
            newDirectionsCount: updatedDirections.length,
            newTotalCards: updatedDirections.reduce((sum, dir) => sum + dir.cards.length, 0),
            newDirectionDetails: updatedDirections.map(dir => ({
              title: dir.title,
              cardCount: dir.cards.length,
              isExpanded: dir.isExpanded,
              cardDetails: dir.cards.map(c => ({
                name: c.cardPreview.experienceName,
                sourceType: c.source.type,
                category: c.category
              }))
            }))
          });

          // 强制更新UI显示，确保新卡片立即可见
          setDirections(updatedDirections);
          setIsGeneratingCards(false);

          console.log('✅ [EXPERIENCE_UPLOAD] File processed successfully and UI updated:', {
            newCardsCount: newCards.length,
            totalDirections: updatedDirections.length,
            totalCards: updatedDirections.reduce((sum, dir) => sum + dir.cards.length, 0)
          });

          alert(`File "${file.name}" processed successfully! Generated ${newCards.length} new experience cards.`);
        }, 100); // 100ms延迟确保状态更新正确执行

      } else {
        console.error('❌ [EXPERIENCE_UPLOAD] Failed to add cards to CardDataManager');
        alert('Failed to save processed cards. Please try again.');
      }

    } catch (error) {
      console.error('❌ [EXPERIENCE_UPLOAD] Error processing file:', error);
      alert(`Error processing file "${file.name}". Please try again.`);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  // 🔧 UNIFIED FIX: 导航到Combination页面
  const handleNext = () => {
    console.log('🚀 [EXPERIENCE] Navigating to combination page...');

    // 检查是否有卡片或用户已交互
    const allCards = CardDataManager.getAllCards();
    const hasCards = allCards.length > 0;

    if (!hasCards && !hasInteracted) {
      alert('Please add at least one experience card or upload a file before proceeding.');
      return;
    }

    console.log('📊 [EXPERIENCE] Session stats before navigation:', {
      totalCards: allCards.length,
      hasInteracted,
      sessionStats: CardDataManager.getSessionStats()
    });

    // 🔧 UNIFIED FIX: 数据已经通过CardDataManager统一管理，无需额外存储
    // CardDataManager已经处理了所有数据的持久化

    // 导航到卡片组合页面
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
                isFirstDirection={index === 0} // 保留这个属性用于样式区分，但所有方向都支持编辑
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
