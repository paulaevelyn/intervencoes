import type { Block } from '../types';

export const pad = (n: number) => String(n).padStart(2, '0');
export const hhmm = (min: number) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (key: string, n: number) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n)); };
export const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export const durLabel = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`);

export const overlaps = (blocks: Block[], start: number, dur: number, ignoreId?: string) =>
  blocks.some((b) => b.id !== ignoreId && start < b.start + b.dur && b.start < start + dur);

/** Trechos livres [início, fim] dentro da janela do dia, em minutos. */
export function gaps(blocks: Block[], winStart: number, winEnd: number): [number, number][] {
  const sorted = [...blocks].sort((a, b) => a.start - b.start);
  const out: [number, number][] = [];
  let cur = winStart;
  for (const b of sorted) {
    if (b.start > cur) out.push([cur, Math.min(b.start, winEnd)]);
    cur = Math.max(cur, b.start + b.dur);
  }
  if (cur < winEnd) out.push([cur, winEnd]);
  return out.filter(([a, z]) => z > a);
}

const up = (m: number, step = 15) => Math.ceil(m / step) * step;

/** Encaixa itens, em ordem, nos primeiros trechos livres a partir de `from`. Devolve os blocos novos e o que não coube. */
export function place(existing: Block[], items: { title: string; dur: number; kind: 'tarefa' | 'pausa'; taskId?: string }[], from: number, winEnd: number, id: () => string) {
  const blocks = [...existing];
  const added: Block[] = [];
  const left: typeof items = [];
  for (const it of items) {
    const g = gaps(blocks, up(from), winEnd).find(([a, z]) => z - up(Math.max(a, from)) >= it.dur);
    if (!g) { left.push(it); continue; }
    const start = up(Math.max(g[0], from));
    const b: Block = { id: id(), start, dur: it.dur, title: it.title, kind: it.kind, taskId: it.taskId };
    blocks.push(b); added.push(b);
  }
  return { added, left };
}
