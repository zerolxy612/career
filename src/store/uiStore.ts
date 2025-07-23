import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { NavigationStep, ChatMessage } from '@/types';

interface UIState {
  // Navigation
  currentStep: string;
  navigationSteps: NavigationStep[];
  
  // Chat box
  isChatBoxCollapsed: boolean;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  
  // Modals and dialogs
  activeModal: string | null;
  modalData: unknown;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
  
  // Notifications
  notifications: Notification[];
  
  // Theme and preferences
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

interface UIActions {
  // Navigation actions
  setCurrentStep: (step: string) => void;
  updateNavigationSteps: (steps: NavigationStep[]) => void;
  markStepComplete: (stepId: string) => void;
  
  // Chat box actions
  toggleChatBox: () => void;
  setChatBoxCollapsed: (collapsed: boolean) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  setChatLoading: (loading: boolean) => void;
  
  // Modal actions
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
}

const initialNavigationSteps: NavigationStep[] = [
  {
    id: 'goal',
    name: 'Set Goal',
    href: '/goal',
    status: 'current',
    description: 'Define your career objectives',
  },
  {
    id: 'experience',
    name: 'Experience Cards',
    href: '/experience',
    status: 'upcoming',
    description: 'Create and organize your experience',
  },
  {
    id: 'combination',
    name: 'Combine Cards',
    href: '/combination',
    status: 'upcoming',
    description: 'Select optimal card combinations',
  },
  {
    id: 'result',
    name: 'Career Profile',
    href: '/result',
    status: 'upcoming',
    description: 'View your career profile and recommendations',
  },
];

const initialState: UIState = {
  currentStep: 'goal',
  navigationSteps: initialNavigationSteps,
  isChatBoxCollapsed: true,
  chatMessages: [],
  isChatLoading: false,
  activeModal: null,
  modalData: null,
  globalLoading: false,
  loadingMessage: '',
  notifications: [],
  theme: 'system',
  sidebarCollapsed: false,
};

export const useUIStore = create<UIState & UIActions>()(
  immer((set) => ({
    ...initialState,
    
    // Navigation actions
    setCurrentStep: (step) =>
      set((state) => {
        state.currentStep = step;
        // Update navigation steps status
        state.navigationSteps.forEach((navStep) => {
          if (navStep.id === step) {
            navStep.status = 'current';
          } else if (state.navigationSteps.findIndex(s => s.id === step) > 
                     state.navigationSteps.findIndex(s => s.id === navStep.id)) {
            navStep.status = 'upcoming';
          } else {
            navStep.status = 'complete';
          }
        });
      }),
    
    updateNavigationSteps: (steps) =>
      set((state) => {
        state.navigationSteps = steps;
      }),
    
    markStepComplete: (stepId) =>
      set((state) => {
        const step = state.navigationSteps.find(s => s.id === stepId);
        if (step) {
          step.status = 'complete';
        }
      }),
    
    // Chat box actions
    toggleChatBox: () =>
      set((state) => {
        state.isChatBoxCollapsed = !state.isChatBoxCollapsed;
      }),
    
    setChatBoxCollapsed: (collapsed) =>
      set((state) => {
        state.isChatBoxCollapsed = collapsed;
      }),
    
    addChatMessage: (message) =>
      set((state) => {
        state.chatMessages.push(message);
      }),
    
    clearChatMessages: () =>
      set((state) => {
        state.chatMessages = [];
      }),
    
    setChatLoading: (loading) =>
      set((state) => {
        state.isChatLoading = loading;
      }),
    
    // Modal actions
    openModal: (modalId, data) =>
      set((state) => {
        state.activeModal = modalId;
        state.modalData = data;
      }),
    
    closeModal: () =>
      set((state) => {
        state.activeModal = null;
        state.modalData = null;
      }),
    
    // Loading actions
    setGlobalLoading: (loading, message = '') =>
      set((state) => {
        state.globalLoading = loading;
        state.loadingMessage = message;
      }),
    
    // Notification actions
    addNotification: (notification) =>
      set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
        };
        state.notifications.push(newNotification);
      }),
    
    removeNotification: (id) =>
      set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }),
    
    clearNotifications: () =>
      set((state) => {
        state.notifications = [];
      }),
    
    // Theme actions
    setTheme: (theme) =>
      set((state) => {
        state.theme = theme;
      }),
    
    toggleSidebar: () =>
      set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      }),
  }))
);
