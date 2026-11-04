export type ThemePref = 'sistema' | 'claro' | 'escuro';
export type FontScale = 100 | 115 | 130 | 150;
export type AlertMode = 'off' | 'screen' | 'vibrate';

export interface Settings {
  theme: ThemePref;
  lowStim: boolean;
  fontScale: FontScale;
  readingFont: boolean;
  wideSpacing: boolean;
  alerts: AlertMode;
  showCounts: boolean; // mostrar contagens de tempo na tela
}

export interface Step { id: string; text: string; done: boolean }
export interface Task {
  id: string;
  title: string;
  minutes?: number;
  steps: Step[];
  done: boolean;
  later: boolean;
  createdAt: number;
  example?: boolean;
}

export interface RStep { id: string; text: string; minutes?: number }
export type ColorId = '' | 'sage' | 'sky' | 'sand' | 'rose' | 'lilac' | 'slate';
export interface Routine {
  id: string;
  name: string;
  icon: string;
  color: ColorId;
  steps: RStep[];
  alertBefore: number; // minutos antes da transição; 0 = sem alerta
  remindAt?: string; // lembrete diário fora do app, "HH:MM"
  example?: boolean;
}

export type Mood = 'energia' | 'limite' | 'pausa';
export type Level3 = 'baixa' | 'media' | 'alta';
export type Overload = 'nenhuma' | 'leve' | 'moderada' | 'alta';
export type Need = 'foco' | 'descanso' | 'organizacao' | 'regulacao' | 'registrar';
export interface CheckIn {
  id: string;
  at: number;
  mood?: Mood;
  energy?: Level3;
  overload?: Overload;
  need?: Need;
  example?: boolean;
}

export type Env = 'casa' | 'trabalho' | 'estudo' | 'transporte' | 'social' | 'outro';
export interface SensoryEntry {
  id: string;
  at: number;
  env: Env;
  stimuli: string[];
  level: Overload;
  helped: string[];
  note?: string;
  example?: boolean;
}

export interface Contact { id: string; name: string; how: string; phone?: string }
export interface Plan {
  signals: string[];
  helps: string[];
  contacts: Contact[];
  phrases: string[];
  reduce: string[];
  minimum: string[];
}

export interface State {
  v: 1;
  onboarded: boolean;
  recovery: boolean;
  settings: Settings;
  checkins: CheckIn[];
  tasks: Task[];
  routines: Routine[];
  sensory: SensoryEntry[];
  plan: Plan;
  templateEdits: Record<string, string>;
}
