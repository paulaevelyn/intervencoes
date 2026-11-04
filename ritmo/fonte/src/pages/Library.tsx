import { useEffect, useRef, useState } from 'react';
import { go, useRoute } from '../router';
import { useStore } from '../store';
import { Button, Card, Copy, Note, PageHead } from '../ui';
import { GOALS, PRACTICES, practiceById, type GoalId, type Practice } from '../data/library';

export function Library() {
  const { parts, q } = useRoute();
  const id = parts[1];
  if (id) {
    const p = practiceById(id);
    if (p) return <PracticeView p={p} />;
  }
  const goal = q.get('meta') as GoalId | null;
  const current = GOALS.find((g) => g.id === goal);

  if (current) {
    const list = PRACTICES.filter((p) => p.goals.includes(current.id));
    return (
      <>
        <PageHead title={current.label} sub="Escolha uma. Cada uma leva de 1 a 5 minutos." onBack={() => go('/regulacao')} />
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id}>
              <a href={`#/regulacao/${p.id}`} className="block">
                <Card as="div" className="hover:border-brand">
                  <h2 className="font-bold text-lg">{p.title}</h2>
                  <p className="text-muted">{p.summary}</p>
                  <p className="mt-1 text-sm font-semibold">{p.minutes} min</p>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <PageHead title="Regulação" sub="Micropráticas de 1 a 5 minutos. Escolha o que combina com agora." />
      <ul className="space-y-3">
        {GOALS.map((g) => (
          <li key={g.id}>
            <a href={`#/regulacao?meta=${g.id}`} className="tap block rounded-2xl border-2 border-line bg-surface px-5 py-4 hover:border-brand">
              <span className="block text-lg font-bold">{g.label}</span>
              <span className="block text-muted">{g.hint}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function PracticeView({ p }: { p: Practice }) {
  const goal = GOALS.find((g) => p.goals.includes(g.id));
  return (
    <>
      <PageHead title={p.title} sub={`${p.minutes} min · ${p.summary}`} onBack={() => (goal ? go(`/regulacao?meta=${goal.id}`) : go('/regulacao'))} />
      {p.kind === 'breathing' && <Breathing />}
      {p.kind === 'steps' && <StepPlayer steps={p.steps} />}
      {p.kind === 'checklist' && <Checklist items={p.items} />}
      {p.kind === 'text' && (
        <ul className="space-y-3">
          {p.lines.map((l, i) => (
            <Card as="li" key={i}>
              <p className="text-lg">{l}</p>
              {p.copyable && <div className="mt-2"><Copy text={l} label="Copiar" /></div>}
            </Card>
          ))}
        </ul>
      )}
      {p.note && <div className="mt-5"><Note>{p.note}</Note></div>}
      {p.kind === 'text' && p.link && <div className="mt-4"><Button onClick={() => go(p.link!.to)}>{p.link.label}</Button></div>}
      <div className="mt-6"><Button onClick={() => (goal ? go(`/regulacao?meta=${goal.id}`) : go('/regulacao'))}>Ver outras práticas</Button></div>
    </>
  );
}

function StepPlayer({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  const [all, setAll] = useState(false);
  if (all) {
    return (
      <>
        <ol className="space-y-3 list-decimal pl-6 text-lg">{steps.map((s, k) => <li key={k}>{s}</li>)}</ol>
        <div className="mt-4"><Button onClick={() => setAll(false)}>Ver um passo por vez</Button></div>
      </>
    );
  }
  const last = i === steps.length - 1;
  return (
    <>
      <Card className="py-8">
        <p className="text-sm text-muted mb-2">Passo {i + 1} de {steps.length}</p>
        <p className="text-xl font-semibold leading-snug">{steps[i]}</p>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        {!last ? <Button kind="primary" big onClick={() => setI(i + 1)}>Próximo</Button> : <p role="status" className="rounded-xl bg-soft p-3 w-full">Pronto. Fique com o que serviu e deixe o resto.</p>}
        {i > 0 && <Button onClick={() => setI(i - 1)}>Voltar</Button>}
        <Button kind="ghost" onClick={() => setAll(true)}>Ver todos os passos</Button>
      </div>
    </>
  );
}

function Checklist({ items }: { items: string[] }) {
  const [on, setOn] = useState<number[]>([]);
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i}>
          <label className="tap flex items-start gap-3 rounded-xl border-2 border-line bg-surface p-3 cursor-pointer">
            <input type="checkbox" className="w-6 h-6 mt-0.5 accent-[var(--brand)] shrink-0" checked={on.includes(i)} onChange={() => setOn(on.includes(i) ? on.filter((x) => x !== i) : [...on, i])} />
            <span>{it}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

const PACES = [
  { id: '46', label: 'Inspirar 4, soltar 6', inh: 4, exh: 6 },
  { id: '44', label: 'Inspirar 4, soltar 4', inh: 4, exh: 4 },
];
const CYCLES = 6;

function Breathing() {
  const { state } = useStore();
  const [pace, setPace] = useState(PACES[0]);
  const [hide, setHide] = useState(!state.settings.showCounts);
  const [run, setRun] = useState(false);
  const [t, setT] = useState(0); // segundos desde o início
  const timer = useRef<number>();
  const reduce = state.settings.lowStim || (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  const cycle = pace.inh + pace.exh;
  const finished = run && t >= cycle * CYCLES;
  useEffect(() => {
    if (!run) return;
    timer.current = window.setInterval(() => setT((v) => v + 1), 1000);
    return () => window.clearInterval(timer.current);
  }, [run]);
  useEffect(() => { if (finished) window.clearInterval(timer.current); }, [finished]);

  const inCycle = t % cycle;
  const inhaling = inCycle < pace.inh;
  const sec = inhaling ? pace.inh - inCycle : cycle - inCycle;
  const n = Math.min(CYCLES, Math.floor(t / cycle) + 1);

  if (!run || finished) {
    return (
      <div className="space-y-4">
        {finished && <p role="status" className="rounded-xl bg-soft p-3 text-lg">Terminou. Observe como seu corpo está agora, sem julgar.</p>}
        <fieldset>
          <legend className="font-semibold mb-2">Ritmo</legend>
          <div className="flex flex-wrap gap-2">{PACES.map((p) => <Button key={p.id} kind={p.id === pace.id ? 'primary' : 'secondary'} aria-pressed={p.id === pace.id} onClick={() => setPace(p)}>{p.label}</Button>)}</div>
        </fieldset>
        <label className="tap flex items-center gap-3"><input type="checkbox" className="w-6 h-6 accent-[var(--brand)]" checked={hide} onChange={(e) => setHide(e.target.checked)} /> Esconder os números</label>
        <Button kind="primary" big block onClick={() => { setT(0); setRun(true); }}>{finished ? 'Fazer de novo' : `Começar (${CYCLES} respirações)`}</Button>
      </div>
    );
  }

  const scale = inhaling ? 'breathe-grow' : 'breathe-shrink';
  return (
    <div className="text-center space-y-5">
      <div className="mx-auto w-48 h-48 flex items-center justify-center" aria-hidden="true">
        <div className="w-full h-full rounded-full bg-soft border-4 border-brand"
          style={reduce ? { transform: inhaling ? 'scale(1)' : 'scale(.6)' } : { animation: `${scale} ${inhaling ? pace.inh : pace.exh}s linear forwards`, transform: inhaling ? 'scale(1)' : 'scale(.6)' }} key={`${n}-${inhaling}`} />
      </div>
      <p className="text-3xl font-bold">{inhaling ? 'Inspire' : 'Solte o ar'}</p>
      {!hide && <p className="text-xl text-muted">{sec} · respiração {n} de {CYCLES}</p>}
      <Button onClick={() => { window.clearInterval(timer.current); setRun(false); }}>Parar</Button>
    </div>
  );
}
