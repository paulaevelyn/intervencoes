import type { Profile } from '../types';
import { ESTADOS, estadoById, type EstadoInfo } from './estados';
import { has, startTips, stopTips } from './profile';
import { splitTask } from './split';

export const SENSACOES = [
  { id: 'peito', label: 'Aperto no peito ou coração acelerado' },
  { id: 'garganta', label: 'Nó na garganta ou vontade de chorar' },
  { id: 'estomago', label: 'Estômago embrulhado' },
  { id: 'calor', label: 'Calor no rosto, mandíbula ou mãos tensas' },
  { id: 'tremor', label: 'Tremor ou corpo agitado' },
  { id: 'cabeca', label: 'Cabeça pesada ou com pressão' },
  { id: 'peso', label: 'Corpo pesado, sem energia' },
  { id: 'vazio', label: 'Vazio, desligado/a, longe' },
  { id: 'semfala', label: 'Dificuldade de falar ou achar palavras' },
  { id: 'inquieto', label: 'Inquietação, vontade de me mexer' },
  { id: 'travado', label: 'Quero fazer, mas não consigo começar' },
  { id: 'sensorial', label: 'Barulho, luz ou cheiro insuportáveis' },
  { id: 'leve', label: 'Energia boa, animação' },
  { id: 'nada', label: 'Não sei dizer' },
] as const;

export const CONTEXTOS = [
  { id: 'ruido', label: 'Muito barulho, luz ou gente' },
  { id: 'demanda', label: 'Muitas demandas ou um prazo' },
  { id: 'mudanca', label: 'Mudança de planos ou imprevisto' },
  { id: 'critica', label: 'Crítica, rejeição ou conflito' },
  { id: 'corpo', label: 'Pouco sono, fome ou cansaço' },
  { id: 'tedio', label: 'Tarefa monótona ou sem sentido' },
  { id: 'social', label: 'Muito tempo com gente, “segurando a onda”' },
  { id: 'nada', label: 'Nada em particular' },
] as const;

export const BARREIRAS = [
  { id: 'comeco', label: 'Não sei por onde começar' },
  { id: 'energia', label: 'Estou sem energia' },
  { id: 'medo', label: 'Tenho medo de errar ou de não ficar bom' },
  { id: 'tedio', label: 'É chato ou monótono' },
  { id: 'sobrecarga', label: 'Estou sobrecarregado/a' },
  { id: 'esquecimento', label: 'Esqueço ou perco o fio' },
] as const;

const BARREIRA_TATICA: Record<string, string> = {
  comeco: 'Escolha só a primeira ação, de 2 minutos. Começar pequeno é o objetivo.',
  energia: 'Faça uma versão mínima ou adie. Com pouca energia, descanso vem antes.',
  medo: 'Defina o “bom o suficiente” antes e faça um rascunho feio. Revisar depois é mais fácil do que acertar de primeira.',
  tedio: 'Acrescente estímulo seguro: cronômetro curto, música, outro lugar ou companhia.',
  sobrecarga: 'Reduza estímulos e o tamanho da tarefa. Talvez hoje a melhor decisão seja pausar.',
  esquecimento: 'Deixe um lembrete visível agora, anote onde parou e ponha na sua rotina.',
};

export const NECESSIDADES: Record<string, string> = {
  silencio: 'Silêncio e menos estímulo', espaco: 'Espaço e tempo sozinho/a', descanso: 'Descanso', comida: 'Água ou comida',
  movimento: 'Mexer o corpo', contato: 'Alguém por perto, sem precisar falar muito', comecar: 'Ajuda para começar',
  pressao: 'Pressão profunda (cobertor, abraço apertado)', acolhimento: 'Acolhimento e gentileza', ancorar: 'Voltar ao presente pelos sentidos', estimulo: 'Um estímulo bom e seguro',
};
const NEEDS_BY_STATE: Record<string, string[]> = {
  sobrecarga: ['silencio', 'espaco', 'descanso'], meltdown: ['silencio', 'espaco', 'pressao'], shutdown: ['silencio', 'descanso', 'comida'],
  exaustao: ['descanso', 'espaco', 'comida'], paralisia: ['comecar', 'movimento', 'contato'], hiperfoco: ['comida', 'movimento'],
  rejeicao: ['acolhimento', 'contato', 'ancorar'], tedio: ['estimulo', 'movimento'], ansiedade: ['ancorar', 'movimento', 'acolhimento'],
  tristeza: ['acolhimento', 'contato', 'descanso'], raiva: ['movimento', 'espaco'],
};

const W_SENS: Record<string, Record<string, number>> = {
  peito: { ansiedade: 2, sobrecarga: 1, meltdown: 1 }, garganta: { tristeza: 2, shutdown: 1, rejeicao: 1 }, estomago: { ansiedade: 2, rejeicao: 1 },
  calor: { raiva: 2, meltdown: 2, sobrecarga: 1 }, tremor: { ansiedade: 1, meltdown: 2, raiva: 1 }, cabeca: { sobrecarga: 2, exaustao: 1 },
  peso: { exaustao: 2, shutdown: 1, tristeza: 2 }, vazio: { shutdown: 2, exaustao: 1, tristeza: 1 }, semfala: { shutdown: 3, sobrecarga: 1 },
  inquieto: { tedio: 2, ansiedade: 1 }, travado: { paralisia: 3 }, sensorial: { sobrecarga: 3, meltdown: 1 }, leve: { hiperfoco: 1 },
};
const W_CTX: Record<string, Record<string, number>> = {
  ruido: { sobrecarga: 3, meltdown: 1 }, demanda: { sobrecarga: 2, paralisia: 1, ansiedade: 1, exaustao: 1 }, mudanca: { ansiedade: 2, sobrecarga: 1, meltdown: 1 },
  critica: { rejeicao: 3, raiva: 1, tristeza: 1 }, corpo: { exaustao: 2, raiva: 1, sobrecarga: 1 }, tedio: { tedio: 3, paralisia: 1 },
  social: { exaustao: 3, shutdown: 1, sobrecarga: 1 },
};

export interface GuiaEntrada { sens: string[]; ctx: string[]; objetivo?: string; barreira?: string; profile: Profile }
export interface Guia {
  hipoteses: EstadoInfo[];
  principal?: EstadoInfo;
  precisa: string[];
  comoFazer: string[];
  regular: string[];
  parar: string[];
  compaixao: string;
  ajuda: string;
  poucasPistas: boolean;
}

/** Sugere hipóteses (não diagnósticos) a partir de sensações e contexto. Regras simples e transparentes. */
export function pontuar(sens: string[], ctx: string[], profile: Pick<Profile, 'traits'>): [string, number][] {
  const sc: Record<string, number> = {};
  const add = (m: Record<string, number> | undefined, k = 1) => m && Object.entries(m).forEach(([s, w]) => (sc[s] = (sc[s] ?? 0) + w * k));
  sens.forEach((s) => add(W_SENS[s]));
  ctx.forEach((c) => add(W_CTX[c]));
  const base = Object.keys(sc).length > 0;
  if (base) {
    // desempate pelo perfil: só pesa um pouco
    if (has(profile, 'autismo')) ['sobrecarga', 'shutdown', 'meltdown', 'exaustao'].forEach((s) => sc[s] !== undefined && (sc[s] += 0.5));
    if (has(profile, 'tdah')) ['paralisia', 'tedio', 'rejeicao', 'hiperfoco'].forEach((s) => sc[s] !== undefined && (sc[s] += 0.5));
    if (has(profile, 'ah')) ['tedio', 'exaustao'].forEach((s) => sc[s] !== undefined && (sc[s] += 0.3));
  }
  return Object.entries(sc).sort((a, b) => b[1] - a[1]);
}

const primeira = (t: string) => t.split(/(?<=[.!?])\s/)[0];

export function guiaDoMomento(e: GuiaEntrada): Guia {
  const ranked = pontuar(e.sens, e.ctx, e.profile).slice(0, 3);
  const hipoteses = ranked.map(([id]) => estadoById(id)!).filter(Boolean);
  const principal = hipoteses[0];
  const direto = e.profile.tone === 'direto';

  const comoFazer: string[] = [];
  if (e.barreira && BARREIRA_TATICA[e.barreira]) comoFazer.push(BARREIRA_TATICA[e.barreira]);
  if (e.objetivo?.trim()) comoFazer.push(...splitTask(e.objetivo.trim()).slice(0, 3).map((s, i) => `${i + 1}. ${s}`));
  comoFazer.push(...startTips(e.profile).slice(0, 2));

  const pesado = principal && ['meltdown', 'shutdown', 'sobrecarga', 'exaustao'].includes(principal.id);
  return {
    hipoteses,
    principal,
    precisa: (principal ? NEEDS_BY_STATE[principal.id] : ['ancorar', 'descanso']).map((n) => NECESSIDADES[n]),
    comoFazer: pesado ? [] : comoFazer, // em sobrecarga forte, não empilhar tarefa
    regular: principal ? principal.praticas : ['checagem-corpo', 'respiracao', 'grounding'],
    parar: [...(principal ? principal.parar : ['Se você não consegue distinguir o que sente, pare e faça a checagem do corpo.']), ...stopTips(e.profile)].slice(0, 4),
    compaixao: principal ? (direto ? primeira(principal.compaixao) : principal.compaixao) : 'Eu não preciso saber o que sinto agora. Eu posso cuidar do meu corpo primeiro.',
    ajuda: principal ? principal.ajuda : 'Se você se sentir em risco, ligue 188 (CVV, 24h) ou 192 (SAMU).',
    poucasPistas: ranked.length === 0,
  };
}

/** Estados ordenados para o perfil: os mais relevantes primeiro, nenhum escondido. */
export function estadosOrdenados(traits: Profile['traits']) {
  const p = { traits };
  const score = (e: EstadoInfo) =>
    e.destaque.some((t) => traits.includes(t) || (t === 'autismo' && has(p, 'autismo')) || (t === 'tdah' && has(p, 'tdah'))) ? 1 : 0;
  return [...ESTADOS].sort((a, b) => score(b) - score(a));
}

export const EMOCOES = [
  { id: 'ansiedade', label: 'Ansiedade', corpo: 'coração acelerado, aperto no peito ou no estômago, mãos suadas', precisa: 'segurança, previsibilidade, respiração lenta' },
  { id: 'raiva', label: 'Raiva', corpo: 'calor, mandíbula e punhos tensos, respiração rápida', precisa: 'espaço, movimento, um limite respeitado' },
  { id: 'tristeza', label: 'Tristeza', corpo: 'peso no peito, nó na garganta, cansaço', precisa: 'acolhimento, descanso, companhia gentil' },
  { id: 'medo', label: 'Medo', corpo: 'frio na barriga, vontade de fugir ou congelar', precisa: 'segurança e informação clara' },
  { id: 'vergonha', label: 'Vergonha', corpo: 'rosto quente, vontade de sumir, olhar para baixo', precisa: 'gentileza e alguém que acolha sem julgar' },
  { id: 'frustracao', label: 'Frustração', corpo: 'tensão, suspiros, vontade de desistir', precisa: 'uma pausa e um jeito menor de tentar' },
  { id: 'solidao', label: 'Solidão', corpo: 'vazio no peito, vontade de contato sem saber como pedir', precisa: 'conexão de baixa pressão, no seu ritmo' },
  { id: 'alegria', label: 'Alegria / entusiasmo', corpo: 'leveza, energia, vontade de se mexer ou de falar do assunto', precisa: 'espaço para aproveitar e para descansar depois' },
  { id: 'calma', label: 'Calma', corpo: 'respiração solta, ombros baixos', precisa: 'manter o que está ajudando' },
] as const;
