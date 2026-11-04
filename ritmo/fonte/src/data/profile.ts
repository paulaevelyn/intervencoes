import type { Profile, Settings, TraitId } from '../types';

export interface TraitInfo {
  id: TraitId;
  label: string;
  hint: string;
  /** Ajustes de acessibilidade que costumam ajudar. Só são aplicados se a pessoa aceitar. */
  settings?: Partial<Pick<Settings, 'readingFont' | 'wideSpacing' | 'fontScale' | 'alerts' | 'showCounts' | 'listen'>>;
  /** O que o Ritmo faz de diferente para esse jeito de funcionar. */
  does: string[];
}

export const TRAITS: TraitInfo[] = [
  {
    id: 'autismo', label: 'Autismo', hint: 'Autista, com ou sem laudo',
    settings: { alerts: 'screen' },
    does: ['Avisos de transição ligados nas rotinas, para a mudança de atividade ser previsível.', 'Linguagem direta e literal, se você preferir.', 'Estados como sobrecarga, meltdown, shutdown e exaustão aparecem primeiro.'],
  },
  {
    id: 'tdah', label: 'TDAH', hint: 'Atenção, impulsividade, funções executivas',
    settings: { showCounts: true, alerts: 'screen' },
    does: ['Tempo visível nos cronômetros e rotinas (cegueira para o tempo).', 'Passos menores e começo de 2 minutos em destaque.', 'Dicas de interesse, novidade, urgência amiga e companhia (body doubling).', 'Aviso para parar no hiperfoco.'],
  },
  {
    id: 'audhd', label: 'AuDHD (autismo + TDAH)', hint: 'As duas coisas juntas',
    settings: { showCounts: true, alerts: 'screen' },
    does: ['Estrutura com flexibilidade: rotinas previsíveis, mas com variação planejada.', 'Dicas que consideram a puxada entre precisar de rotina e se entediar rápido.', 'Mais atenção a sobrecarga, paralisia e exaustão ao mesmo tempo.'],
  },
  {
    id: 'dislexia', label: 'Dislexia', hint: 'Leitura e escrita',
    settings: { readingFont: true, wideSpacing: true, fontScale: 115, listen: true },
    does: ['Fonte de leitura, espaçamento amplo e texto maior.', 'Botão “Ouvir” para ouvir os textos em voz alta.', 'Textos curtos e passos curtos, um de cada vez.'],
  },
  {
    id: 'ah', label: 'Altas habilidades / superdotação', hint: 'Sozinha ou junto com autismo, TDAH etc.',
    does: ['Dicas para perfeccionismo: definir o que é “bom o suficiente” antes de começar.', 'Atenção ao tédio e à falta de desafio, que também cansam.', 'Quando há dupla condição (por exemplo, altas habilidades + autismo), as dicas se somam.'],
  },
  { id: 'dispraxia', label: 'Dispraxia / TDC', hint: 'Coordenação motora', does: ['Passos que reduzem tarefas motoras finas e a pressa.', 'Lembrete de dar mais tempo para tarefas que exigem coordenação.'] },
  { id: 'discalculia', label: 'Discalculia', hint: 'Números e cálculos', does: ['Estimativas de tempo com margem e lembrete de usar apoios (calculadora, anotações).'] },
  { id: 'tourette', label: 'Tourette / tiques', hint: 'Tiques motores ou vocais', does: ['Sem cobrar “ficar parado/a” nas práticas. Movimento é bem-vindo.', 'Atenção a cansaço e tensão do corpo.'] },
  { id: 'investigando', label: 'Em investigação / suspeita', hint: 'Ainda sem resposta fechada', does: ['Tudo do app fica disponível, sem rótulo. Você pode ajustar depois.'] },
  { id: 'outro', label: 'Outro jeito de funcionar', hint: 'Algo que não está na lista', does: ['Tudo do app fica disponível. Use os ajustes para deixar do seu jeito.'] },
];

export const traitInfo = (id: TraitId) => TRAITS.find((t) => t.id === id)!;

/** AuDHD conta como autismo e como TDAH. */
export function has(p: Pick<Profile, 'traits'>, t: 'autismo' | 'tdah' | 'dislexia' | 'ah'): boolean {
  const x = p.traits;
  if (t === 'autismo') return x.includes('autismo') || x.includes('audhd');
  if (t === 'tdah') return x.includes('tdah') || x.includes('audhd');
  return x.includes(t);
}

/** Ajustes sugeridos para o perfil, só os que mudam algo em relação aos ajustes atuais. */
export function suggestedSettings(traits: TraitId[], current: Settings) {
  const patch: Partial<Settings> = {};
  const why: string[] = [];
  const LABEL: Record<string, string> = { readingFont: 'Fonte de leitura facilitada', wideSpacing: 'Espaçamento amplo', fontScale: 'Texto maior', alerts: 'Avisos de transição na tela', showCounts: 'Mostrar contagens de tempo', listen: 'Botão “Ouvir”' };
  for (const id of traits) {
    const s = traitInfo(id).settings;
    if (!s) continue;
    for (const [k, v] of Object.entries(s)) {
      const key = k as keyof typeof s;
      if (k === 'alerts' && current.alerts !== 'off') continue; // respeita quem escolheu vibração
      if (current[key as keyof Settings] !== v && patch[key as keyof Settings] === undefined) {
        (patch as Record<string, unknown>)[k] = v;
        why.push(LABEL[k]);
      }
    }
  }
  return { patch, why };
}

/** Dicas para o jeito de funcionar da pessoa, para começar uma tarefa. */
export function startTips(p: Pick<Profile, 'traits'>): string[] {
  const out: string[] = [];
  if (has(p, 'tdah')) out.push('Marque um tempo curto (10 minutos) e trate como um desafio. Ou faça junto de alguém, mesmo em silêncio.', 'Se estiver difícil começar, comece pela parte mais interessante, não pela mais lógica.');
  if (has(p, 'autismo')) out.push('Escreva o que você já sabe e o que ainda não está claro. Menos incerteza costuma facilitar.', 'Se puder, deixe o ambiente do jeito que ajuda: luz, som, roupa.');
  if (has(p, 'ah')) out.push('Defina antes o que é “bom o suficiente”. Pronto vale mais do que perfeito.');
  if (has(p, 'dislexia')) out.push('Use leitura em voz alta ou áudio, e anote por tópicos curtos.');
  if (p.traits.includes('dispraxia')) out.push('Dê mais tempo do que parece necessário e simplifique o que depende de coordenação fina.');
  if (p.traits.includes('discalculia')) out.push('Use calculadora ou planilha e confira os números uma única vez, no final.');
  return out.slice(0, 3);
}

/** Dicas para parar e voltar, por perfil. */
export function stopTips(p: Pick<Profile, 'traits'>): string[] {
  const out: string[] = [];
  if (has(p, 'tdah')) out.push('Hiperfoco: ponha um alarme e levante para beber água e ir ao banheiro, mesmo que esteja rendendo.');
  if (has(p, 'autismo')) out.push('Pare antes de chegar ao limite: o cansaço de sobrecarga costuma aparecer depois.');
  if (has(p, 'ah')) out.push('Parar no “bom o suficiente” não é desistir. É escolher onde gastar energia.');
  return out;
}
