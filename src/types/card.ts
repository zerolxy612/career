// Experience Card Types
export interface ExperienceCard {
  id: string;
  category: CardCategory;
  cardPreview: CardPreview;
  cardDetail: CardDetail;
  completionLevel: CompletionLevel;
  source: CardSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardPreview {
  experienceName: string;
  timeAndLocation: string;
  oneSentenceSummary: string;
}

export interface CardDetail {
  experienceName: string;
  timeAndLocation: string;
  backgroundContext: string;
  myRoleAndTasks: string;
  taskDetails: string;
  reflectionAndResults: string;
  highlightSentence: string;
  editableFields: string[];
}

export type CardCategory = 'Focus Match' | 'Growth Potential' | 'Foundation Skills';

export type CompletionLevel = 'incomplete' | 'partial' | 'complete';

export interface CardSource {
  type: 'uploaded_resume' | 'user_input' | 'ai_generated';
  fileName?: string;
  extractedFrom?: string;
}

// Card Combination Types
export interface CardCombination {
  id: string;
  name: string;
  description: string;
  cards: string[]; // Card IDs
  matchingLogic: string;
  whyThisCombination: string;
  targetRole?: string;
  identifiedAbilities: string[];
  combinationExplanation: string;
  supplementSuggestions: string[];
  risksAndAdvice: RisksAndAdvice;
}

export interface RisksAndAdvice {
  potentialChallenges: string[];
  actionSuggestions: string[];
}

// Card Direction Types for Experience Page
export interface CardDirection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  isExpanded: boolean;
  cards: ExperienceCard[];
  extractedCount: number;
  aiRecommendedCount: number;
  userCreatedCount: number;
  alignmentLevel?: 'high' | 'medium' | 'low';
}

// Industry Recommendation Types - imported from api.ts to avoid duplication
export type { IndustryRecommendation, IndustryCardPreview, IndustryCardDetail } from './api';
