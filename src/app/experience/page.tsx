'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IndustryRecommendation } from '@/types/api';
import { CardDirection, CompletionLevel, ExperienceCard, CardCategory as CardCategoryType } from '@/types/card';
import { CardCategory } from '@/components/CardCategory';
import { FloatingUploadButton } from '@/components/FileUpload';
import { ExperienceCardDetail, ExperienceDetailData } from '@/components/ExperienceCardDetail';
import { CardDataManager } from '@/lib/CardDataManager';
import { ParsedFileContent } from '@/lib/fileParser';

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
  灰色提示?: {
    经历名称?: string;
    一句话概述?: string;
    背景与情境说明?: string;
    我的角色与任务?: string;
    任务细节描述?: string;
    反思与结果总结?: string;
    高光总结句?: string;
  };
}

interface AICardResponse {
  卡片分组: string;
  小卡展示: AICardPreview;
  详情卡展示: AICardDetail;
}

interface AIGeneratedCardsResponse {
  经验卡片推荐: AICardResponse[];
  AI推测经历?: AICardResponse[];
}

// 内部组件，使用useSearchParams
function ExperiencePageContent() {
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
    // Exclude _cardId and _placeholderHints from calculation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _cardId, _placeholderHints, ...fieldsToCheck } = data;
    const fields = Object.values(fieldsToCheck);

    // Filter out empty fields and placeholder text
    const filledFields = fields.filter(field => {
      if (!field || field.trim().length === 0) return false;

      // Check for placeholder patterns
      const trimmedField = field.trim();
      const isPlaceholder =
        trimmedField.includes('[') && trimmedField.includes('待补充]') ||
        trimmedField.includes('[') && trimmedField.includes('信息缺失]') ||
        trimmedField.includes('信息缺失') ||
        trimmedField.includes('结果信息缺失') ||
        trimmedField.includes('时间地点信息缺失') ||
        trimmedField === '[待补充]' ||
        trimmedField === '[信息缺失]';

      return !isPlaceholder;
    });

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

    // 2. 检查是否有首页传递的AI响应需要处理（优先处理）
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
        return; // 🔧 FIX: 确保处理完首页数据后直接返回，不再执行其他逻辑
      } catch (error) {
        console.error('❌ [EXPERIENCE] Error processing homepage AI response:', error);
        // 清理损坏的数据
        localStorage.removeItem('homepageAIResponse');
        localStorage.removeItem('homepageFileCount');
      }
    }

    // 3. 检查CardDataManager中是否有现有数据
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

    // 4. 没有现有数据且没有首页数据，显示空的方向结构供手动创建
    console.log('📝 [EXPERIENCE] No existing data, showing empty directions for manual card creation');
    const directionsData = CardDataManager.getDirectionsData();
    setDirections(directionsData);
    setIsGeneratingCards(false);
  };

  // 🔧 UNIFIED FIX: 处理首页AI响应的专用函数
  const processHomepageAIResponse = async (aiResponse: AIGeneratedCardsResponse, fileCount: number) => {
    console.log('📁 [HOMEPAGE_PROCESS] Processing AI response from homepage:', {
      realCardsCount: aiResponse.经验卡片推荐?.length || 0,
      aiSuggestedCardsCount: aiResponse.AI推测经历?.length || 0,
      fileCount
    });

    if (!aiResponse.经验卡片推荐 || !Array.isArray(aiResponse.经验卡片推荐)) {
      console.error('❌ [HOMEPAGE_PROCESS] Invalid AI response structure');
      return;
    }

    // 处理真实经历卡片
    const realCards = aiResponse.经验卡片推荐
      .filter((card: AICardResponse) => card && card.小卡展示 && card.详情卡展示)
      .map((card: AICardResponse) => convertAICardToExperienceCard(card, true, true)); // fromHomepage=true, forceUploadedResume=true

    // 处理AI推测经历卡片
    const aiSuggestedCards = (aiResponse.AI推测经历 || [])
      .filter((card: AICardResponse) => card && card.小卡展示 && card.详情卡展示)
      .map((card: AICardResponse) => convertAICardToExperienceCard(card, true, false)); // fromHomepage=true, AI推测卡片

    // 合并所有卡片
    const experienceCards = [...realCards, ...aiSuggestedCards];

    console.log('🔄 [HOMEPAGE_PROCESS] Converted cards:', {
      realCardsCount: realCards.length,
      aiSuggestedCardsCount: aiSuggestedCards.length,
      totalCardsCount: experienceCards.length,
      sourceTypes: experienceCards.map(c => c.source.type)
    });

    // 🔧 SMART CLASSIFICATION: 通过CardDataManager智能添加卡片
    const result = await CardDataManager.addCardsWithSmartClassification(experienceCards, 'homepage', fileCount);

    if (result.success) {
      // 🔧 CRITICAL FIX: 使用setTimeout确保状态更新正确执行
      setTimeout(() => {
        const directionsData = CardDataManager.getDirectionsData();

        // 🔧 NEW: 如果有受影响的方向，自动展开它们
        if (result.affectedDirections && result.affectedDirections.length > 0) {
          const updatedDirections = directionsData.map(dir => ({
            ...dir,
            isExpanded: result.affectedDirections!.includes(dir.id) || dir.isExpanded
          }));

          console.log('🔄 [HOMEPAGE_PROCESS] Auto-expanding affected directions:', {
            affectedDirections: result.affectedDirections,
            expandedDirections: updatedDirections.filter(d => d.isExpanded).map(d => d.id)
          });

          setDirections(updatedDirections);
        } else {
          setDirections(directionsData);
        }

        console.log('🔄 [HOMEPAGE_PROCESS] About to update directions state:', {
          newTotalCards: directionsData.reduce((sum, dir) => sum + dir.cards.length, 0),
          affectedDirections: result.affectedDirections
        });

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

    // Calculate completion level based on actual content and source type
    const calculateCompletionLevel = (): CompletionLevel => {
      // 🔧 UPDATED: 现在AI推测卡片的字段都是空的，自然计算为0%完成度

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

      // Filter out empty fields and placeholder text
      const filledFields = fields.filter(field => {
        if (!field || field.trim().length === 0) return false;

        // Check for placeholder patterns
        const trimmedField = field.trim();
        const isPlaceholder =
          trimmedField.includes('[') && trimmedField.includes('待补充]') ||
          trimmedField.includes('[') && trimmedField.includes('信息缺失]') ||
          trimmedField.includes('信息缺失') ||
          trimmedField.includes('结果信息缺失') ||
          trimmedField.includes('时间地点信息缺失') ||
          trimmedField === '[待补充]' ||
          trimmedField === '[信息缺失]' ||
          trimmedField.startsWith('（例如：'); // AI推测的占位符文本

        return !isPlaceholder;
      });

      const fillRatio = filledFields.length / fields.length;

      if (fillRatio === 0) return 'incomplete';
      if (fillRatio < 0.7) return 'partial';
      return 'complete';
    };

    // 🔧 FIX: 检查是否为AI推测卡片，决定字段内容
    const sourceType = safeGet(aiCard.详情卡展示?.生成来源, '类型');
    const hasPlaceholderHints = aiCard.详情卡展示?.灰色提示;
    const isAIGenerated = sourceType === 'ai_generated' || sourceType === 'AI推测';
    const isAISuggestedCard = (isAIGenerated || hasPlaceholderHints) && !forceUploadedResume;

    return {
      id: cardId,
      category: category,
      cardPreview: isAISuggestedCard ? {
        // AI推测卡片：预览字段也为空，使用placeholder
        experienceName: safeGet(aiCard.小卡展示, '经历名称', 'Untitled Experience'), // 保留标题用于识别
        timeAndLocation: '', // 空字段
        oneSentenceSummary: '' // 空字段
      } : {
        // 真实卡片：使用实际内容
        experienceName: safeGet(aiCard.小卡展示, '经历名称', 'Untitled Experience'),
        timeAndLocation: safeGet(aiCard.小卡展示, '时间与地点', 'Time and location not specified'),
        oneSentenceSummary: safeGet(aiCard.小卡展示, '一句话概述', 'No summary available')
      },
      cardDetail: (() => {
        // 🔧 FIX: AI推测卡片的字段应该为空，占位符内容放到placeholderHints中
        const hasPlaceholderHints = aiCard.详情卡展示?.灰色提示;
        const sourceType = safeGet(aiCard.详情卡展示?.生成来源, '类型');
        const isAIGenerated = sourceType === 'ai_generated' || sourceType === 'AI推测';

        if ((isAIGenerated || hasPlaceholderHints) && !forceUploadedResume) {
          // AI推测卡片：字段为空，使用灰色提示
          return {
            experienceName: '', // 空字段
            timeAndLocation: '', // 空字段
            backgroundContext: '', // 空字段
            myRoleAndTasks: '', // 空字段
            taskDetails: '', // 空字段
            reflectionAndResults: '', // 空字段
            highlightSentence: '', // 空字段
            editableFields: ['experienceName', 'timeAndLocation', 'backgroundContext', 'myRoleAndTasks', 'taskDetails', 'reflectionAndResults', 'highlightSentence'],
            // 将原本的字段内容作为placeholder提示
            placeholderHints: {
              experienceName: safeGet(aiCard.详情卡展示, '经历名称', ''),
              timeAndLocation: safeGet(aiCard.详情卡展示, '时间与地点', ''),
              backgroundContext: safeGet(aiCard.详情卡展示, '背景与情境说明', ''),
              myRoleAndTasks: safeGet(aiCard.详情卡展示, '我的角色与任务', ''),
              taskDetails: safeGet(aiCard.详情卡展示, '任务细节描述', ''),
              reflectionAndResults: safeGet(aiCard.详情卡展示, '反思与结果总结', ''),
              highlightSentence: safeGet(aiCard.详情卡展示, '高光总结句', '')
            }
          };
        } else {
          // 真实卡片：使用实际字段内容
          return {
            experienceName: safeGet(aiCard.详情卡展示, '经历名称', 'Untitled Experience'),
            timeAndLocation: safeGet(aiCard.详情卡展示, '时间与地点', 'Time and location not specified'),
            backgroundContext: safeGet(aiCard.详情卡展示, '背景与情境说明', ''),
            myRoleAndTasks: safeGet(aiCard.详情卡展示, '我的角色与任务', ''),
            taskDetails: safeGet(aiCard.详情卡展示, '任务细节描述', ''),
            reflectionAndResults: safeGet(aiCard.详情卡展示, '反思与结果总结', ''),
            highlightSentence: safeGet(aiCard.详情卡展示, '高光总结句', ''),
            editableFields: ['experienceName', 'timeAndLocation', 'backgroundContext', 'myRoleAndTasks', 'taskDetails', 'reflectionAndResults', 'highlightSentence'],
            placeholderHints: aiCard.详情卡展示?.灰色提示 ? {
              experienceName: safeGet(aiCard.详情卡展示.灰色提示, '经历名称', ''),
              oneSentenceSummary: safeGet(aiCard.详情卡展示.灰色提示, '一句话概述', ''),
              backgroundContext: safeGet(aiCard.详情卡展示.灰色提示, '背景与情境说明', ''),
              myRoleAndTasks: safeGet(aiCard.详情卡展示.灰色提示, '我的角色与任务', ''),
              taskDetails: safeGet(aiCard.详情卡展示.灰色提示, '任务细节描述', ''),
              reflectionAndResults: safeGet(aiCard.详情卡展示.灰色提示, '反思与结果总结', ''),
              highlightSentence: safeGet(aiCard.详情卡展示.灰色提示, '高光总结句', '')
            } : undefined
          };
        }
      })(),
      completionLevel: calculateCompletionLevel(),
      source: {
        // 🔧 FIX: Improved source type detection logic with force override
        type: forceUploadedResume ? 'uploaded_resume' :
              (safeGet(aiCard.详情卡展示?.生成来源, '类型') === 'ai_generated' || safeGet(aiCard.详情卡展示?.生成来源, '类型') === 'AI推测') ? 'ai_generated' :
              determineSourceType(safeGet(aiCard.详情卡展示?.生成来源, '类型'), fromHomepage)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  // 🔧 REMOVED: generateAICards函数已移除，因为重构后的数据初始化逻辑不再需要它

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
        _cardId: foundCard.id, // 添加卡片ID用于编辑识别
        _placeholderHints: foundCard.cardDetail.placeholderHints // 添加AI建议的灰色提示文本
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
    console.log('🗑️ [DELETE_CARD] Deleting card:', cardId);

    // 🔧 FIX: 从CardDataManager中删除卡片
    const success = CardDataManager.removeCard(cardId);

    if (success) {
      console.log('✅ [DELETE_CARD] Card removed from CardDataManager');

      // 更新本地状态
      setSavedCards(prev => {
        const newMap = new Map(prev);
        newMap.delete(cardId);
        return newMap;
      });

      // 从CardDataManager获取更新后的方向数据
      const updatedDirections = CardDataManager.getDirectionsData();
      setDirections(updatedDirections);

      console.log('✅ [DELETE_CARD] Card deleted successfully and UI updated');
    } else {
      console.error('❌ [DELETE_CARD] Failed to remove card from CardDataManager');
      alert('Failed to delete card. Please try again.');
    }
  };

  // 🔧 UNIFIED FIX: Experience页面文件上传 - 工作流2
  const handleFileUpload = async (file: File) => {
    // 强制显示日志，确保能看到
    console.clear(); // 清空控制台
    console.log('🚨🚨🚨 [EXPERIENCE_UPLOAD] === 开始文件上传流程 === 🚨🚨🚨');
    console.log('🚨🚨🚨 [EXPERIENCE_UPLOAD] 如果您看到这条消息，说明前端日志正常工作！');
    console.log('📁 [EXPERIENCE_UPLOAD] 文件信息:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      isValidFile: !!(file && file.name && file.size > 0)
    });

    // 立即显示文件内容预览（如果是文本文件）
    if (file.type.includes('text') || file.name.toLowerCase().endsWith('.txt')) {
      try {
        const text = await file.text();
        console.log('📄 [EXPERIENCE_UPLOAD] 文本文件内容预览:', text.substring(0, 500));
      } catch (e) {
        console.log('📄 [EXPERIENCE_UPLOAD] 无法读取文本文件内容:', e);
      }
    }

    setHasInteracted(true);
    setUploadedFiles(prev => [...prev, file]);

    if (!selectedIndustry || !userGoal) {
      console.error('❌ [EXPERIENCE_UPLOAD] 缺少必要参数:', { selectedIndustry, userGoal });
      alert('Missing user goal or selected industry. Please go back and complete the setup.');
      return;
    }

    try {
      console.log('🚀 [EXPERIENCE_UPLOAD] 开始生成卡片流程');
      setIsGeneratingCards(true);

      // 处理上传的文件并生成新的AI卡片
      const formData = new FormData();
      formData.append('userGoal', userGoal);
      formData.append('selectedIndustry', selectedIndustry.cardPreview.fieldName);
      formData.append('files', file);

      console.log('📤 [EXPERIENCE_UPLOAD] FormData准备完成:', {
        userGoal,
        selectedIndustry,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      console.log('📤 [EXPERIENCE_UPLOAD] 发送API请求到 /api/ai/generate-experience-cards');
      const startTime = Date.now();

      const response = await fetch('/api/ai/generate-experience-cards', {
        method: 'POST',
        body: formData,
      });

      const responseTime = Date.now() - startTime;
      console.log('📥 [EXPERIENCE_UPLOAD] API响应接收完成:', {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [EXPERIENCE_UPLOAD] API请求失败:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500) + '...'
        });
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const aiResponse = await response.json();
      console.log('🚨🚨🚨 [EXPERIENCE_UPLOAD] AI响应接收成功！🚨🚨🚨');
      console.log('✅ [EXPERIENCE_UPLOAD] AI响应解析成功:', {
        hasResponse: !!aiResponse,
        responseKeys: Object.keys(aiResponse || {}),
        hasExperienceCards: !!(aiResponse?.经验卡片推荐),
        cardsCount: Array.isArray(aiResponse?.经验卡片推荐) ? aiResponse.经验卡片推荐.length : 0,
        responsePreview: JSON.stringify(aiResponse).substring(0, 300) + '...'
      });

      // 🔍 [DEBUG] 显示PDF解析的原始内容
      console.log('🚨🚨🚨 [EXPERIENCE_UPLOAD] 开始检查文件解析详情...');
      console.log('🔍 [EXPERIENCE_UPLOAD] aiResponse完整内容:', aiResponse);

      if (aiResponse?.文件解析详情) {
        console.log('🚨🚨🚨 [EXPERIENCE_UPLOAD] === 找到PDF解析原始内容详情 === 🚨🚨🚨');
        console.log('📄 [EXPERIENCE_UPLOAD] 文件解析详情:', aiResponse.文件解析详情);

        if (Array.isArray(aiResponse.文件解析详情)) {
          aiResponse.文件解析详情.forEach((fileDetail: ParsedFileContent, index: number) => {
            console.log(`📄 [EXPERIENCE_UPLOAD] 文件${index + 1} - ${fileDetail.fileName}:`, {
              解析成功: fileDetail.parseSuccess,
              解析方法: fileDetail.metadata?.parsingMethod,
              文本长度: fileDetail.extractedTextLength,
              错误信息: fileDetail.parseError || 'none',
              原始文本内容: fileDetail.extractedText
            });

            // 特别显示PDF文件的原始内容
            if (fileDetail.fileName?.toLowerCase().includes('.pdf') || fileDetail.metadata?.parsingMethod === 'pdf-extraction') {
              console.log('🚨🚨🚨🚨🚨 [PDF_DEBUG] 找到PDF文件！🚨🚨🚨🚨🚨');
              console.log(`🔍 [PDF_DEBUG] PDF文件名:`, fileDetail.fileName);
              console.log(`🔍 [PDF_DEBUG] PDF解析方法:`, fileDetail.metadata?.parsingMethod);
              console.log(`🔍 [PDF_DEBUG] PDF解析是否成功:`, fileDetail.parseSuccess);
              console.log(`🔍 [PDF_DEBUG] PDF解析错误:`, fileDetail.parseError || 'none');
              console.log(`🚨🚨🚨 [PDF_DEBUG] PDF文件原始解析内容 (完整):`);
              console.log(fileDetail.extractedText);
              console.log(`🚨🚨🚨 [PDF_DEBUG] PDF内容长度:`, fileDetail.extractedText?.length || 0);
            }
          });
        }
      } else {
        console.log('❌ [EXPERIENCE_UPLOAD] 没有找到文件解析详情！');
        console.log('❌ [EXPERIENCE_UPLOAD] aiResponse中的所有键:', Object.keys(aiResponse || {}));
      }

      // 🔧 UNIFIED FIX: 转换AI响应为ExperienceCard格式
      if (!aiResponse.经验卡片推荐 || !Array.isArray(aiResponse.经验卡片推荐)) {
        console.error('❌ [EXPERIENCE_UPLOAD] Invalid AI response structure');
        alert('Failed to process file. Invalid response from AI.');
        return;
      }

      // 处理真实经历卡片
      const realCards = aiResponse.经验卡片推荐
        .filter((card: AICardResponse) => card && card.小卡展示 && card.详情卡展示)
        .map((card: AICardResponse) => convertAICardToExperienceCard(card, false, true)); // forceUploadedResume=true

      // 处理AI推测经历卡片
      const aiSuggestedCards = (aiResponse.AI推测经历 || [])
        .filter((card: AICardResponse) => card && card.小卡展示 && card.详情卡展示)
        .map((card: AICardResponse) => convertAICardToExperienceCard(card, false, false)); // AI推测卡片

      // 合并所有卡片
      const newCards = [...realCards, ...aiSuggestedCards];

      console.log('🔄 [EXPERIENCE_UPLOAD] Converted cards:', {
        realCardsCount: realCards.length,
        aiSuggestedCardsCount: aiSuggestedCards.length,
        totalCardsCount: newCards.length,
        sourceTypes: newCards.map((c: ExperienceCard) => c.source.type),
        cardCategories: newCards.map((c: ExperienceCard) => ({ name: c.cardPreview.experienceName, category: c.category, source: c.source.type }))
      });

      // 🔧 SMART CLASSIFICATION: 通过CardDataManager智能添加卡片
      const result = await CardDataManager.addCardsWithSmartClassification(newCards, 'experience', 1);

      if (result.success) {
        // 🔧 CRITICAL FIX: 使用setTimeout确保状态更新在下一个事件循环中执行
        // 这解决了React状态更新时机的问题
        setTimeout(() => {
          const directionsData = CardDataManager.getDirectionsData();

          // 🔧 NEW: 如果有受影响的方向，自动展开它们
          let updatedDirections;
          if (result.affectedDirections && result.affectedDirections.length > 0) {
            updatedDirections = directionsData.map(dir => ({
              ...dir,
              isExpanded: result.affectedDirections!.includes(dir.id) || dir.isExpanded
            }));

            console.log('🔄 [EXPERIENCE_UPLOAD] Auto-expanding affected directions:', {
              affectedDirections: result.affectedDirections,
              expandedDirections: updatedDirections.filter(d => d.isExpanded).map(d => d.id)
            });
          } else {
            updatedDirections = directionsData;
          }

          console.log('🔄 [EXPERIENCE_UPLOAD] About to update directions state:', {
            currentDirectionsCount: directions.length,
            currentTotalCards: directions.reduce((sum, dir) => sum + dir.cards.length, 0),
            newDirectionsCount: updatedDirections.length,
            newTotalCards: updatedDirections.reduce((sum, dir) => sum + dir.cards.length, 0),
            affectedDirections: result.affectedDirections,
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
            totalCards: updatedDirections.reduce((sum, dir) => sum + dir.cards.length, 0),
            affectedDirections: result.affectedDirections
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

// 主导出组件，用Suspense包装
export default function ExperiencePage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    }>
      <ExperiencePageContent />
    </Suspense>
  );
}
