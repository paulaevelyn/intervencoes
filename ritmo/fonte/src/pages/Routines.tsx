import { useEffect, useRef, useState } from 'react';
import { useStore, uid } from '../store';
import { back, go, useRoute } from '../router';
import { Button, Card, ConfirmButton, Field, Icon, inputCls, Note, PageHead } from '../ui';
import { ROUTINE_MODELS } from '../data/sample';
import type { ColorId, Routine } from '../types';

const ICONS = [
  ['🌅', 'Manhã'], ['💼', 'Trabalho'], ['📚', 'Estudo'], ['🏠', 'Casa'], ['🌙', 'Noite'],
  ['🍽️', 'Refeição'], ['🧘', 'Calma'], ['🚌', 'Deslocamento'], ['🧹', 'Arrumar'], ['💊', 'Cuidados'],
];
const COLORS: { id: ColorId; label: string }[] = [
  { id: '', label: 'Sem cor' }, { id: 'sage', label: 'Verde' }, { id: 'sky', label: 'Azul' },
  { id: 'sand', label: 'Areia' }, { id: 'rose', label: 'Rosa' }, { id: 'lilac', label: 'Lilás' }, { id: 'slate', label: 'Cinza' },
];
export const colorVar = (c: ColorId) => (c ? `var(--c-${c})` : 'var(--line)');
const total = (r: Routine) => r.steps.reduce((a, s) => a + (s.minutes ?? 0), 0);

export function Routines() {
  const { state } = useStore();
  const { parts } = useRoute();
  const id = parts[1];
  if (id === 'novo' || (id && parts[2] === 'editar')) return <Edit id={id} />;
  if (id) {
    const r = state.routines.find((x) => x.id === id);
    if (r) return <Run r={r} />;
  }
  return <List />;
}

function List() {
  const { state, update } = useStore();
  const create = (m?: Omit<Routine, 'id'>) => {
    const r: Routine = m
      ? { ...m, id: uid(), steps: m.steps.map((s) => ({ ...s, id: uid() })) }
      : { id: uid(), name: '', icon: '🏠', color: '', steps: [], alertBefore: 0 };
    update((s) => ({ ...s, routines: [...s.routines, r] }));
    go(`/rotinas/${r.id}/editar`);
  };

  if (state.routines.length === 0) {
    return (
      <>
        <PageHead title="Rotinas" sub="Passos em ordem, para você não precisar decidir tudo de novo. Comece por um modelo e ajuste." />
        <ul className="space-y-3">
          {ROUTINE_MODELS.map((m) => (
            <li key={m.name}>
              <button type="button" onClick={() => create(m)} className="tap w-full text-left rounded-2xl border-2 border-line bg-surface p-4 hover:border-brand flex items-center gap-4">
                <span className="text-3xl" aria-hidden="true">{m.icon}</span>
                <span><span className="block font-bold text-lg">{m.name}</span><span className="block text-muted">{m.steps.length} passos · cerca de {m.steps.reduce((a, s) => a + (s.minutes ?? 0), 0)} min</span></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4"><Button icon="plus" onClick={() => create()}>Criar do zero</Button></div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Rotinas" sub="Escolha uma para ver os passos, um de cada vez." />
      <ul className="space-y-3">
        {state.routines.map((r) => (
          <Card as="li" key={r.id} style={{ borderLeft: `10px solid ${colorVar(r.color)}` }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">{r.icon}</span>
              <div>
                <h2 className="font-bold text-lg">{r.name || 'Sem nome'}{r.example ? <span className="text-sm font-normal text-muted"> · exemplo</span> : null}</h2>
                <p className="text-muted text-sm">{r.steps.length} passos{total(r) ? ` · cerca de ${total(r)} min` : ''}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button kind="primary" onClick={() => go(`/rotinas/${r.id}`)}>Começar</Button>
              <Button icon="edit" onClick={() => go(`/rotinas/${r.id}/editar`)}>Editar</Button>
            </div>
          </Card>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button icon="plus" onClick={() => create()}>Nova rotina</Button>
        <details className="w-full">
          <summary className="tap cursor-pointer flex items-center font-semibold">Adicionar a partir de um modelo</summary>
          <div className="flex flex-wrap gap-2 mt-2">{ROUTINE_MODELS.map((m) => <Button key={m.name} onClick={() => create(m)}>{m.icon} {m.name}</Button>)}</div>
        </details>
      </div>
    </>
  );
}

function Edit({ id }: { id: string }) {
  const { state, update } = useStore();
  const r = state.routines.find((x) => x.id === id);
  const [draft, setDraft] = useState('');
  if (!r) return <><PageHead title="Rotina não encontrada" onBack={() => go('/rotinas')} /></>;

  const set = (fn: (r: Routine) => Routine) => update((s) => ({ ...s, routines: s.routines.map((x) => (x.id === id ? fn(x) : x)) }));
  const move = (i: number, d: -1 | 1) => set((x) => {
    const a = [...x.steps]; const j = i + d; if (j < 0 || j >= a.length) return x;
    [a[i], a[j]] = [a[j], a[i]]; return { ...x, steps: a };
  });
  const addStep = () => { const t = draft.trim(); if (t) { set((x) => ({ ...x, steps: [...x.steps, { id: uid(), text: t }] })); setDraft(''); } };

  return (
    <>
      <PageHead title="Editar rotina" sub="As mudanças são salvas sozinhas." onBack={() => back('/rotinas')} />
      <div className="space-y-6">
        <Field label="Nome"><input className={inputCls} value={r.name} maxLength={40} placeholder="Ex.: Manhã" onChange={(e) => set((x) => ({ ...x, name: e.target.value }))} /></Field>

        <fieldset>
          <legend className="font-semibold mb-2">Ícone</legend>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(([e, n]) => (
              <button key={e} type="button" aria-pressed={r.icon === e} onClick={() => set((x) => ({ ...x, icon: e }))}
                className={`tap rounded-xl border-2 px-3 py-1 flex items-center gap-2 ${r.icon === e ? 'border-brand bg-soft font-bold' : 'border-line bg-surface'}`}>
                <span aria-hidden="true" className="text-xl">{e}</span><span>{n}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-semibold mb-2">Cor (opcional)</legend>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c.id} type="button" aria-pressed={r.color === c.id} onClick={() => set((x) => ({ ...x, color: c.id }))}
                className={`tap rounded-xl border-2 px-3 py-1 flex items-center gap-2 ${r.color === c.id ? 'border-brand bg-soft font-bold' : 'border-line bg-surface'}`}>
                <span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-line" style={{ background: c.id ? colorVar(c.id) : 'transparent' }} />{c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <section aria-labelledby="h-passos">
          <h2 id="h-passos" className="font-semibold mb-2">Passos, em ordem</h2>
          {r.steps.length === 0 && <p className="text-muted mb-2">Ainda sem passos. Adicione o primeiro abaixo.</p>}
          <ol className="space-y-2 mb-3">
            {r.steps.map((s, i) => (
              <li key={s.id} className="rounded-xl border-2 border-line bg-surface p-3 space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="font-bold pt-3 w-6 text-center" aria-hidden="true">{i + 1}</span>
                  <input aria-label={`Passo ${i + 1}`} className={inputCls} value={s.text} onChange={(e) => set((x) => ({ ...x, steps: x.steps.map((y) => (y.id === s.id ? { ...y, text: e.target.value } : y)) }))} />
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-8">
                  <label className="flex items-center gap-2">
                    <span className="text-sm text-muted">Tempo</span>
                    <input type="number" inputMode="numeric" min={1} max={240} aria-label={`Minutos do passo ${i + 1}`} className={`${inputCls} !w-24`} placeholder="min" value={s.minutes ?? ''}
                      onChange={(e) => set((x) => ({ ...x, steps: x.steps.map((y) => (y.id === s.id ? { ...y, minutes: e.target.value ? Math.max(1, Math.min(240, Number(e.target.value))) : undefined } : y)) }))} />
                  </label>
                  <Button aria-label={`Subir passo ${i + 1}`} disabled={i === 0} onClick={() => move(i, -1)}><Icon name="up" className="w-5 h-5" /><span className="sr-only">Subir</span></Button>
                  <Button aria-label={`Descer passo ${i + 1}`} disabled={i === r.steps.length - 1} onClick={() => move(i, 1)}><Icon name="down" className="w-5 h-5" /><span className="sr-only">Descer</span></Button>
                  <Button aria-label={`Remover passo ${i + 1}`} onClick={() => set((x) => ({ ...x, steps: x.steps.filter((y) => y.id !== s.id) }))}><Icon name="trash" className="w-5 h-5" /><span className="sr-only">Remover</span></Button>
                </div>
              </li>
            ))}
          </ol>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addStep(); }}>
            <input aria-label="Novo passo" className={inputCls} value={draft} placeholder="Novo passo" onChange={(e) => setDraft(e.target.value)} />
            <Button kind="primary" icon="plus" type="submit">Adicionar</Button>
          </form>
          {total(r) > 0 && <p className="mt-2 text-muted">Tempo total estimado: cerca de {total(r)} min.</p>}
        </section>

        <Field label="Alerta antes de cada passo terminar" hint="Aparece na tela, sem som. Funciona nos passos que têm tempo.">
          <select className={inputCls} value={r.alertBefore} onChange={(e) => set((x) => ({ ...x, alertBefore: Number(e.target.value) }))}>
            <option value={0}>Sem alerta</option>
            <option value={1}>1 minuto antes</option>
            <option value={2}>2 minutos antes</option>
            <option value={5}>5 minutos antes</option>
          </select>
        </Field>
        {r.alertBefore > 0 && state.settings.alerts === 'off' && <Note tone="warm">Os avisos de transição estão desligados em Ajustes. Ligue lá para o alerta aparecer.</Note>}

        <div className="flex flex-wrap gap-2">
          <Button kind="primary" onClick={() => go('/rotinas')}>Pronto</Button>
          <ConfirmButton label="Excluir rotina" onConfirm={() => { update((s) => ({ ...s, routines: s.routines.filter((x) => x.id !== id) })); go('/rotinas'); }} />
        </div>
      </div>
    </>
  );
}

function Run({ r }: { r: Routine }) {
  const { state } = useStore();
  const [i, setI] = useState(0);
  const [start, setStart] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const buzzed = useRef(-1);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(t);
  }, []);

  const step = r.steps[i];
  const goTo = (n: number) => { setI(n); setStart(Date.now()); setNow(Date.now()); };
  const planned = step?.minutes ? step.minutes * 60 : 0;
  const remaining = planned ? planned - Math.floor((now - start) / 1000) : 0;
  const alertOn = state.settings.alerts !== 'off' && r.alertBefore > 0 && planned > 0 && remaining <= r.alertBefore * 60 && remaining > 0;

  useEffect(() => {
    if (alertOn && state.settings.alerts === 'vibrate' && buzzed.current !== i) { buzzed.current = i; navigator.vibrate?.(150); }
  }, [alertOn, i, state.settings.alerts]);

  if (r.steps.length === 0) {
    return <><PageHead title={r.name} onBack={() => go('/rotinas')} /><Card><p>Esta rotina ainda não tem passos.</p><div className="mt-3"><Button kind="primary" onClick={() => go(`/rotinas/${r.id}/editar`)}>Adicionar passos</Button></div></Card></>;
  }
  if (finished) {
    return (
      <>
        <PageHead title="Rotina concluída" onBack={() => go('/rotinas')} />
        <Card><p className="text-lg">Você chegou ao fim de “{r.name}”. Obrigado/a por cuidar de você do seu jeito.</p><div className="mt-4"><Button kind="primary" onClick={() => go('/rotinas')}>Voltar às rotinas</Button></div></Card>
      </>
    );
  }

  const nextStep = r.steps[i + 1];
  const mins = Math.max(1, Math.ceil(remaining / 60));
  return (
    <>
      <PageHead title={`${r.icon} ${r.name}`} sub={`Passo ${i + 1} de ${r.steps.length}`} onBack={() => go('/rotinas')} />
      <Card style={{ borderLeft: `10px solid ${colorVar(r.color)}` }} className="py-8">
        <p className="text-2xl font-bold leading-snug">{step.text}</p>
        {state.settings.showCounts && planned > 0 && (
          <p className="mt-3 text-muted" aria-live="off">
            {remaining > 0 ? `Tempo previsto: cerca de ${mins} min restantes` : 'Passou do tempo previsto. Tudo bem. Siga quando puder.'}
          </p>
        )}
      </Card>
      {alertOn && (
        <p role="status" className="mt-3 rounded-xl bg-warm p-3 font-semibold">
          Em cerca de {mins} min: {nextStep ? `próximo passo é “${nextStep.text}”.` : 'a rotina termina.'}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button kind="primary" big onClick={() => (nextStep ? goTo(i + 1) : setFinished(true))}>{nextStep ? 'Próximo passo' : 'Concluir rotina'}</Button>
        {i > 0 && <Button onClick={() => goTo(i - 1)}>Voltar um passo</Button>}
      </div>
      {nextStep && <p className="mt-5 text-muted">Depois: {nextStep.text}</p>}
    </>
  );
}
