// Job Recommendation Types
export interface JobRecommendation {
  id: string;
  jobName: string;
  matchingScore: number;
  recommendationReason: string;
  basedOnCards: string[];
  jobRequirements: string[];
  category: 'target' | 'adjacent';
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
