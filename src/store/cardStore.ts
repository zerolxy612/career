import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ExperienceCard, CardCategory } from '@/types';

interface CardState {
  // Cards data
  cards: ExperienceCard[];
  categories: CardCategory[];
  
  // Current editing
  editingCard: ExperienceCard | null;
  
  // Loading states
  isGeneratingCards: boolean;
  isUpdatingCard: boolean;
  
  // Error handling
  error: string | null;
}

interface CardActions {
  // Card management
  setCards: (cards: ExperienceCard[]) => void;
  addCard: (card: ExperienceCard) => void;
  updateCard: (id: string, updates: Partial<ExperienceCard>) => void;
  deleteCard: (id: string) => void;
  
  // Categories
  setCategories: (categories: CardCategory[]) => void;
  
  // Editing
  setEditingCard: (card: ExperienceCard | null) => void;
  
  // Loading states
  setGeneratingCards: (isGenerating: boolean) => void;
  setUpdatingCard: (isUpdating: boolean) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  resetCardState: () => void;
}

const initialState: CardState = {
  cards: [],
  categories: ['Focus Match', 'Growth Potential', 'Foundation Skills'],
  editingCard: null,
  isGeneratingCards: false,
  isUpdatingCard: false,
  error: null,
};

export const useCardStore = create<CardState & CardActions>()(
  immer((set) => ({
    ...initialState,
    
    // Card management
    setCards: (cards) =>
      set((state) => {
        state.cards = cards;
      }),
    
    addCard: (card) =>
      set((state) => {
        state.cards.push(card);
      }),
    
    updateCard: (id, updates) =>
      set((state) => {
        const cardIndex = state.cards.findIndex(card => card.id === id);
        if (cardIndex !== -1) {
          Object.assign(state.cards[cardIndex], updates);
          state.cards[cardIndex].updatedAt = new Date();
        }
      }),
    
    deleteCard: (id) =>
      set((state) => {
        state.cards = state.cards.filter(card => card.id !== id);
      }),
    
    // Categories
    setCategories: (categories) =>
      set((state) => {
        state.categories = categories;
      }),
    
    // Editing
    setEditingCard: (card) =>
      set((state) => {
        state.editingCard = card;
      }),
    
    // Loading states
    setGeneratingCards: (isGenerating) =>
      set((state) => {
        state.isGeneratingCards = isGenerating;
      }),
    
    setUpdatingCard: (isUpdating) =>
      set((state) => {
        state.isUpdatingCard = isUpdating;
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
    resetCardState: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  }))
);
