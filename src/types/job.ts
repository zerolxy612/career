// Job Recommendation Types
import { CardDetail } from './card';
import { CareerRadarData, CareerQuadrantData, CompetenceStructure } from './career-profile';

// Career Profile Data interface
export interface CareerProfileData {
  userGoal: string;
  selectedIndustry: string;
  analysisResults?: {
    radarData?: CareerRadarData;
    quadrantData?: CareerQuadrantData;
    competenceStructure?: CompetenceStructure;
  };
  metadata?: {
    analysisTimestamp?: number;
    confidenceScore?: number;
  };
}
export interface JobRecommendation {
  id: string;
  jobTitle: string;
  matchingScore: number;
  category: 'target' | 'adjacent';
  companyType: string;
  jobDescription: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  matchingReasons: string[];
  developmentSuggestions: string[];
  salaryRange: string;
  careerGrowthPath: string;
  // Legacy fields for backward compatibility
  jobName?: string;
  recommendationReason?: string;
  basedOnCards?: string[];
  jobRequirements?: string[];
  coverLetter?: CoverLetter;
}

export interface CoverLetter {
  id: string;
  jobId: string;
  personalizedContent: CoverLetterSentence[];
  generatedAt: Date;
}

export interface CoverLetterSentence {
  sentence: string;
  source: string[];
  type: 'introduction' | 'experience' | 'skills' | 'conclusion';
}

// Job Search and Filtering
export interface JobSearchFilters {
  category?: 'target' | 'adjacent' | 'all';
  minMatchingScore?: number;
  requiredSkills?: string[];
  industry?: string[];
}

export interface JobSearchResult {
  jobs: JobRecommendation[];
  totalCount: number;
  filters: JobSearchFilters;
}

// Job Recommendation Summary
export interface RecommendationSummary {
  totalJobs: number;
  averageMatchingScore: number;
  topStrengths: string[];
  keyDevelopmentAreas: string[];
  overallAssessment: string;
}

// Job Recommendation API Types
export interface JobRecommendationRequest {
  userGoal: string;
  selectedIndustry: string;
  careerProfileData: CareerProfileData;
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
}

export interface JobRecommendationResponse {
  success: boolean;
  data?: {
    directions: JobDirection[];
  };
  error?: string;
  processingTime?: number;
}

// New Job Direction Types for simplified UI
export interface JobDirection {
  target_position: string;
  match_level: number;
  direction_summary: string;
  recommendation_reason: string;
  explore_instruction: string;
  based_on_experience_cards: string[];
  job_requirements: string[];
  direction_tags: string[];
}

// Similar Jobs Types
export interface SimilarJobsRequest {
  selectedJob: JobDirection;
  userGoal: string;
  selectedCards: {
    id: string;
    experienceName: string;
    category: string;
    cardDetail: CardDetail;
  }[];
}

export interface SimilarJobsResponse {
  success: boolean;
  data?: {
    directions: SimilarJobDirection[];
    similar_reason_popup: SimilarReasonPopup;
    // 保持向后兼容性
    similar_jobs?: SimilarJob[];
    recommendation_context?: RecommendationContext;
  };
  error?: string;
  processingTime?: number;
}

// 新的相似岗位方向结构，与JobDirection保持一致
export interface SimilarJobDirection {
  target_position: string;
  match_level: number | string; // 支持数字或星级格式
  direction_summary: string;
  recommendation_reason: string;
  explore_instruction: string;
  based_on_experience_cards: string[];
  job_requirements: string[];
  direction_tags: string[];
}

// 新的相似推荐弹窗结构
export interface SimilarReasonPopup {
  reason_intro: string;
  core_similarities: string[]; // 格式如 "📊 Data Insight"
}

// 保留旧的接口以保持向后兼容性
export interface SimilarJob {
  job_title: string;
  match_level: number;
  similarity_reason: string;
}

export interface RecommendationContext {
  target_role: string;
  shared_competencies: SharedCompetency[];
  overall_explanation: string;
}

export interface SharedCompetency {
  competency: string;
  icon: string;
  description: string;
}
