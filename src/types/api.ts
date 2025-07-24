// API Request and Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Goal Analysis API
export interface AnalyzeGoalRequest {
  userInput: string;
  uploadedFiles?: File[];
}

export interface AnalyzeGoalResponse {
  recommendedFields: IndustryRecommendation[];
}

// Card Generation API
export interface GenerateCardsRequest {
  files: File[];
  targetIndustry?: string;
  userGoal?: string;
}

export interface GenerateCardsResponse {
  experienceCards: ExperienceCard[];
  categories: CardCategory[];
}

// Combination Recommendation API
export interface RecommendCombinationsRequest {
  cardIds: string[];
  targetRole?: string;
  userPreferences?: string[];
}

export interface RecommendCombinationsResponse {
  combinations: CardCombination[];
  recommendedOption: string;
}

// Profile Generation API
export interface GenerateProfileRequest {
  selectedCombination: CardCombination;
  cards: ExperienceCard[];
  userGoal: string;
}

export interface GenerateProfileResponse {
  careerProfile: CareerProfile;
  jobRecommendations: JobRecommendation[];
}

// File Upload API
export interface FileUploadRequest {
  file: File;
  type: 'resume' | 'document' | 'image';
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  extractedText?: string;
  processingStatus: 'pending' | 'completed' | 'failed';
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Industry Recommendation Types
export interface IndustryCardPreview {
  fieldName: string;
  fieldSummary: string;
  fieldTags: string[];
}

export interface IndustryCardDetail {
  fieldOverview: string;
  suitableForYouIf: string[];
  typicalTasksAndChallenges: string[];
  fieldTags: string[];
}

export interface IndustryRecommendation {
  cardPreview: IndustryCardPreview;
  cardDetail: IndustryCardDetail;
}

export interface IndustryRecommendationResponse {
  recommendedFields: IndustryRecommendation[];
}

// Import types from other files
import type { ExperienceCard, CardCategory, CardCombination } from './card';
import type { CareerProfile } from './profile';
import type { JobRecommendation } from './job';
