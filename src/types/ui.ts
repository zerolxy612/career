// UI Component Types
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  shadow?: boolean;
}

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: 'default' | 'success' | 'warning' | 'error';
}

// Chat Box Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'file' | 'image';
  url: string;
  size?: number;
}

export interface ChatBoxProps {
  isCollapsed: boolean;
  onToggle: () => void;
  context: 'goal' | 'experience' | 'combination' | 'result';
  messages: ChatMessage[];
  onSendMessage: (message: string, attachments?: File[]) => void;
  isLoading?: boolean;
}

// Navigation Types
export interface NavigationStep {
  id: string;
  name: string;
  href: string;
  status: 'upcoming' | 'current' | 'complete';
  description?: string;
}

export interface ProgressBarProps {
  steps: NavigationStep[];
  currentStep: string;
}

// Drag and Drop Types
export interface DragDropContextProps {
  onDragEnd: (result: unknown) => void;
  children: React.ReactNode;
}

export interface DroppableProps {
  droppableId: string;
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
}

export interface DraggableProps {
  draggableId: string;
  index: number;
  children: React.ReactNode;
  isDragDisabled?: boolean;
}

// Modal and Dialog Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}
