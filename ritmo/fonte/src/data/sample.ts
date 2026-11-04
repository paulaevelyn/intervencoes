import type { CheckIn, Routine, SensoryEntry, State, Task } from '../types';
import { uid } from '../store';

const DAY = 86_400_000;

/** Dados só para demonstração. Todos marcados com example:true para poderem ser removidos de uma vez. */
export function sampleData(): Pick<State, 'tasks' | 'routines' | 'sensory' | 'checkins'> {
  const now = Date.now();
  const st = (text: string, done = false) => ({ id: uid(), text, done });

  const tasks: Task[] = [
    { id: uid(), title: 'Responder e-mail da faculdade', minutes: 15, done: false, later: false, createdAt: now, example: true,
      steps: ['Abra só a mensagem que precisa de resposta', 'Escreva a primeira frase, mesmo que imperfeita', 'Complete com o essencial (3 ou 4 linhas)', 'Envie, ou salve como rascunho'].map((t, i) => st(t, i === 0)) },
    { id: uid(), title: 'Marcar consulta', minutes: 10, done: false, later: false, createdAt: now, example: true, steps: [] },
    { id: uid(), title: 'Arrumar a mesa de trabalho', done: false, later: true, createdAt: now, example: true, steps: [] },
  ];

  const routines: Routine[] = [
    { id: uid(), name: 'Manhã', icon: '🌅', color: 'sand', alertBefore: 2, example: true, steps: [
      { id: uid(), text: 'Beber água', minutes: 2 }, { id: uid(), text: 'Remédio ou vitaminas, se usar', minutes: 1 },
      { id: uid(), text: 'Higiene e roupa confortável', minutes: 15 }, { id: uid(), text: 'Café da manhã simples', minutes: 15 },
      { id: uid(), text: 'Olhar a agenda do dia', minutes: 5 } ] },
    { id: uid(), name: 'Transição para casa', icon: '🏠', color: 'sky', alertBefore: 5, example: true, steps: [
      { id: uid(), text: 'Chegar e tirar sapatos e bolsa', minutes: 3 }, { id: uid(), text: 'Ficar 10 minutos em silêncio ou luz baixa', minutes: 10 },
      { id: uid(), text: 'Comer ou beber algo', minutes: 15 }, { id: uid(), text: 'Trocar de roupa', minutes: 5 } ] },
  ];

  const mk = (daysAgo: number, env: SensoryEntry['env'], stimuli: string[], level: SensoryEntry['level'], helped: string[]): SensoryEntry =>
    ({ id: uid(), at: now - daysAgo * DAY - 3_600_000, env, stimuli, level, helped, example: true });
  const sensory: SensoryEntry[] = [
    mk(0.2, 'trabalho', ['Ruído', 'Multidão'], 'alta', ['Fones', 'Pausa']),
    mk(1, 'transporte', ['Multidão', 'Cheiro'], 'alta', ['Fones']),
    mk(2, 'casa', ['Luz'], 'leve', ['Silêncio']),
    mk(3, 'social', ['Ruído', 'Multidão'], 'alta', ['Pausa', 'Objeto preferido']),
    mk(4, 'estudo', ['Ruído'], 'moderada', ['Fones', 'Silêncio']),
    mk(5, 'trabalho', ['Luz', 'Ruído'], 'moderada', ['Óculos escuros']),
    mk(6, 'casa', ['Textura'], 'nenhuma', []),
  ];

  const checkins: CheckIn[] = [
    { id: uid(), at: now - 1 * DAY, energy: 'baixa', overload: 'alta', need: 'descanso', example: true },
    { id: uid(), at: now - 2 * DAY, energy: 'media', overload: 'leve', need: 'foco', example: true },
    { id: uid(), at: now - 3 * DAY, energy: 'alta', overload: 'nenhuma', need: 'organizacao', example: true },
  ];

  return { tasks, routines, sensory, checkins };
}

export const ROUTINE_MODELS: Omit<Routine, 'id'>[] = [
  { name: 'Manhã', icon: '🌅', color: 'sand', alertBefore: 0, steps: [
    { id: 'a', text: 'Beber água', minutes: 2 }, { id: 'b', text: 'Higiene', minutes: 15 }, { id: 'c', text: 'Vestir roupa confortável', minutes: 5 }, { id: 'd', text: 'Comer algo', minutes: 15 } ] },
  { name: 'Trabalho', icon: '💼', color: 'sky', alertBefore: 0, steps: [
    { id: 'a', text: 'Arrumar o espaço e ajustar luz e som', minutes: 5 }, { id: 'b', text: 'Escolher a primeira tarefa pequena', minutes: 5 }, { id: 'c', text: 'Primeiro bloco de foco', minutes: 25 }, { id: 'd', text: 'Pausa sem tela', minutes: 10 } ] },
  { name: 'Estudo', icon: '📚', color: 'lilac', alertBefore: 0, steps: [
    { id: 'a', text: 'Separar material e água', minutes: 3 }, { id: 'b', text: 'Estudar um trecho pequeno', minutes: 20 }, { id: 'c', text: 'Anotar o que entendeu', minutes: 5 }, { id: 'd', text: 'Pausa', minutes: 10 } ] },
  { name: 'Transição para casa', icon: '🏠', color: 'sage', alertBefore: 0, steps: [
    { id: 'a', text: 'Guardar sapatos e bolsa', minutes: 3 }, { id: 'b', text: 'Descomprimir em silêncio ou luz baixa', minutes: 10 }, { id: 'c', text: 'Comer ou beber algo', minutes: 15 } ] },
  { name: 'Hora de dormir', icon: '🌙', color: 'slate', alertBefore: 0, steps: [
    { id: 'a', text: 'Baixar luzes e telas', minutes: 10 }, { id: 'b', text: 'Higiene', minutes: 10 }, { id: 'c', text: 'Preparar o quarto (temperatura, som, cobertor)', minutes: 5 }, { id: 'd', text: 'Deitar', minutes: 5 } ] },
];
