import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CareerProfile, JobRecommendation } from '@/types';

interface ProfileState {
  // Profile data
  careerProfile: CareerProfile | null;
  jobRecommendations: JobRecommendation[];
  
  // Loading states
  isGeneratingProfile: boolean;
  isGeneratingJobs: boolean;
  isExportingPDF: boolean;
  
  // Error handling
  error: string | null;
}

interface ProfileActions {
  // Profile management
  setCareerProfile: (profile: CareerProfile) => void;
  updateCareerProfile: (updates: Partial<CareerProfile>) => void;
  clearCareerProfile: () => void;
  
  // Job recommendations
  setJobRecommendations: (jobs: JobRecommendation[]) => void;
  addJobRecommendation: (job: JobRecommendation) => void;
  updateJobRecommendation: (id: string, updates: Partial<JobRecommendation>) => void;
  
  // Loading states
  setGeneratingProfile: (isGenerating: boolean) => void;
  setGeneratingJobs: (isGenerating: boolean) => void;
  setExportingPDF: (isExporting: boolean) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  resetProfileState: () => void;
}

const initialState: ProfileState = {
  careerProfile: null,
  jobRecommendations: [],
  isGeneratingProfile: false,
  isGeneratingJobs: false,
  isExportingPDF: false,
  error: null,
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  immer((set) => ({
    ...initialState,
    
    // Profile management
    setCareerProfile: (profile) =>
      set((state) => {
        state.careerProfile = profile;
      }),
    
    updateCareerProfile: (updates) =>
      set((state) => {
        if (state.careerProfile) {
          Object.assign(state.careerProfile, updates);
          state.careerProfile.updatedAt = new Date();
        }
      }),
    
    clearCareerProfile: () =>
      set((state) => {
        state.careerProfile = null;
      }),
    
    // Job recommendations
    setJobRecommendations: (jobs) =>
      set((state) => {
        state.jobRecommendations = jobs;
      }),
    
    addJobRecommendation: (job) =>
      set((state) => {
        state.jobRecommendations.push(job);
      }),
    
    updateJobRecommendation: (id, updates) =>
      set((state) => {
        const jobIndex = state.jobRecommendations.findIndex(job => job.id === id);
        if (jobIndex !== -1) {
          Object.assign(state.jobRecommendations[jobIndex], updates);
        }
      }),
    
    // Loading states
    setGeneratingProfile: (isGenerating) =>
      set((state) => {
        state.isGeneratingProfile = isGenerating;
      }),
    
    setGeneratingJobs: (isGenerating) =>
      set((state) => {
        state.isGeneratingJobs = isGenerating;
      }),
    
    setExportingPDF: (isExporting) =>
      set((state) => {
        state.isExportingPDF = isExporting;
      }),
    
    // Error handling
    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
    
    clearError: () =>
      set((state) => {
        state.error = null;
      }),
    
    // Reset
    resetProfileState: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  }))
);
