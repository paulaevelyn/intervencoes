import type { Level3, Profile } from '../types';
import { has } from './profile';

export interface Bloco { tipo: 'tarefa' | 'pausa'; titulo: string; minutos: number; nota?: string; passos?: string[] }
export interface Plano { blocos: Bloco[]; depois: string[]; dicas: string[]; fonte: 'regras' | 'ia' }

const EST: [RegExp, number][] = [
  [/e-?mail|mensagem|responder|whats/i, 15], [/ligar|telefon|marcar|agendar/i, 10], [/pagar|boleto|fatura/i, 10],
  [/estud|ler |leitura|prova|aula/i, 30], [/escrev|relat[óo]rio|texto|projeto|apresenta/i, 40], [/limp|arrum|organiz|lou[çc]a|roupa/i, 20],
  [/banho|dent|higiene|rem[eé]dio/i, 15], [/mercado|compras|feira/i, 45],
];
const MIN = /\(?\b(\d{1,3})\s*(?:min|minutos|m)\b\)?/i;

export function estimar(t: string): number {
  const m = MIN.exec(t);
  if (m) return Math.max(5, Math.min(240, Number(m[1])));
  return EST.find(([r]) => r.test(t))?.[1] ?? 20;
}
export const limpar = (t: string) => t.replace(MIN, '').replace(/\s{2,}/g, ' ').replace(/[-–:,;\s]+$/, '').trim();
const urgente = (t: string) => /urgente|hoje|prazo|vence|até amanhã|importante/i.test(t);

/** Plano simples, sem IA: separa a lista, escolhe o que cabe na energia e no tempo, e intercala pausas. */
export function planejarLocal(texto: string, energia: Level3, minutosDisponiveis: number, profile: Pick<Profile, 'traits'>): Plano {
  const itens = texto.split(/\n|;/).map((s) => s.trim().replace(/^[-*•\d.)\s]+/, '')).filter(Boolean).slice(0, 25)
    .map((t) => ({ titulo: limpar(t), min: estimar(t), u: urgente(t) }));
  const capTarefas = { baixa: 1, media: 3, alta: 5 }[energia];
  const capMin = Math.min(minutosDisponiveis, { baixa: 25, media: 90, alta: 180 }[energia]);

  const ordenados = [...itens].sort((a, b) => Number(b.u) - Number(a.u));
  const escolhidos: typeof itens = [];
  let total = 0;
  for (const it of ordenados) {
    if (escolhidos.length >= capTarefas) break;
    if (total + it.min > capMin && escolhidos.length > 0) continue;
    escolhidos.push(it); total += it.min;
  }
  // ganho rápido primeiro (começar pelo menor ajuda a dar partida)
  if (energia !== 'baixa' && escolhidos.length > 1) escolhidos.sort((a, b) => a.min - b.min);

  const blocos: Bloco[] = [];
  let seq = 0;
  escolhidos.forEach((it, i) => {
    blocos.push({ tipo: 'tarefa', titulo: it.titulo, minutos: it.min, nota: i === 0 ? 'Comece pelos 2 primeiros minutos. Parar depois é permitido.' : undefined });
    seq += it.min;
    if (i < escolhidos.length - 1 && (seq >= 25 || it.min >= 20)) { blocos.push({ tipo: 'pausa', titulo: 'Pausa: água, alongar, olhar para longe', minutos: 5 }); seq = 0; }
  });
  if (blocos.length) blocos.push({ tipo: 'pausa', titulo: 'Fechamento: anote onde parou e descanse', minutos: 5 });

  const depois = itens.filter((i) => !escolhidos.includes(i)).map((i) => i.titulo);
  const dicas: string[] = [];
  if (energia === 'baixa') dicas.push('Com pouca energia, uma coisa já é o plano. O resto pode esperar sem culpa.');
  if (has(profile, 'tdah')) dicas.push('Ponha um cronômetro em cada bloco e comece pelo item mais rápido, para ganhar embalo.');
  if (has(profile, 'autismo')) dicas.push('Se algo mudar no meio do plano, tudo bem trocar a ordem. Avise a si mesmo/a antes de mudar de bloco.');
  if (has(profile, 'ah')) dicas.push('Defina o que é “bom o suficiente” para cada bloco. Terminar vale mais que perfeição.');
  if (!blocos.length) dicas.push('Escreva suas tarefas, uma por linha, para eu montar o plano.');
  return { blocos, depois, dicas: dicas.slice(0, 3), fonte: 'regras' };
}
