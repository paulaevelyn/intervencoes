import { useEffect, useRef, useState } from 'react';
import { useStore, uid } from '../store';
import { go, useRoute } from '../router';
import { Button, Card, ConfirmButton, Field, inputCls, Note, PageHead, TextList } from '../ui';
import { splitTask } from '../data/split';
import type { Task } from '../types';
import { iaDividir, iaLigada, iaTemConta } from '../ia';
import { startTips } from '../data/profile';

export function Tasks() {
  const { state, update } = useStore();
  const route = useRoute();
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const [showAll, setShowAll] = useState(false);
  const focusParam = route.q.get('foco');

  const patch = (id: string, fn: (t: Task) => Task) =>
    update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? fn(t) : t)) }));

  const active = state.tasks.filter((t) => !t.done && !t.later);
  const later = state.tasks.filter((t) => !t.done && t.later);
  const done = state.tasks.filter((t) => t.done);

  /* ---------- Modo foco (primeiro passo de 2 minutos) ---------- */
  if (focusParam) {
    const task = focusParam === 'auto' ? active[0] : state.tasks.find((t) => t.id === focusParam);
    return (
      <Focus
        task={task}
        onSplit={(t) => patch(t.id, (x) => (x.steps.length ? x : { ...x, steps: splitTask(x.title).map((text) => ({ id: uid(), text, done: false })) }))}
        onStep={(t, stepId) => patch(t.id, (x) => ({ ...x, steps: x.steps.map((s) => (s.id === stepId ? { ...s, done: true } : s)) }))}
        onExit={() => go('/tarefas')}
        onAdd={(text) => update((s) => ({ ...s, tasks: [{ id: uid(), title: text, steps: [], done: false, later: false, createdAt: Date.now() }, ...s.tasks] }))}
      />
    );
  }

  const add = () => {
    const t = title.trim();
    if (!t) return;
    update((s) => ({ ...s, tasks: [{ id: uid(), title: t, steps: [], done: false, later: false, createdAt: Date.now() }, ...s.tasks] }));
    setTitle('');
    setMsg(`Guardado: “${t}”. Sem pressa.`);
  };

  const calm = (state.recovery || state.settings.lowStim) && !showAll;
  const shown = calm ? active.slice(0, 1) : active;

  return (
    <>
      <PageHead title="Tarefas" sub="Uma coisa de cada vez. Nada aqui tem prazo obrigatório." />

      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mb-5 flex gap-2 items-end">
        <div className="flex-1"><Field label="Nova tarefa"><input className={inputCls} value={title} maxLength={120} placeholder="Ex.: responder o e-mail do banco" onChange={(e) => setTitle(e.target.value)} /></Field></div>
        <Button kind="primary" icon="plus" type="submit">Adicionar</Button>
      </form>

      {!state.settings.lowStim && <div className="mb-4"><Button onClick={() => go('/planejar')}>Planejar o dia com ajuda</Button></div>}

      <p role="status" aria-live="polite" className={msg ? 'mb-4 rounded-xl bg-soft p-3' : 'sr-only'}>{msg}</p>

      {calm && active.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Note>{state.recovery ? 'Modo de recuperação' : 'Modo calmo'}: só uma tarefa por vez. As outras ({active.length - 1}) estão guardadas.</Note>
          {!state.recovery && <Button onClick={() => setShowAll(true)}>Ver todas</Button>}
        </div>
      )}

      {shown.length === 0 && done.length === 0 && later.length === 0 && (
        <Card className="mt-3"><p className="font-semibold">Nada por aqui ainda.</p><p className="text-muted">Escreva uma tarefa acima. Se estiver difícil, escreva só a primeira coisa que vem à cabeça.</p></Card>
      )}
      {shown.length === 0 && (done.length > 0 || later.length > 0) && (
        <Card className="mt-3"><p className="font-semibold">Nada para agora.</p><p className="text-muted">Descansar também conta.</p></Card>
      )}

      <ul className="space-y-3 mt-3">
        {shown.map((t) => <TaskItem key={t.id} t={t} patch={patch} setMsg={setMsg} />)}
      </ul>

      {!calm && later.length > 0 && (
        <section className="mt-8" aria-labelledby="h-depois">
          <h2 id="h-depois" className="text-lg font-bold mb-2">Para depois ({later.length})</h2>
          <p className="text-muted text-sm mb-2">Guardadas sem data. Volte quando fizer sentido.</p>
          <ul className="space-y-3">{later.map((t) => <TaskItem key={t.id} t={t} patch={patch} setMsg={setMsg} />)}</ul>
        </section>
      )}

      {!calm && done.length > 0 && (
        <details className="mt-8">
          <summary className="tap cursor-pointer font-bold text-lg flex items-center">Feitas ({done.length})</summary>
          <ul className="space-y-3 mt-2">{done.map((t) => <TaskItem key={t.id} t={t} patch={patch} setMsg={setMsg} />)}</ul>
          <div className="mt-3"><Button onClick={() => update((s) => ({ ...s, tasks: s.tasks.filter((t) => !t.done) }))}>Limpar as feitas</Button></div>
        </details>
      )}
    </>
  );
}

function TaskItem({ t, patch, setMsg }: { t: Task; patch: (id: string, fn: (t: Task) => Task) => void; setMsg: (m: string) => void }) {
  const { update } = useStore();
  const [more, setMore] = useState(false);
  const [edit, setEdit] = useState(false);
  const doneSteps = t.steps.filter((s) => s.done).length;

  const toggleDone = () => {
    patch(t.id, (x) => ({ ...x, done: !x.done, later: false }));
    setMsg(t.done ? `“${t.title}” voltou para a lista.` : `Feito: “${t.title}”. Obrigado/a por cuidar disso.`);
  };
  const { state } = useStore();
  const [busy, setBusy] = useState(false);
  const mk = (arr: string[]) => arr.map((text) => ({ id: uid(), text, done: false }));
  const split = () => patch(t.id, (x) => ({ ...x, steps: mk(splitTask(x.title)) }));
  const splitIA = async () => {
    setBusy(true);
    const r = await iaDividir(state.settings, state.profile, t.title);
    setBusy(false);
    if (r.ok) patch(t.id, (x) => ({ ...x, steps: mk(r.data) }));
    else { split(); setMsg(r.mensagem); }
  };

  return (
    <Card as="li" className={t.done ? 'opacity-80' : ''}>
      <div className="flex items-start gap-3">
        <button type="button" role="checkbox" aria-checked={t.done} onClick={toggleDone}
          aria-label={`${t.done ? 'Desmarcar' : 'Marcar como feita'}: ${t.title}`}
          className={`tap shrink-0 rounded-xl border-2 w-12 h-12 flex items-center justify-center text-xl font-bold ${t.done ? 'bg-brand text-brand-ink border-brand' : 'bg-surface border-line hover:border-brand'}`}>
          {t.done ? '✓' : ''}
        </button>
        <div className="min-w-0 flex-1">
          <h2 className={`font-bold text-lg break-words ${t.done ? 'line-through decoration-1' : ''}`}>{t.title}</h2>
          <p className="text-sm text-muted">
            {t.minutes ? `Cerca de ${t.minutes} min` : 'Sem estimativa'}
            {t.steps.length > 0 && ` · ${doneSteps} de ${t.steps.length} passos`}
            {t.example && ' · exemplo'}
          </p>
        </div>
      </div>

      {!t.done && !edit && (
        <p className="mt-3"><span className="font-semibold">Primeiro passo:</span> {t.steps.find((x) => !x.done)?.text ?? splitTask(t.title)[0]}</p>
      )}
      {t.steps.length > 0 && !t.done && !edit && (
        <details className="mt-2">
          <summary className="tap cursor-pointer text-muted flex items-center">Ver os {t.steps.length} passos</summary>
          <ol className="mt-1 space-y-1">
            {t.steps.map((s, i) => (
              <li key={s.id}>
                <label className="tap flex items-start gap-3 py-1 cursor-pointer">
                  <input type="checkbox" className="w-6 h-6 mt-0.5 accent-[var(--brand)] shrink-0" checked={s.done}
                    onChange={() => patch(t.id, (x) => ({ ...x, steps: x.steps.map((y) => (y.id === s.id ? { ...y, done: !y.done } : y)) }))} />
                  <span className={s.done ? 'text-muted line-through decoration-1' : ''}><span className="text-muted">{i + 1}. </span>{s.text}</span>
                </label>
              </li>
            ))}
          </ol>
        </details>
      )}

      {edit && (
        <div className="mt-3 space-y-3">
          <Field label="Título"><input className={inputCls} value={t.title} maxLength={120} onChange={(e) => patch(t.id, (x) => ({ ...x, title: e.target.value }))} /></Field>
          <div>
            <p className="font-semibold mb-1">Passos</p>
            <TextList items={t.steps.map((s) => s.text)} addLabel="Novo passo" placeholder="Novo passo pequeno"
              onChange={(arr) => patch(t.id, (x) => ({ ...x, steps: arr.map((text, i) => ({ id: x.steps[i]?.id ?? uid(), text, done: x.steps[i]?.done ?? false })) }))} />
          </div>
          <Button kind="primary" onClick={() => setEdit(false)}>Pronto</Button>
        </div>
      )}

      {!t.done && !edit && (
        <div className="mt-4 flex flex-wrap gap-2">
          {t.later
            ? <Button kind="action" onClick={() => { patch(t.id, (x) => ({ ...x, later: false })); setMsg('Voltou para a lista de agora.'); }}>Trazer para agora</Button>
            : <>
                <Button kind="action" onClick={() => go(`/tarefas?foco=${t.id}`)}>Começar</Button>
                <Button onClick={() => { patch(t.id, (x) => ({ ...x, later: true })); setMsg('Essa tarefa ficou para depois, sem data e sem cobrança. Quer dividi-la em um passo menor?'); }}>Adiar</Button>
                {t.steps.length === 0 && <Button onClick={split}>Dividir em passos</Button>}
                {t.steps.length > 3 && <Button onClick={() => { patch(t.id, (x) => ({ ...x, steps: x.steps.slice(0, 3) })); setMsg('Simplificada: ficaram só os 3 primeiros passos. Fazer uma parte já vale.'); }}>Simplificar</Button>}
              </>}
          <Button kind="ghost" aria-expanded={more} onClick={() => setMore(!more)}>{more ? 'Menos opções' : 'Mais opções'}</Button>
        </div>
      )}

      {(more || t.done) && !edit && (
        <div className="mt-3 space-y-3 border-t-2 border-line pt-3">
          {!t.done && (
            <Field label="Estimativa de tempo (opcional)">
              <div className="flex items-center gap-2">
                <input type="number" inputMode="numeric" min={1} max={600} className={`${inputCls} max-w-[7rem]`} value={t.minutes ?? ''} placeholder="min"
                  onChange={(e) => patch(t.id, (x) => ({ ...x, minutes: e.target.value ? Math.max(1, Math.min(600, Number(e.target.value))) : undefined }))} />
                <span>minutos</span>
              </div>
            </Field>
          )}
          <div className="flex flex-wrap gap-2">
            {!t.done && t.steps.length === 0 && iaLigada(state.settings) && iaTemConta() && <Button disabled={busy} onClick={splitIA}>{busy ? 'Pensando…' : 'Dividir com IA'}</Button>}
            {!t.done && t.steps.length > 0 && <Button icon="edit" onClick={() => setEdit(true)}>Editar passos</Button>}
            {!t.done && t.steps.length === 0 && <Button icon="edit" onClick={() => setEdit(true)}>Editar</Button>}
            <ConfirmButton label="Excluir" onConfirm={() => update((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== t.id) }))} />
          </div>
        </div>
      )}
    </Card>
  );
}

function Focus({ task, onSplit, onStep, onExit, onAdd }: {
  task: Task | undefined; onSplit: (t: Task) => void; onStep: (t: Task, stepId: string) => void; onExit: () => void; onAdd: (t: string) => void;
}) {
  const { state } = useStore();
  const [left, setLeft] = useState<number | null>(null); // segundos restantes se o cronômetro (opcional) estiver rodando
  const [over, setOver] = useState(false);
  const [view, setView] = useState<'agora' | 'depois' | 'ajuda'>('agora');
  const [draft, setDraft] = useState('');
  const timer = useRef<number>();

  useEffect(() => { if (task && task.steps.length === 0) onSplit(task); }, [task?.id, task?.steps.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => window.clearInterval(timer.current), []);

  if (!task) {
    return (
      <>
        <PageHead title="Começar" onBack={onExit} />
        <Card>
          <p className="font-semibold mb-2">Ainda não há tarefa para começar.</p>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { onAdd(draft.trim()); setDraft(''); } }}>
            <input aria-label="Nova tarefa" className={inputCls} value={draft} placeholder="Escreva uma tarefa pequena" onChange={(e) => setDraft(e.target.value)} />
            <Button kind="primary" type="submit">Criar</Button>
          </form>
        </Card>
      </>
    );
  }

  const next = task.steps.find((s) => !s.done);
  const why = [...state.profile.values, ...state.profile.wants][[...task.id].reduce((a, c) => a + c.charCodeAt(0), 0) % Math.max(1, state.profile.values.length + state.profile.wants.length)];
  const tips = startTips(state.profile);
  const stop = () => { window.clearInterval(timer.current); setLeft(null); };
  const start = () => {
    setOver(false);
    setLeft(120);
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setLeft((v) => {
        if (v === null) return v;
        if (v <= 1) {
          window.clearInterval(timer.current);
          setOver(true);
          if (state.settings.alerts === 'vibrate' && !state.settings.lowStim) navigator.vibrate?.(200);
          return null;
        }
        return v - 1;
      });
    }, 1000);
  };
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (view === 'depois') {
    return (
      <>
        <PageHead title="Passo feito" />
        <Card className="py-6"><p className="text-lg">Obrigado/a por cuidar disso. {next ? 'Quer seguir para o próximo passo ou parar por aqui? Os dois valem.' : 'Era o último passo desta tarefa. Marque a tarefa como feita quando quiser.'}</p></Card>
        <div className="mt-4 flex flex-wrap gap-2">
          {next && <Button kind="action" big onClick={() => { setView('agora'); setOver(false); }}>Fazer o próximo passo</Button>}
          <Button onClick={() => { stop(); onExit(); }}>{next ? 'Parar por aqui' : 'Voltar às tarefas'}</Button>
        </div>
      </>
    );
  }
  if (!next) {
    return (
      <>
        <PageHead title="Todos os passos feitos" onBack={onExit} />
        <Card><p className="text-lg">Você fez os passos de “{task.title}”. Marque a tarefa como feita quando quiser.</p>
          <div className="mt-4"><Button kind="primary" onClick={onExit}>Voltar às tarefas</Button></div></Card>
      </>
    );
  }

  if (view === 'ajuda') {
    return (
      <>
        <PageHead title="Tudo bem travar" sub="Escolha o que pode ajudar agora." onBack={() => setView('agora')} />
        <div className="space-y-2">
          <Button block onClick={() => go('/estados/paralisia')}>Entender por que está difícil começar</Button>
          <Button block onClick={() => go('/regulacao/descompressao')}>Fazer uma pausa de 5 minutos</Button>
          <Button block onClick={() => go('/apoio-agora')}>Abrir meu plano de apoio</Button>
          <Button block kind="ghost" onClick={() => { stop(); onExit(); }}>Deixar esta tarefa para depois</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Agora" sub={`Tarefa: ${task.title}`} onBack={() => { stop(); onExit(); }} />
      <Card className="text-center py-8">
        <p className="text-2xl font-bold leading-snug mx-auto">{next.text}</p>
        <p className="text-muted mt-3">Tempo sugerido: 2 minutos. Parar depois é permitido.</p>
        {left !== null && (state.settings.showCounts
          ? <p className="text-3xl font-bold mt-3" aria-label={`Faltam ${Math.ceil(left / 60)} minutos`}>{fmt(left)}</p>
          : <p className="text-muted mt-3">O tempo está passando. A contagem está escondida.</p>)}
        {over && <p role="status" className="text-lg mt-3">Passaram os 2 minutos. Continuar e parar são escolhas boas.</p>}
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button kind="action" big onClick={() => { stop(); setOver(false); onStep(task, next.id); setView('depois'); }}>Feito</Button>
        <Button onClick={() => setView('ajuda')}>Preciso de ajuda</Button>
        {left !== null ? <Button onClick={stop}>Pausar</Button> : <Button kind="ghost" onClick={start}>Usar um cronômetro de 2 minutos</Button>}
      </div>
      {(why || tips.length > 0) && !state.settings.lowStim && (
        <Card className="mt-4 bg-soft border-soft">
          {why && <p className="mb-2"><strong>Por que isso importa para você:</strong> {why}</p>}
          {tips.length > 0 && <><p className="font-semibold">Para o seu jeito</p><ul className="list-disc pl-5">{tips.slice(0, 2).map((t) => <li key={t}>{t}</li>)}</ul></>}
        </Card>
      )}
    </>
  );
}
