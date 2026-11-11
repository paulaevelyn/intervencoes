import { useState } from 'react';
import { useStore, uid } from '../store';
import { back } from '../router';
import { Button, Card, ConfirmButton, Field, inputCls, Note, PageHead } from '../ui';

/** Caixa de captura: guarda o que passou pela cabeça sem exigir decisão agora. */
export function Inbox() {
  const { state, update } = useStore();
  const [t, setT] = useState('');
  const items = [...state.inbox].sort((a, b) => b.at - a.at);
  const add = () => { const x = t.trim(); if (!x) return; update((s) => ({ ...s, inbox: [{ id: uid(), text: x, at: Date.now(), kind: 'ideia' }, ...s.inbox] })); setT(''); };
  const vira = (id: string, text: string) => update((s) => ({
    ...s,
    inbox: s.inbox.filter((i) => i.id !== id),
    tasks: [{ id: uid(), title: text.slice(0, 120), steps: [], done: false, later: false, createdAt: Date.now() }, ...s.tasks],
  }));
  return (
    <>
      <PageHead title="Caixa de captura" sub="Anote o que passou pela cabeça e siga em frente. Decidir o que fazer com isso fica para depois." onBack={() => back('/tarefas')} />
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="flex gap-2 items-end mb-5">
        <div className="flex-1"><Field label="O que passou pela sua cabeça?"><input className={inputCls} value={t} maxLength={160} onChange={(e) => setT(e.target.value)} placeholder="Ex.: responder a mensagem da Ana" /></Field></div>
        <Button kind="primary" icon="plus" type="submit">Guardar</Button>
      </form>
      {items.length === 0 && <Note>A caixa está vazia. Quando surgir uma ideia ou uma distração, guarde aqui para não precisar lembrar.</Note>}
      <ul className="space-y-3">
        {items.map((i) => (
          <Card as="li" key={i.id}>
            <p className="text-lg">{i.text}</p>
            <p className="text-sm text-muted">{i.kind === 'distracao' ? 'Guardado durante uma tarefa' : 'Ideia'} · {new Date(i.at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button kind="action" onClick={() => vira(i.id, i.text)}>Virar tarefa</Button>
              <ConfirmButton label="Apagar" confirmLabel="Sim, apagar" onConfirm={() => update((s) => ({ ...s, inbox: s.inbox.filter((x) => x.id !== i.id) }))} />
            </div>
          </Card>
        ))}
      </ul>
    </>
  );
}
