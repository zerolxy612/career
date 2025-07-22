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

// Industry Recommendation Types
export interface IndustryRecommendation {
  id: string;
  cardPreview: IndustryCardPreview;
  cardDetail: IndustryCardDetail;
}

export interface IndustryCardPreview {
  fieldName: string;
  fieldSummary: string;
  fieldTags: string[];
}

export interface IndustryCardDetail {
  fieldName: string;
  fieldOverview: string;
  suitableForYouIf: string[];
  typicalTasksAndChallenges: string[];
  fieldTags: string[];
}
