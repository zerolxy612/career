import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CardCombination } from '@/types';

interface CombinationState {
  // Available combinations
  availableCombinations: CardCombination[];
  
  // Selected combination
  selectedCombination: CardCombination | null;
  
  // Custom combination
  customCombination: {
    selectedCardIds: string[];
    name: string;
    description: string;
  };
  
  // Loading states
  isGeneratingCombinations: boolean;
  isAnalyzingCombination: boolean;
  
  // Error handling
  error: string | null;
}

interface CombinationActions {
  // Combinations management
  setAvailableCombinations: (combinations: CardCombination[]) => void;
  addCombination: (combination: CardCombination) => void;
  
  // Selection
  selectCombination: (combination: CardCombination) => void;
  clearSelectedCombination: () => void;
  
  // Custom combination
  setCustomCombinationCards: (cardIds: string[]) => void;
  addCardToCustomCombination: (cardId: string) => void;
  removeCardFromCustomCombination: (cardId: string) => void;
  setCustomCombinationName: (name: string) => void;
  setCustomCombinationDescription: (description: string) => void;
  clearCustomCombination: () => void;
  
  // Loading states
  setGeneratingCombinations: (isGenerating: boolean) => void;
  setAnalyzingCombination: (isAnalyzing: boolean) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  resetCombinationState: () => void;
}

const initialState: CombinationState = {
  availableCombinations: [],
  selectedCombination: null,
  customCombination: {
    selectedCardIds: [],
    name: '',
    description: '',
  },
  isGeneratingCombinations: false,
  isAnalyzingCombination: false,
  error: null,
};

export const useCombinationStore = create<CombinationState & CombinationActions>()(
  immer((set) => ({
    ...initialState,
    
    // Combinations management
    setAvailableCombinations: (combinations) =>
      set((state) => {
        state.availableCombinations = combinations;
      }),
    
    addCombination: (combination) =>
      set((state) => {
        state.availableCombinations.push(combination);
      }),
    
    // Selection
    selectCombination: (combination) =>
      set((state) => {
        state.selectedCombination = combination;
      }),
    
    clearSelectedCombination: () =>
      set((state) => {
        state.selectedCombination = null;
      }),
    
    // Custom combination
    setCustomCombinationCards: (cardIds) =>
      set((state) => {
        state.customCombination.selectedCardIds = cardIds;
      }),
    
    addCardToCustomCombination: (cardId) =>
      set((state) => {
        if (!state.customCombination.selectedCardIds.includes(cardId)) {
          state.customCombination.selectedCardIds.push(cardId);
        }
      }),
    
    removeCardFromCustomCombination: (cardId) =>
      set((state) => {
        state.customCombination.selectedCardIds = 
          state.customCombination.selectedCardIds.filter(id => id !== cardId);
      }),
    
    setCustomCombinationName: (name) =>
      set((state) => {
        state.customCombination.name = name;
      }),
    
    setCustomCombinationDescription: (description) =>
      set((state) => {
        state.customCombination.description = description;
      }),
    
    clearCustomCombination: () =>
      set((state) => {
        state.customCombination = {
          selectedCardIds: [],
          name: '',
          description: '',
        };
      }),
    
    // Loading states
    setGeneratingCombinations: (isGenerating) =>
      set((state) => {
        state.isGeneratingCombinations = isGenerating;
      }),
    
    setAnalyzingCombination: (isAnalyzing) =>
      set((state) => {
        state.isAnalyzingCombination = isAnalyzing;
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
    resetCombinationState: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  }))
);
