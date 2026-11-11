import { useState } from 'react';
import { useStore, uid } from '../store';
import { go } from '../router';
import { Button, Card, PageHead } from '../ui';
import { Symbol } from '../Logo';
import { suggest, type Suggestion } from '../data/suggest';
import type { Mood } from '../types';

const MOODS: { id: Mood; label: string; sub: string }[] = [
  { id: 'energia', label: 'Tenho energia', sub: 'Dá para fazer algo' },
  { id: 'limite', label: 'Estou no limite', sub: 'Muita coisa ao mesmo tempo' },
  { id: 'pausa', label: 'Preciso de uma pausa', sub: 'Quero parar um pouco' },
];

export function Suggestions({ items, onDone }: { items: Suggestion[]; onDone?: () => void }) {
  const { update } = useStore();
  return (
    <ul className="space-y-3">
      {items.map((s) => (
        <li key={s.id}>
          <Card as="div">
            <h2 className="font-bold text-lg">{s.title}</h2>
            <p className="text-muted mb-3">{s.why}</p>
            <Button kind="primary" onClick={() => {
              if (s.effect === 'recovery') update((st) => ({ ...st, recovery: true }));
              onDone?.();
              go(s.to);
            }}>{s.label}</Button>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function Home() {
  const { state, update } = useStore();
  const [mood, setMood] = useState<Mood | null>(null);

  const choose = (m: Mood) => {
    update((s) => ({ ...s, checkins: [...s.checkins, { id: uid(), at: Date.now(), mood: m }].slice(-300) }));
    setMood(m);
  };

  if (mood) {
    const items = suggest({ mood });
    const text = { energia: 'Que bom. Aqui vão algumas ideias, sem obrigação:', limite: 'Obrigado/a por avisar. Vamos reduzir a carga. Escolha uma coisa:', pausa: 'Pausas são válidas. Escolha como quer descansar:' }[mood];
    return (
      <>
        <PageHead title="O que pode ajudar agora" sub={text} />
        <Suggestions items={items} />
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => setMood(null)}>Mudar minha resposta</Button>
          <Button onClick={() => go('/energia')}>Registrar com mais detalhe</Button>
        </div>
      </>
    );
  }

  // Uma única ação sugerida, escolhida pelo que mais pesa no dia (opcional) ou pelo que a pessoa já tem.
  const w = state.profile.weighs;
  const temTarefa = state.tasks.some((t) => !t.done && !t.later);
  const sug =
    w.includes('sono') ? { q: 'Quer preparar o fim do dia com calma?', l: 'Ver minhas rotinas', to: '/rotinas' }
    : w.includes('sobrecarga') ? { q: 'Quer uma pausa curta antes de qualquer coisa?', l: 'Ver práticas de regulação', to: '/regulacao' }
    : w.includes('relacionamentos') || w.includes('trabalho') ? { q: 'Precisa dizer algo sem saber como?', l: 'Ver mensagens prontas', to: '/comunicacao' }
    : w.includes('rotinas') ? { q: 'Quer seguir uma rotina, um passo de cada vez?', l: 'Ver minhas rotinas', to: '/rotinas' }
    : temTarefa ? { q: 'Quer começar algo pequeno?', l: 'Ver uma tarefa de 2 minutos', to: '/tarefas?foco=auto' }
    : { q: 'Quer anotar uma coisa para fazer?', l: 'Abrir minhas tarefas', to: '/tarefas' };
  return (
    <>
      <Symbol className="deco block w-40 h-auto mb-3" />
      <PageHead title="Como você está agora?" sub="Escolha o que combina mais. Não existe resposta errada." />
      <div className="space-y-3" role="group" aria-label="Como você está agora?">
        {MOODS.map((m) => (
          <button key={m.id} type="button" onClick={() => choose(m.id)}
            className="tap w-full text-left rounded-2xl border-2 border-line bg-surface px-5 py-5 hover:border-brand">
            <span className="block text-xl font-bold">{m.label}</span>
            <span className="block text-muted">{m.sub}</span>
          </button>
        ))}
      </div>
      {!state.settings.lowStim && (
        <Card className="mt-6 bg-soft border-soft">
          <p className="font-semibold mb-2">{sug.q}</p>
          <Button kind="action" onClick={() => go(sug.to)}>{sug.l}</Button>
        </Card>
      )}
      <div className="mt-4"><Button kind="ghost" onClick={() => go('/entender')}>Não sei o que estou sentindo</Button></div>
    </>
  );
}
