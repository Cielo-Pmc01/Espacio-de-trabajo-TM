/**
 * Tipos TypeScript globales para la app de capacitación
 */

// Usuario / Vendedor
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string; // en producción usar bcrypt
  createdAt: string;
  lastLogin?: string;
}

// Módulo de capacitación
export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  status: 'locked' | 'available' | 'completed';
  content?: ModuleContent;
}

// Contenido de un módulo
export interface ModuleContent {
  videos: Video[];
  documents: Document[];
  quiz?: Quiz;
  dragDrop?: DragDropExercise;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  duration: number; // segundos
  thumbnail?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'markdown' | 'html' | 'pdf';
}

// Quiz / Evaluación
export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  passingScore: number; // porcentaje mínimo para aprobar
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'drag_drop';
  options?: Option[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface Option {
  id: string;
  text: string;
}

// Ejercicio Drag & Drop (Módulo 2)
export interface DragDropExercise {
  id: string;
  title: string;
  description: string;
  items: DragItem[];
  zones: DropZone[];
  correctMapping: Record<string, string>; // itemId -> zoneId
}

export interface DragItem {
  id: string;
  text: string;
  content?: string;
}

export interface DropZone {
  id: string;
  title: string;
  description?: string;
}

// Resultado de evaluación
export interface Evaluation {
  id: string;
  userId: string;
  moduleId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: Record<string, string | string[]>; // questionId -> answer
  completedAt: string;
  passed: boolean;
}

// Progreso del usuario
export interface Progress {
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  score?: number;
}

// Sesión de autenticación
export interface Session {
  userId: string;
  username: string;
  role: 'vendor' | 'admin';
  expiresAt: number;
}

// Chat con Avatar
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioUrl?: string; // URL del audio generado por ElevenLabs
}

export interface AvatarState {
  isSpeaking: boolean;
  currentExpression: 'neutral' | 'happy' | 'thinking' | 'speaking';
  messages: ChatMessage[];
}
