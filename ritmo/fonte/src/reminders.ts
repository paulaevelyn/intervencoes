import { useCallback, useEffect, useRef, useState } from 'react';
import type { State } from './types';

/* Lembretes locais (mesmo modelo do Aurora): notificação agendada no aparelho, sem servidor.
   A configuração fica só neste aparelho e NUNCA é sincronizada (chave fora de data-storage-keys). */
const K = 'ritmo:lembrete';
export interface Rem { enabled: boolean; daily: boolean; hour: number }
const DEF: Rem = { enabled: false, daily: true, hour: 20 };

export function readRem(): Rem {
  try { return { ...DEF, ...(JSON.parse(localStorage.getItem(K) || 'null') ?? {}) }; } catch { return DEF; }
}
export function useRem(): [Rem, (p: Partial<Rem>) => void] {
  const [rem, setRem] = useState<Rem>(readRem);
  const set = useCallback((p: Partial<Rem>) => {
    setRem((r) => {
      const n = { ...r, ...p };
      try { localStorage.setItem(K, JSON.stringify(n)); } catch { /* sem armazenamento */ }
      window.dispatchEvent(new Event('ritmo-rem'));
      return n;
    });
  }, []);
  return [rem, set];
}

export const notifSupported = () => 'Notification' in window;
export const notifPermission = () => (notifSupported() ? Notification.permission : 'denied');
export const iosNotInstalled = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !((navigator as unknown as { standalone?: boolean }).standalone || window.matchMedia?.('(display-mode: standalone)').matches);

export async function show(body: string, tag: string) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification('Ritmo', { body, icon: 'icon-192.png', badge: 'icon-192.png', tag });
    else new Notification('Ritmo', { body, icon: 'icon-192.png', tag });
  } catch (e) { console.warn('[Ritmo] notificação falhou', e); }
}

const DAILY_MSGS = [
  'Se quiser, veja como você está agora. Sem pressa.',
  'Um momento para você, se fizer sentido hoje.',
  'Como está o seu corpo agora? Registrar leva 10 segundos.',
];

const usedToday = (s: State) => {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const t = d.getTime();
  return s.checkins.some((c) => c.at >= t) || s.sensory.some((c) => c.at >= t);
};

function nextAt(h: number, m: number) {
  const n = new Date(); const t = new Date(n); t.setHours(h, m, 0, 0);
  if (t <= n) t.setDate(t.getDate() + 1);
  return t.getTime();
}

interface Item { at: number; kind: 'daily' | 'routine'; name?: string; id: string }
export function upcoming(rem: Rem, s: State): Item[] {
  const out: Item[] = [];
  if (rem.daily && !s.settings.lowStim) out.push({ at: nextAt(rem.hour, 0), kind: 'daily', id: 'daily' });
  for (const r of s.routines) {
    const m = /^(\d{2}):(\d{2})$/.exec(r.remindAt ?? '');
    if (m) out.push({ at: nextAt(Number(m[1]), Number(m[2])), kind: 'routine', name: r.name, id: r.id });
  }
  return out.sort((a, b) => a.at - b.at);
}

/** Agenda a próxima notificação. Retorna a função que cancela. */
export function schedule(getState: () => State): () => void {
  let timer: number | undefined;
  const run = () => {
    window.clearTimeout(timer);
    const rem = readRem();
    if (!rem.enabled || notifPermission() !== 'granted') return;
    const next = upcoming(rem, getState())[0];
    if (!next) return;
    timer = window.setTimeout(async () => {
      const s = getState();
      if (next.kind === 'daily') {
        if (!usedToday(s)) await show(DAILY_MSGS[Math.floor(Math.random() * DAILY_MSGS.length)], 'ritmo-diario');
      } else {
        await show(`Rotina “${next.name}”: quando puder.`, `ritmo-rotina-${next.id}`);
      }
      run();
    }, Math.min(next.at - Date.now() + 500, 2_000_000_000));
  };
  run();
  const on = () => { if (document.visibilityState === 'visible') run(); };
  document.addEventListener('visibilitychange', on);
  window.addEventListener('ritmo-rem', run);
  return () => { window.clearTimeout(timer); document.removeEventListener('visibilitychange', on); window.removeEventListener('ritmo-rem', run); };
}

export function useReminders(state: State) {
  const ref = useRef(state);
  ref.current = state;
  useEffect(() => schedule(() => ref.current), [state.routines, state.settings.lowStim]);
}
