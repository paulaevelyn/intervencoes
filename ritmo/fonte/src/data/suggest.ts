import type { CheckIn, Level3, Mood, Need, Overload } from '../types';

export interface Suggestion {
  id: string;
  title: string;
  why: string;
  label: string; // texto do botão
  to: string; // rota
  effect?: 'recovery';
}

export type SuggestInput = Pick<CheckIn, 'mood' | 'energy' | 'overload' | 'need'>;

const S: Record<string, Suggestion> = {
  sensorial: { id: 'sensorial', title: 'Pausa sensorial de 5 minutos', why: 'Menos luz, menos som e nenhuma demanda por um tempinho.', label: 'Começar a pausa', to: '/regulacao/descompressao' },
  respirar: { id: 'respirar', title: 'Respiração guiada', why: 'Soltar o ar devagar ajuda o corpo a baixar o ritmo. Você pode esconder os números.', label: 'Respirar junto', to: '/regulacao/respiracao' },
  reduzir: { id: 'reduzir', title: 'Reduzir o dia ao mínimo', why: 'Marque o que pode esperar. Só o essencial fica.', label: 'Ver checklist', to: '/regulacao/reduzir-demandas' },
  recuperacao: { id: 'recuperacao', title: 'Ligar o modo de recuperação', why: 'Mostra só uma tarefa por vez e guarda o resto. Você desliga quando quiser.', label: 'Ligar modo de recuperação', to: '/tarefas', effect: 'recovery' },
  apoio: { id: 'apoio', title: 'Abrir meu plano de apoio', why: 'Sinais, o que ajuda e quem você pode chamar, num só lugar.', label: 'Abrir plano', to: '/apoio-agora' },
  pequena: { id: 'pequena', title: 'Uma tarefa pequena de 2 minutos', why: 'Só o primeiro passo. Parar depois é permitido.', label: 'Escolher o primeiro passo', to: '/tarefas?foco=auto' },
  planejar: { id: 'planejar', title: 'Olhar o dia com calma', why: 'Escolha até 3 coisas e deixe o resto para depois.', label: 'Ver minhas tarefas', to: '/tarefas' },
  rotina: { id: 'rotina', title: 'Seguir uma rotina visual', why: 'Os passos já estão em ordem, sem precisar decidir.', label: 'Ver rotinas', to: '/rotinas' },
  grounding: { id: 'grounding', title: 'Voltar ao presente: 5-4-3-2-1', why: 'Usa os sentidos para ancorar. Pode usar só um sentido.', label: 'Fazer agora', to: '/regulacao/grounding' },
  autocompaixao: { id: 'autocompaixao', title: 'Roteiro de autocompaixão', why: 'Palavras gentis para um momento difícil. Sem cobrança.', label: 'Ler o roteiro', to: '/regulacao/autocompaixao' },
  registrar: { id: 'registrar', title: 'Registrar o que está pesando', why: 'Anotar ambiente e estímulos ajuda a ver padrões depois.', label: 'Fazer registro sensorial', to: '/sensorial' },
  movimento: { id: 'movimento', title: 'Movimento livre por 2 minutos', why: 'Balançar, esticar ou fazer seu movimento repetitivo preferido regula.', label: 'Ver como', to: '/regulacao/movimento' },
  frases: { id: 'frases', title: 'Frases para pedir apoio', why: 'Prontas para copiar, caso falar esteja difícil.', label: 'Ver frases', to: '/regulacao/frases-apoio' },
  corpo: { id: 'corpo', title: 'Checagem do corpo', why: 'Fome, sede, sono, barulho, roupa. Às vezes é uma dessas.', label: 'Fazer checagem', to: '/regulacao/checagem-corpo' },
  descanso: { id: 'descanso', title: 'Descansar sem culpa', why: 'Descansar também é uma decisão válida para hoje.', label: 'Ver pausa guiada', to: '/regulacao/descompressao' },
};

const isLow = (e?: Level3) => e === 'baixa';
const isHigh = (o?: Overload) => o === 'alta';
const isMod = (o?: Overload) => o === 'moderada' || o === 'alta';

/** Regras simples e transparentes. Retorna de 2 a 3 sugestões. */
export function suggest(i: SuggestInput): Suggestion[] {
  const out: Suggestion[] = [];
  const add = (...k: string[]) => k.forEach((x) => { if (!out.find((o) => o.id === x)) out.push(S[x]); });

  const mood: Mood | undefined = i.mood;
  const overloadHigh = isHigh(i.overload) || mood === 'limite';

  if (isLow(i.energy) && isHigh(i.overload)) add('sensorial', 'reduzir', 'recuperacao');
  else if (mood === 'limite') add('sensorial', 'reduzir', 'apoio');
  else if (mood === 'pausa') add('descanso', 'respirar', 'registrar');
  else if (overloadHigh) add('sensorial', 'respirar', 'reduzir');

  const need: Need | undefined = i.need;
  if (need === 'foco') add(isMod(i.overload) ? 'reduzir' : 'pequena', 'respirar');
  if (need === 'descanso') add('descanso', 'sensorial');
  if (need === 'organizacao') add('planejar', 'rotina');
  if (need === 'regulacao') add('respirar', 'grounding', 'autocompaixao');
  if (need === 'registrar') add('registrar');

  if (mood === 'energia' || i.energy === 'alta') {
    if (!isMod(i.overload)) add('pequena', 'planejar', 'rotina');
    else add('movimento', 'pequena');
  }
  if (i.energy === 'media' && !isMod(i.overload)) add('pequena', 'movimento');
  if (isLow(i.energy) && !isMod(i.overload)) add('descanso', 'corpo', 'pequena');
  if (isMod(i.overload) && !isHigh(i.overload)) add('respirar', 'sensorial');

  // preenchimento seguro
  add('respirar', 'corpo', 'registrar');
  return out.slice(0, 3);
}
