import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { State } from './types';

const KEY = 'ritmo:v1';

export const initialState = (): State => ({
  v: 1,
  onboarded: false,
  recovery: false,
  settings: {
    theme: 'sistema',
    lowStim: false,
    fontScale: 100,
    readingFont: false,
    wideSpacing: false,
    alerts: 'screen',
    showCounts: true,
    contrast: 'padrao',
    listen: false,
    ai: { enabled: false, useProfile: false },
  },
  checkins: [],
  tasks: [],
  routines: [],
  sensory: [],
  plan: { signals: [], helps: [], contacts: [], phrases: [], reduce: [], minimum: [] },
  templateEdits: {},
  profile: { traits: [], tone: 'acolhedor', values: [], wants: [], weighs: [], asked: false },
  stateLog: [],
  stateNotes: {},
  inbox: [],
  agenda: {},
  agendaWin: { start: 7, end: 22 },
});

/** Junta o que veio salvo com os padrões, para não quebrar se algum campo faltar. */
export function normalize(raw: unknown): State {
  const base = initialState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<State>;
  const arr = <T,>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);
  return {
    ...base,
    onboarded: !!r.onboarded,
    recovery: !!r.recovery,
    settings: { ...base.settings, ...(r.settings ?? {}), ai: { ...base.settings.ai, ...(r.settings?.ai ?? {}) } },
    checkins: arr(r.checkins),
    tasks: arr(r.tasks),
    routines: arr(r.routines),
    sensory: arr(r.sensory),
    plan: { ...base.plan, ...(r.plan ?? {}) },
    templateEdits: r.templateEdits && typeof r.templateEdits === 'object' ? r.templateEdits : {},
    profile: { ...base.profile, ...(r.profile ?? {}) },
    stateLog: arr(r.stateLog),
    inbox: arr(r.inbox),
    agenda: r.agenda && typeof r.agenda === 'object' ? r.agenda : {},
    agendaWin: { ...base.agendaWin, ...(r.agendaWin ?? {}) },
    stateNotes: r.stateNotes && typeof r.stateNotes === 'object' ? r.stateNotes : {},
  };
}

function load(): { state: State; ok: boolean } {
  try {
    const txt = localStorage.getItem(KEY);
    return { state: txt ? normalize(JSON.parse(txt)) : initialState(), ok: true };
  } catch {
    return { state: initialState(), ok: false };
  }
}

interface Ctx {
  state: State;
  update: (fn: (s: State) => State) => void;
  replace: (s: State) => void;
  saveOk: boolean;
}
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const first = useRef(load());
  const [state, setState] = useState<State>(first.current.state);
  const [saveOk, setSaveOk] = useState(first.current.ok);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setSaveOk(true);
    } catch {
      setSaveOk(false);
    }
  }, [state]);

  const update = useCallback((fn: (s: State) => State) => setState((s) => fn(s)), []);
  const replace = useCallback((s: State) => setState(s), []);
  const value = useMemo(() => ({ state, update, replace, saveOk }), [state, update, replace, saveOk]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('StoreProvider ausente');
  return c;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
