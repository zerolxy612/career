// Career Profile Analysis Types - 职业画像分析数据类型

// 雷达图数据结构 - 8个维度
export interface CareerRadarData {
  interestOrientation: number;      // 兴趣导向
  selfEfficacy: number;            // 自我效能
  goalOrientation: number;         // 目标导向
  outcomeExpectation: number;      // 结果期望
  cognitiveAgility: number;        // 认知敏捷性
  affectiveReadiness: number;      // 情感准备度
  interpersonalReadiness: number;  // 人际准备度
  professionalAwareness: number;   // 专业意识
}

// 象限图数据结构 - 4个维度
export interface CareerQuadrantData {
  externalDriven: number;          // 外驱 (上)
  internalDriven: number;          // 内驱 (下)
  structuredAnalytical: number;    // 结构型/分析型 (左)
  expressiveInterpersonal: number; // 表达型/人际型 (右)
}

// 象限图能力点数据
export interface AbilityPoint {
  id: string;
  name: string;
  x: number;                       // 横坐标 (-100 到 100)
  y: number;                       // 纵坐标 (-100 到 100)
  description: string;             // hover时显示的解释
  evidence?: string;               // 支撑证据
}

// 客观能力数据结构
export interface ObjectiveAbility {
  name: string;
  evidence: string;                // 来源证据描述
  confidenceLevel?: 'high' | 'medium' | 'low';
}

// 主观能力数据结构
export interface SubjectiveAbility {
  label: string;
  userInput: string;               // 用户自述内容
  insight?: string;                // AI洞察补充
}

// 发展潜力技能数据结构
export interface DevelopmentSkill {
  name: string;
  currentStatus: string;           // 当前水平描述
  suggestion: string;              // 发展建议
  priority?: 'high' | 'medium' | 'low';
}

// 能力结构完整数据
export interface CompetenceStructure {
  objectiveAbilities: {
    displayType: 'table';
    abilities: ObjectiveAbility[];
  };
  subjectiveAbilities: {
    displayType: 'text_blocks';
    selfStatements: SubjectiveAbility[];
  };
  developmentPotential: {
    skills: DevelopmentSkill[];
  };
  structureSummary: {
    evaluationText: string;        // 第二人称评价总结
  };
}

// 完整的职业画像分析结果
export interface CareerProfileAnalysis {
  // 左侧可视化数据
  radarData: CareerRadarData;
  quadrantData: CareerQuadrantData;
  abilityPoints: AbilityPoint[];
  selfCognitionSummary: string;    // 自我认知和能力结构总结

  // 右侧能力结构数据
  competenceStructure: CompetenceStructure;

  // 元数据
  analysisMetadata: {
    basedOnCards: string[];        // 基于的卡片ID列表
    userGoal: string;
    selectedIndustry: string;
    analysisTimestamp: number;
    confidenceScore: number;       // 分析置信度 0-100
  };
}

// API请求数据结构
export interface CareerProfileAnalysisRequest {
  userGoal: string;
  selectedIndustry: string;
  selectedCards: {
    id: string;
    experienceName: string;
    category: string;
    cardDetail: {
      experienceName: string;
      timeAndLocation: string;
      backgroundContext: string;
      myRoleAndTasks: string;
      taskDetails: string;
      reflectionAndResults: string;
      highlightSentence: string;
    };
  }[];
  combinationContext?: {
    combinationName: string;
    combinationDescription: string;
    whyThisCombination: string;
  };
}

// API响应数据结构
export interface CareerProfileAnalysisResponse {
  success: boolean;
  data?: CareerProfileAnalysis;
  error?: string;
  processingTime?: number;
}

// 雷达图维度标签映射
export const RADAR_DIMENSION_LABELS = {
  interestOrientation: 'Interest Orientation',
  selfEfficacy: 'Self-Efficacy', 
  goalOrientation: 'Goal Orientation',
  outcomeExpectation: 'Outcome Expectation',
  cognitiveAgility: 'Cognitive Agility',
  affectiveReadiness: 'Affective Readiness',
  interpersonalReadiness: 'Interpersonal Readiness',
  professionalAwareness: 'Professional Awareness'
} as const;

// 象限图维度标签映射
export const QUADRANT_DIMENSION_LABELS = {
  externalDriven: 'External-Driven',
  internalDriven: 'Internal-Driven',
  structuredAnalytical: 'Structured/Analytical',
  expressiveInterpersonal: 'Expressive/Interpersonal'
} as const;
