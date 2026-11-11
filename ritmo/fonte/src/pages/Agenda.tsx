import { useEffect, useState } from 'react';
import { useStore, uid } from '../store';
import { back, go } from '../router';
import { Button, Card, Field, Note, PageHead, inputCls } from '../ui';
import { addDays, dayKey, durLabel, gaps, hhmm, nowMin, overlaps, place } from '../data/agenda';
import { planejarLocal } from '../data/planner';
import { splitTask } from '../data/split';
import type { AgendaDay, Block } from '../types';

const DURS = [15, 30, 45, 60, 90, 120];
const empty: AgendaDay = { priorities: ['', '', ''], blocks: [] };

/** Meu dia em blocos: escrever tudo, escolher até 3 prioridades e organizar por tempo. Tudo é flexível. */
export function Agenda() {
  const { state, update } = useStore();
  const [key, setKey] = useState(dayKey());
  const [now, setNow] = useState(nowMin());
  const [panel, setPanel] = useState<null | { id?: string; start: number; max: number }>(null);
  const [msg, setMsg] = useState('');
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { const t = window.setInterval(() => setNow(nowMin()), 60_000); return () => window.clearInterval(t); }, []);

  const day: AgendaDay = { ...empty, ...(state.agenda[key] ?? {}), priorities: [...(state.agenda[key]?.priorities ?? []), '', '', ''].slice(0, 3) };
  const win = state.agendaWin;
  const ws = win.start * 60, we = win.end * 60;
  const isToday = key === dayKey();
  const calm = state.settings.lowStim && !showAll;

  const setDay = (fn: (d: AgendaDay) => AgendaDay) => update((s) => {
    const cur = { ...empty, ...(s.agenda[key] ?? {}) };
    const agenda = { ...s.agenda, [key]: fn(cur) };
    // guarda só os últimos 30 dias
    const lim = addDays(dayKey(), -30);
    Object.keys(agenda).forEach((k) => { if (k < lim) delete agenda[k]; });
    return { ...s, agenda };
  });

  const candidatos = [
    ...day.priorities.filter(Boolean).map((t) => ({ t, tag: 'Prioridade' })),
    ...state.tasks.filter((t) => !t.done && !t.later).map((t) => ({ t: t.title, tag: 'Tarefa', taskId: t.id })),
    ...state.inbox.map((i) => ({ t: i.text, tag: 'Caixa' })),
  ].filter((c, i, a) => a.findIndex((x) => x.t === c.t) === i);

  const sugerir = () => {
    const texto = candidatos.map((c) => c.t).join('\n');
    if (!texto.trim()) { setMsg('Escreva o que tem para fazer (tarefas, caixa de captura ou prioridades) e eu monto uma sugestão.'); return; }
    const energia = [...state.checkins].reverse().find((c) => c.energy)?.energy ?? 'media';
    const livre = gaps(day.blocks, isToday ? Math.max(ws, now) : ws, we).reduce((a, [x, z]) => a + (z - x), 0);
    const plano = planejarLocal(texto, energia, Math.max(30, livre), state.profile);
    const itens = plano.blocos.map((b) => ({ title: b.titulo, dur: Math.max(15, Math.round(b.minutos / 15) * 15), kind: b.tipo }));
    const { added, left } = place(day.blocks, itens, isToday ? Math.max(ws, now) : ws, we, uid);
    setDay((d) => ({ ...d, blocks: [...d.blocks, ...added] }));
    setMsg(added.length ? `Montei uma sugestão com ${added.filter((b) => b.kind === 'tarefa').length} bloco(s) e pausas.${left.length ? ' O resto ficou de fora, sem culpa.' : ''} Mexa no que quiser: nada aqui é obrigatório. Deixe espaço livre, porque tudo costuma levar mais tempo do que parece.` : 'Não coube nada no tempo livre de hoje. Dá para escolher outro dia ou ampliar a janela do dia.');
  };

  const comecar = (b: Block) => {
    let id = b.taskId;
    if (!id || !state.tasks.some((t) => t.id === id)) {
      id = uid();
      const taskId = id;
      update((s) => ({ ...s, tasks: [{ id: taskId, title: b.title, minutes: b.dur <= 240 ? b.dur : undefined, steps: splitTask(b.title).map((text) => ({ id: uid(), text, done: false })), done: false, later: false, createdAt: Date.now() }, ...s.tasks] }));
      setDay((d) => ({ ...d, blocks: d.blocks.map((x) => (x.id === b.id ? { ...x, taskId } : x)) }));
    }
    go(`/tarefas?foco=${id}`);
  };

  // Linhas do dia: blocos e trechos livres, em ordem.
  const linhas: ({ t: 'bloco'; b: Block } | { t: 'livre'; a: number; z: number })[] = [
    ...day.blocks.map((b) => ({ t: 'bloco' as const, b })),
    ...gaps(day.blocks, ws, we).map(([a, z]) => ({ t: 'livre' as const, a, z })),
  ].sort((x, y) => (x.t === 'bloco' ? x.b.start : x.a) - (y.t === 'bloco' ? y.b.start : y.a));
  const proximos = linhas.filter((l) => l.t === 'bloco' && l.b.start + l.b.dur > (isToday ? now : 0)).slice(0, 2);
  const mostrar = calm ? proximos : linhas;

  const [yy, mm, dd] = key.split('-').map(Number);
  const rotulo = new Date(yy, mm - 1, dd).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  return (
    <>
      <PageHead title="Meu dia em blocos" sub="Escreva o que tem para fazer e organize por tempo. É um mapa, não uma promessa: pode mudar quando quiser." onBack={() => back('/tarefas')} />

      <div className="mb-4">
        <p className="font-bold text-xl capitalize text-center mb-2">{isToday ? 'Hoje' : rotulo}</p>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setKey(addDays(key, -1))}>Dia anterior</Button>
          <Button className="flex-1" onClick={() => setKey(addDays(key, 1))}>Próximo dia</Button>
        </div>
      </div>
      <p role="status" className={msg ? 'mb-4 rounded-xl bg-soft p-3' : 'sr-only'}>{msg}</p>

      {!calm && (
        <>
          <section aria-label="Três prioridades" className="mb-5">
            <h2 className="text-xl font-bold mb-1">Até 3 prioridades</h2>
            <p className="text-muted mb-2">O que, se acontecer, já faz o dia valer. Pode deixar em branco.</p>
            <ul className="space-y-2">
              {day.priorities.map((p, i) => (
                <li key={i}><label className="flex items-center gap-3"><span className="font-bold w-6 text-center" aria-hidden="true">{i + 1}</span>
                  <input aria-label={`Prioridade ${i + 1}`} className={inputCls} maxLength={100} value={p} onChange={(e) => setDay((d) => ({ ...d, priorities: day.priorities.map((x, j) => (j === i ? e.target.value : x)) }))} /></label></li>
              ))}
            </ul>
          </section>

          <section aria-label="Despejo mental" className="mb-5">
            <h2 className="text-xl font-bold mb-1">Despejo mental</h2>
            <p className="text-muted mb-2">O que está na caixa de captura e nas suas tarefas. Para anotar mais, use a caixa.</p>
            {candidatos.filter((c) => c.tag !== 'Prioridade').length === 0
              ? <Note>Nada por aqui. Anote o que passa pela cabeça na caixa de captura e volte.</Note>
              : <ul className="flex flex-wrap gap-2">{candidatos.filter((c) => c.tag !== 'Prioridade').slice(0, 12).map((c) => <li key={c.t} className="rounded-xl border-2 border-line bg-surface px-3 py-2"><span className="text-sm text-muted">{c.tag}: </span>{c.t}</li>)}</ul>}
            <div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => go('/tarefas/caixa')}>Abrir a caixa de captura</Button></div>
          </section>

          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <Button kind="action" onClick={sugerir}>Sugerir meu dia</Button>
            {day.blocks.length > 0 && <Button onClick={() => { setDay((d) => ({ ...d, blocks: [] })); setMsg('O dia foi limpo. Dá para recomeçar quando quiser.'); }}>Limpar o dia</Button>}
          </div>
        </>
      )}

      {calm && <Note>Modo calmo: mostrando só o agora e o próximo. {proximos.length === 0 ? 'Não há blocos à frente.' : ''}</Note>}

      <section aria-label="Horários do dia" className="mt-3">
        <h2 className="text-xl font-bold mb-2">Horários</h2>
        <ul className="space-y-2">
          {mostrar.map((l) => {
            if (l.t === 'livre') {
              return (
                <li key={`g${l.a}`} className="rounded-xl border-2 border-dashed border-line px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted">{hhmm(l.a)} às {hhmm(l.z)} · livre ({durLabel(l.z - l.a)})</span>
                  <Button onClick={() => setPanel({ start: l.a, max: l.z - l.a })}>Colocar algo</Button>
                </li>
              );
            }
            const b = l.b;
            const agora = isToday && now >= b.start && now < b.start + b.dur;
            return (
              <Card as="li" key={b.id} className={b.kind === 'pausa' ? 'bg-soft border-soft' : ''}>
                <p className="text-sm text-muted">{hhmm(b.start)} às {hhmm(b.start + b.dur)} · {durLabel(b.dur)}{agora ? ' · agora' : ''}</p>
                <p className={`font-bold text-lg ${b.done ? 'line-through decoration-1 text-muted' : ''}`}>{b.title}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {b.kind === 'tarefa' && !b.done && <Button kind="action" onClick={() => comecar(b)}>Começar</Button>}
                  <Button onClick={() => setPanel({ id: b.id, start: b.start, max: 480 })}>Mudar</Button>
                  <Button kind="ghost" aria-pressed={!!b.done} onClick={() => setDay((d) => ({ ...d, blocks: d.blocks.map((x) => (x.id === b.id ? { ...x, done: !x.done } : x)) }))}>{b.done ? 'Desfazer' : 'Feito'}</Button>
                </div>
              </Card>
            );
          })}
        </ul>
        {calm && <div className="mt-3"><Button onClick={() => setShowAll(true)}>Ver o dia inteiro</Button></div>}
      </section>

      {panel && (
        <Painel
          key={`${panel.id ?? 'novo'}-${panel.start}`}
          inicial={panel.id ? day.blocks.find((b) => b.id === panel.id) : undefined}
          start={panel.start} max={panel.max} ws={ws} we={we} candidatos={candidatos.map((c) => c.t)}
          existentes={day.blocks}
          onCancel={() => setPanel(null)}
          onRemove={panel.id ? () => { setDay((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== panel.id) })); setPanel(null); setMsg('Tirei do dia. Nada se perde: a tarefa continua na sua lista.'); } : undefined}
          onSave={(b) => { setDay((d) => ({ ...d, blocks: panel.id ? d.blocks.map((x) => (x.id === panel.id ? { ...x, ...b } : x)) : [...d.blocks, { ...b, id: uid() }] })); setPanel(null); }}
        />
      )}

      <details className="mt-8">
        <summary className="tap cursor-pointer font-semibold flex items-center">Janela do dia ({win.start}h às {win.end}h)</summary>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Field label="Começa às"><select className={inputCls} value={win.start} onChange={(e) => update((s) => ({ ...s, agendaWin: { ...s.agendaWin, start: Math.min(Number(e.target.value), s.agendaWin.end - 1) } }))}>{Array.from({ length: 20 }, (_, h) => h + 3).map((h) => <option key={h} value={h}>{h}h</option>)}</select></Field>
          <Field label="Termina às"><select className={inputCls} value={win.end} onChange={(e) => update((s) => ({ ...s, agendaWin: { ...s.agendaWin, end: Math.max(Number(e.target.value), s.agendaWin.start + 1) } }))}>{Array.from({ length: 21 }, (_, h) => h + 4).map((h) => <option key={h} value={h}>{h}h</option>)}</select></Field>
        </div>
      </details>
    </>
  );
}

function Painel({ inicial, start, max, ws, we, candidatos, existentes, onSave, onCancel, onRemove }: {
  inicial?: Block; start: number; max: number; ws: number; we: number; candidatos: string[]; existentes: Block[];
  onSave: (b: Omit<Block, 'id'>) => void; onCancel: () => void; onRemove?: () => void;
}) {
  const [title, setTitle] = useState(inicial?.title ?? '');
  const [ini, setIni] = useState(inicial?.start ?? start);
  const [dur, setDur] = useState(inicial?.dur ?? 30);
  const [kind, setKind] = useState<'tarefa' | 'pausa'>(inicial?.kind ?? 'tarefa');
  const [erro, setErro] = useState('');
  const opts: number[] = [];
  for (let m = Math.ceil(ws / 30) * 30; m < we; m += 30) opts.push(m);
  if (!opts.includes(ini)) opts.push(ini);
  opts.sort((a, b) => a - b);
  void max;

  const salvar = () => {
    if (!title.trim()) { setErro('Escreva o que vai neste bloco.'); return; }
    if (ini + dur > we) { setErro('Esse bloco passa do fim do dia. Escolha um horário mais cedo ou um tempo menor.'); return; }
    if (overlaps(existentes, ini, dur, inicial?.id)) { setErro('Esse horário já tem algo. Escolha outro horário ou um tempo menor.'); return; }
    onSave({ title: title.trim(), start: ini, dur, kind, taskId: inicial?.taskId, done: inicial?.done });
  };

  return (
    <Card className="mt-4 border-brand">
      <h2 className="font-bold text-lg mb-2">{inicial ? 'Mudar este bloco' : 'Colocar algo no dia'}</h2>
      {erro && <p role="alert" className="mb-3 rounded-xl bg-warm p-3">{erro}</p>}
      <div className="space-y-3">
        <Field label="O que vai aqui?"><input autoFocus className={inputCls} value={title} maxLength={120} onChange={(e) => { setTitle(e.target.value); setErro(''); }} /></Field>
        {candidatos.length > 0 && !inicial && (
          <div><p className="text-sm text-muted mb-1">Ou escolha da sua lista:</p>
            <div className="flex flex-wrap gap-2">{candidatos.slice(0, 8).map((c) => <button key={c} type="button" onClick={() => { setTitle(c); setKind('tarefa'); }} className="tap rounded-xl border-2 border-line bg-surface px-3 py-1 text-left hover:border-brand">{c}</button>)}
              <button type="button" onClick={() => { setTitle('Pausa'); setKind('pausa'); setDur(15); }} className="tap rounded-xl border-2 border-dashed border-line px-3 py-1 hover:border-brand">Uma pausa</button></div></div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Começa às"><select className={inputCls} value={ini} onChange={(e) => { setIni(Number(e.target.value)); setErro(''); }}>{opts.map((m) => <option key={m} value={m}>{hhmm(m)}</option>)}</select></Field>
          <Field label="Quanto tempo"><select className={inputCls} value={dur} onChange={(e) => { setDur(Number(e.target.value)); setErro(''); }}>{DURS.map((d) => <option key={d} value={d}>{durLabel(d)}</option>)}</select></Field>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button kind="action" onClick={salvar}>{inicial ? 'Salvar' : 'Colocar no dia'}</Button>
        <Button onClick={onCancel}>Cancelar</Button>
        {onRemove && <Button onClick={onRemove}>Tirar do dia</Button>}
      </div>
    </Card>
  );
}
