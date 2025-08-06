/**
 * 🎯 CardDataManager - 统一的卡片数据管理器
 *
 * 职责：
 * 1. 统一管理所有卡片数据的生命周期
 * 2. 防止数据重复和竞态条件
 * 3. 提供清晰的数据流控制
 * 4. 确保数据一致性和完整性
 * 5. 支持三种工作流：首页上传、Experience页面上传、手动创建
 */

import { ExperienceCard, CardDirection } from '@/types/card';

// 动态方向数据结构
interface DynamicDirection {
  方向ID: string;
  方向标题: string;
  方向副标题: string;
  方向描述: string;
  默认展开: boolean;
  对齐程度: 'high' | 'medium' | 'low';
}

// 会话数据结构
interface SessionData {
  sessionId: string;
  timestamp: number;
  userGoal: string;
  selectedIndustry: string;
  cards: ExperienceCard[];
  dynamicDirections?: DynamicDirection[]; // 新增：存储动态生成的方向
  metadata: {
    lastSource: DataSource;
    totalFileCount: number;
    processedAt: number;
    workflowHistory: Array<{
      source: DataSource;
      timestamp: number;
      cardCount: number;
    }>;
  };
}

// 数据源类型
type DataSource = 'homepage' | 'experience' | 'manual';

// 卡片去重键生成函数 (暂时保留，可能在未来使用)
// function generateCardKey(card: ExperienceCard): string {
//   return `${card.cardPreview.experienceName.trim().toLowerCase()}-${card.cardPreview.timeAndLocation.trim().toLowerCase()}`;
// }

export class CardDataManager {
  private static readonly SESSION_KEY = 'careerProfilingSession';
  private static readonly LEGACY_KEYS = [
    'experienceDirections',
    'hasInteracted', 
    'selectedCards',
    'selectedCombination',
    'homepageGeneratedCards',
    'hasHomepageFiles',
    'uploadedFilesMetadata',
    'currentSessionId'
  ];

  /**
   * 开始新的会话 - 清理所有旧数据
   */
  static startNewSession(userGoal: string, selectedIndustry: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('🆕 [CardDataManager] Starting new session:', sessionId);

    // 强制清理所有遗留数据
    this.clearAllLegacyData();

    // 创建新会话数据
    const sessionData: SessionData = {
      sessionId,
      timestamp: Date.now(),
      userGoal,
      selectedIndustry,
      cards: [],
      dynamicDirections: undefined, // 初始为空，后续通过API生成
      metadata: {
        lastSource: 'homepage',
        totalFileCount: 0,
        processedAt: Date.now(),
        workflowHistory: []
      }
    };

    // 存储新会话
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));

    console.log('✅ [CardDataManager] New session created successfully');
    return sessionId;
  }

  /**
   * 添加卡片到当前会话（带去重和工作流跟踪）
   */
  static addCards(cards: ExperienceCard[], source: DataSource, fileCount?: number): boolean {
    const session = this.getCurrentSession();
    if (!session) {
      console.error('❌ [CardDataManager] No active session found');
      return false;
    }

    console.log('➕ [CardDataManager] Adding cards:', {
      source,
      newCardsCount: cards.length,
      fileCount,
      currentCardsCount: session.cards.length
    });

    // 去重处理
    const deduplicatedCards = this.deduplicateCards([...session.cards, ...cards]);
    const addedCount = deduplicatedCards.length - session.cards.length;

    // 更新会话数据
    session.cards = deduplicatedCards;
    session.timestamp = Date.now();
    session.metadata.lastSource = source;
    session.metadata.totalFileCount += fileCount || 0;
    session.metadata.processedAt = Date.now();

    // 记录工作流历史
    session.metadata.workflowHistory.push({
      source,
      timestamp: Date.now(),
      cardCount: addedCount
    });

    // 保存到localStorage
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

    console.log('✅ [CardDataManager] Cards added successfully:', {
      addedCount,
      totalCount: session.cards.length,
      duplicatesRemoved: cards.length - addedCount,
      source,
      workflowStep: session.metadata.workflowHistory.length
    });

    return true;
  }

  /**
   * 智能添加卡片（使用AI分类到合适的方向）
   * 返回分类结果信息，包括哪些方向有新卡片
   */
  static async addCardsWithSmartClassification(cards: ExperienceCard[], source: DataSource, fileCount?: number): Promise<{ success: boolean; affectedDirections?: string[] }> {
    const session = this.getCurrentSession();
    if (!session) {
      console.error('❌ [CardDataManager] No active session found');
      return { success: false };
    }

    console.log('🧠 [CardDataManager] Adding cards with smart classification:', {
      source,
      newCardsCount: cards.length,
      fileCount,
      currentCardsCount: session.cards.length
    });

    // 检查是否有动态方向
    const dynamicDirections = session.dynamicDirections;
    if (!dynamicDirections || dynamicDirections.length !== 3) {
      console.log('⚠️ [CardDataManager] No dynamic directions found, using regular addCards');
      const success = this.addCards(cards, source, fileCount);
      return { success };
    }

    try {
      // 调用AI分类API
      console.log('📤 [CardDataManager] Requesting smart classification from API...');
      const response = await fetch('/api/ai/classify-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGoal: session.userGoal,
          selectedIndustry: session.selectedIndustry,
          dynamicDirections: dynamicDirections,
          experienceCards: cards
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const classificationResult = await response.json();
      console.log('📥 [CardDataManager] Classification result received:', classificationResult);

      if (classificationResult.卡片分类结果 && Array.isArray(classificationResult.卡片分类结果)) {
        // 应用AI分类结果
        const classifiedCards = this.applyClassificationResults(cards, classificationResult.卡片分类结果);

        // 分析哪些方向受到影响（有新卡片）
        const affectedDirections = this.getAffectedDirections(classificationResult.卡片分类结果);

        // 去重处理
        const deduplicatedCards = this.deduplicateCards([...session.cards, ...classifiedCards]);
        const addedCount = deduplicatedCards.length - session.cards.length;

        // 更新会话数据
        session.cards = deduplicatedCards;
        session.timestamp = Date.now();
        session.metadata.lastSource = source;
        session.metadata.totalFileCount += fileCount || 0;
        session.metadata.processedAt = Date.now();

        // 记录工作流历史
        session.metadata.workflowHistory.push({
          source,
          timestamp: Date.now(),
          cardCount: addedCount
        });

        // 保存到localStorage
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        console.log('✅ [CardDataManager] Cards added with smart classification:', {
          addedCount,
          totalCount: session.cards.length,
          duplicatesRemoved: cards.length - addedCount,
          source,
          affectedDirections,
          classificationSummary: classificationResult.卡片分类结果.reduce((acc: Record<string, number>, item: { 分配方向: string }) => {
            acc[item.分配方向] = (acc[item.分配方向] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        });

        return { success: true, affectedDirections };
      } else {
        console.error('❌ [CardDataManager] Invalid classification result format');
        throw new Error('Invalid classification result');
      }

    } catch (error) {
      console.error('❌ [CardDataManager] Smart classification failed:', error);
      console.log('🔄 [CardDataManager] Falling back to regular addCards');
      const success = this.addCards(cards, source, fileCount);
      return { success };
    }
  }

  /**
   * 获取当前会话的所有卡片
   */
  static getAllCards(): ExperienceCard[] {
    const session = this.getCurrentSession();
    return session?.cards || [];
  }

  /**
   * 存储动态生成的方向分类
   */
  static setDynamicDirections(directions: DynamicDirection[]): boolean {
    const session = this.getCurrentSession();
    if (!session) {
      console.error('❌ [CardDataManager] No active session found');
      return false;
    }

    session.dynamicDirections = directions;
    session.timestamp = Date.now();
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

    console.log('✅ [CardDataManager] Dynamic directions stored:', {
      directionsCount: directions.length,
      directionTitles: directions.map(d => d.方向标题)
    });

    return true;
  }

  /**
   * 获取动态方向分类
   */
  static getDynamicDirections(): DynamicDirection[] | null {
    const session = this.getCurrentSession();
    return session?.dynamicDirections || null;
  }

  /**
   * 获取格式化的方向数据（用于Experience页面显示）
   */
  static getDirectionsData(): CardDirection[] {
    const cards = this.getAllCards();
    const session = this.getCurrentSession();

    // 尝试使用动态生成的方向，如果没有则使用默认方向
    const dynamicDirections = session?.dynamicDirections;

    if (dynamicDirections && dynamicDirections.length === 3) {
      console.log('📊 [CardDataManager] Using dynamic directions:', {
        directionTitles: dynamicDirections.map(d => d.方向标题)
      });

      // 按动态方向分组卡片（这里需要智能匹配卡片到方向）
      const cardsByDirection = this.groupCardsByDynamicDirections(cards);

      // 构建动态方向数据结构
      const directions: CardDirection[] = dynamicDirections.map((dynDir, index) => ({
        id: dynDir.方向ID,
        title: dynDir.方向标题,
        subtitle: dynDir.方向副标题,
        description: dynDir.方向描述,
        isExpanded: dynDir.默认展开,
        cards: cardsByDirection[index] || [],
        extractedCount: this.countCardsBySource(cardsByDirection[index] || [], 'uploaded_resume'),
        aiRecommendedCount: this.countCardsBySource(cardsByDirection[index] || [], 'ai_generated'),
        userCreatedCount: this.countCardsBySource(cardsByDirection[index] || [], 'user_input'),
        alignmentLevel: dynDir.对齐程度
      }));

      console.log('📊 [CardDataManager] Generated dynamic directions data:', {
        totalCards: cards.length,
        directionCounts: directions.map(d => ({
          title: d.title,
          count: d.cards.length,
          isExpanded: d.isExpanded
        }))
      });

      return directions;
    }

    // 降级到默认方向
    console.log('📊 [CardDataManager] Using default directions (fallback)');

    // 按类别分组卡片
    const cardsByCategory = this.groupCardsByCategory(cards);

    // 构建默认方向数据结构
    const directions: CardDirection[] = [
      {
        id: 'direction-1',
        title: 'Focus Match',
        subtitle: 'Experiences highly aligned with your career goal',
        description: 'Add experiences that directly support your target industry and role',
        isExpanded: true, // 默认展开第一个方向
        cards: cardsByCategory['Focus Match'] || [],
        extractedCount: this.countCardsBySource(cardsByCategory['Focus Match'] || [], 'uploaded_resume'),
        aiRecommendedCount: this.countCardsBySource(cardsByCategory['Focus Match'] || [], 'ai_generated'),
        userCreatedCount: this.countCardsBySource(cardsByCategory['Focus Match'] || [], 'user_input')
      },
      {
        id: 'direction-2',
        title: 'Growth Potential',
        subtitle: 'Experiences that show your development potential',
        description: 'Add experiences that demonstrate your ability to learn and grow',
        isExpanded: false,
        cards: cardsByCategory['Growth Potential'] || [],
        extractedCount: this.countCardsBySource(cardsByCategory['Growth Potential'] || [], 'uploaded_resume'),
        aiRecommendedCount: this.countCardsBySource(cardsByCategory['Growth Potential'] || [], 'ai_generated'),
        userCreatedCount: this.countCardsBySource(cardsByCategory['Growth Potential'] || [], 'user_input')
      },
      {
        id: 'direction-3',
        title: 'Foundation Skills',
        subtitle: 'Core skills and foundational experiences',
        description: 'Add experiences that build the foundation for your career development',
        isExpanded: false,
        cards: cardsByCategory['Foundation Skills'] || [],
        extractedCount: this.countCardsBySource(cardsByCategory['Foundation Skills'] || [], 'uploaded_resume'),
        aiRecommendedCount: this.countCardsBySource(cardsByCategory['Foundation Skills'] || [], 'ai_generated'),
        userCreatedCount: this.countCardsBySource(cardsByCategory['Foundation Skills'] || [], 'user_input')
      }
    ];

    console.log('📊 [CardDataManager] Generated directions data:', {
      totalCards: cards.length,
      directionCounts: directions.map(d => ({
        title: d.title,
        count: d.cards.length,
        isExpanded: d.isExpanded,
        cardDetails: d.cards.map(c => ({
          name: c.cardPreview.experienceName,
          category: c.category,
          sourceType: c.source.type
        }))
      }))
    });

    return directions;
  }

  /**
   * 验证会话数据完整性
   */
  static validateSession(): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    const isValid = !!(
      session.sessionId &&
      session.userGoal &&
      session.selectedIndustry &&
      Array.isArray(session.cards)
    );

    console.log('🔍 [CardDataManager] Session validation:', { isValid, sessionId: session.sessionId });
    return isValid;
  }

  /**
   * 清理当前会话
   */
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.clearAllLegacyData();
    console.log('🧹 [CardDataManager] Session cleared');
  }

  /**
   * 获取会话统计信息
   */
  static getSessionStats() {
    const session = this.getCurrentSession();
    if (!session) return null;

    const stats = {
      sessionId: session.sessionId,
      totalCards: session.cards.length,
      cardsBySource: {
        uploaded_resume: this.countCardsBySource(session.cards, 'uploaded_resume'),
        ai_generated: this.countCardsBySource(session.cards, 'ai_generated'),
        user_input: this.countCardsBySource(session.cards, 'user_input')
      },
      cardsByCategory: this.groupCardsByCategory(session.cards),
      lastUpdated: new Date(session.timestamp).toISOString()
    };

    return stats;
  }

  // ===== 私有辅助方法 =====

  private static getCurrentSession(): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return null;
      
      return JSON.parse(sessionStr) as SessionData;
    } catch (error) {
      console.error('❌ [CardDataManager] Failed to parse session data:', error);
      return null;
    }
  }

  private static clearAllLegacyData(): void {
    let clearedCount = 0;
    this.LEGACY_KEYS.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    });
    
    if (clearedCount > 0) {
      console.log(`🗑️ [CardDataManager] Cleared ${clearedCount} legacy data keys`);
    }
  }

  private static deduplicateCards(cards: ExperienceCard[]): ExperienceCard[] {
    const seen = new Map<string, ExperienceCard>();
    
    cards.forEach(card => {
      // 使用卡片名称和时间地点作为唯一标识
      const key = `${card.cardPreview.experienceName}-${card.cardPreview.timeAndLocation}`.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, card);
      }
    });
    
    const deduplicatedCards = Array.from(seen.values());
    const duplicatesRemoved = cards.length - deduplicatedCards.length;
    
    if (duplicatesRemoved > 0) {
      console.log(`🔄 [CardDataManager] Removed ${duplicatesRemoved} duplicate cards`);
    }
    
    return deduplicatedCards;
  }

  private static groupCardsByCategory(cards: ExperienceCard[]): Record<string, ExperienceCard[]> {
    const groups: Record<string, ExperienceCard[]> = {
      'Focus Match': [],
      'Growth Potential': [],
      'Foundation Skills': []
    };

    cards.forEach(card => {
      const category = card.category;
      if (groups[category]) {
        groups[category].push(card);
      }
    });

    return groups;
  }

  private static countCardsBySource(cards: ExperienceCard[], sourceType: string): number {
    return cards.filter(card => card.source.type === sourceType).length;
  }

  /**
   * 根据动态方向智能分组卡片
   * 使用简单的关键词匹配和对齐程度来分配卡片
   */
  private static groupCardsByDynamicDirections(cards: ExperienceCard[]): ExperienceCard[][] {
    const result: ExperienceCard[][] = [[], [], []];

    // 如果没有卡片，返回空数组
    if (cards.length === 0) {
      return result;
    }

    // 简单的分配策略：
    // 1. 优先按照原有的category分配
    // 2. 如果没有category信息，按照对齐程度分配
    // 3. 平均分配以确保每个方向都有卡片

    cards.forEach((card, index) => {
      let targetDirectionIndex = 0;

      // 根据原有category映射到新方向
      switch (card.category) {
        case 'Focus Match':
          targetDirectionIndex = 0; // 第一个方向（通常是核心匹配）
          break;
        case 'Growth Potential':
          targetDirectionIndex = 1; // 第二个方向（通常是发展潜力）
          break;
        case 'Foundation Skills':
          targetDirectionIndex = 2; // 第三个方向（通常是基础技能）
          break;
        default:
          // 如果没有明确的category，按索引轮流分配
          targetDirectionIndex = index % 3;
      }

      result[targetDirectionIndex].push(card);
    });

    console.log('🔄 [CardDataManager] Cards grouped by dynamic directions:', {
      direction1Count: result[0].length,
      direction2Count: result[1].length,
      direction3Count: result[2].length,
      totalCards: cards.length
    });

    return result;
  }

  /**
   * 应用AI分类结果到卡片
   */
  private static applyClassificationResults(cards: ExperienceCard[], classificationResults: Array<{ 卡片名称: string; 分配方向: string }>): ExperienceCard[] {
    console.log('🎯 [CardDataManager] Applying classification results:', {
      cardsCount: cards.length,
      classificationsCount: classificationResults.length
    });

    // 创建分类映射
    const classificationMap = new Map<string, string>();
    classificationResults.forEach(result => {
      classificationMap.set(result.卡片名称, result.分配方向);
    });

    // 应用分类结果到卡片
    const classifiedCards = cards.map(card => {
      const cardName = card.cardPreview.experienceName;
      const assignedDirection = classificationMap.get(cardName);

      let newCategory: 'Focus Match' | 'Growth Potential' | 'Foundation Skills' = card.category;

      // 根据分配的方向更新category
      if (assignedDirection) {
        switch (assignedDirection) {
          case 'direction-1':
            newCategory = 'Focus Match';
            break;
          case 'direction-2':
            newCategory = 'Growth Potential';
            break;
          case 'direction-3':
            newCategory = 'Foundation Skills';
            break;
        }

        console.log(`🎯 [CardDataManager] Card "${cardName}" classified to ${assignedDirection} (${newCategory})`);
      } else {
        console.warn(`⚠️ [CardDataManager] No classification found for card "${cardName}", keeping original category`);
      }

      return {
        ...card,
        category: newCategory,
        updatedAt: new Date()
      };
    });

    const classificationSummary = classifiedCards.reduce((acc, card) => {
      acc[card.category] = (acc[card.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('✅ [CardDataManager] Classification applied successfully:', {
      totalCards: classifiedCards.length,
      classificationSummary
    });

    return classifiedCards;
  }

  /**
   * 获取受影响的方向（有新卡片的方向）
   */
  private static getAffectedDirections(classificationResults: Array<{ 分配方向: string }>): string[] {
    const affectedDirections = new Set<string>();

    classificationResults.forEach(result => {
      if (result.分配方向) {
        affectedDirections.add(result.分配方向);
      }
    });

    const directions = Array.from(affectedDirections);
    console.log('🎯 [CardDataManager] Affected directions:', directions);

    return directions;
  }
}
