import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { IndustryRecommendation } from '@/types';

interface GoalState {
  // Goal input
  userGoal: string;
  uploadedFiles: File[];
  
  // Industry recommendations
  recommendations: IndustryRecommendation[];
  selectedIndustry: IndustryRecommendation | null;
  
  // Loading states
  isAnalyzing: boolean;
  isGeneratingRecommendations: boolean;
  
  // Error handling
  error: string | null;
}

interface GoalActions {
  // Goal input actions
  setUserGoal: (goal: string) => void;
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (fileName: string) => void;
  clearUploadedFiles: () => void;
  
  // Industry recommendation actions
  setRecommendations: (recommendations: IndustryRecommendation[]) => void;
  selectIndustry: (industry: IndustryRecommendation) => void;
  clearSelectedIndustry: () => void;
  
  // Loading state actions
  setAnalyzing: (isAnalyzing: boolean) => void;
  setGeneratingRecommendations: (isGenerating: boolean) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset actions
  resetGoalState: () => void;
}

const initialState: GoalState = {
  userGoal: '',
  uploadedFiles: [],
  recommendations: [],
  selectedIndustry: null,
  isAnalyzing: false,
  isGeneratingRecommendations: false,
  error: null,
};

export const useGoalStore = create<GoalState & GoalActions>()(
  immer((set) => ({
    ...initialState,
    
    // Goal input actions
    setUserGoal: (goal) =>
      set((state) => {
        state.userGoal = goal;
      }),
    
    addUploadedFile: (file) =>
      set((state) => {
        // Check if file already exists
        const exists = state.uploadedFiles.some(f => f.name === file.name);
        if (!exists) {
          state.uploadedFiles.push(file);
        }
      }),
    
    removeUploadedFile: (fileName) =>
      set((state) => {
        state.uploadedFiles = state.uploadedFiles.filter(f => f.name !== fileName);
      }),
    
    clearUploadedFiles: () =>
      set((state) => {
        state.uploadedFiles = [];
      }),
    
    // Industry recommendation actions
    setRecommendations: (recommendations) =>
      set((state) => {
        state.recommendations = recommendations;
      }),
    
    selectIndustry: (industry) =>
      set((state) => {
        state.selectedIndustry = industry;
      }),
    
    clearSelectedIndustry: () =>
      set((state) => {
        state.selectedIndustry = null;
      }),
    
    // Loading state actions
    setAnalyzing: (isAnalyzing) =>
      set((state) => {
        state.isAnalyzing = isAnalyzing;
      }),
    
    setGeneratingRecommendations: (isGenerating) =>
      set((state) => {
        state.isGeneratingRecommendations = isGenerating;
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
    
    // Reset actions
    resetGoalState: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  }))
);
