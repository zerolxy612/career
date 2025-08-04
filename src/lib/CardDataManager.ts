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

// 会话数据结构
interface SessionData {
  sessionId: string;
  timestamp: number;
  userGoal: string;
  selectedIndustry: string;
  cards: ExperienceCard[];
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

// 卡片去重键生成函数
function generateCardKey(card: ExperienceCard): string {
  return `${card.cardPreview.experienceName.trim().toLowerCase()}-${card.cardPreview.timeAndLocation.trim().toLowerCase()}`;
}

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
   * 获取当前会话的所有卡片
   */
  static getAllCards(): ExperienceCard[] {
    const session = this.getCurrentSession();
    return session?.cards || [];
  }

  /**
   * 获取格式化的方向数据（用于Experience页面显示）
   */
  static getDirectionsData(): CardDirection[] {
    const cards = this.getAllCards();
    
    // 按类别分组卡片
    const cardsByCategory = this.groupCardsByCategory(cards);
    
    // 构建方向数据结构
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
}
