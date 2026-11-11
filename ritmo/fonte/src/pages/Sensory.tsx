import { useState } from 'react';
import { useStore, uid } from '../store';
import { back } from '../router';
import { Button, Card, Choice, ConfirmButton, Field, inputCls, MultiChoice, Note, PageHead } from '../ui';
import type { Env, Overload, SensoryEntry } from '../types';

const ENVS: { v: Env; label: string }[] = [
  { v: 'casa', label: 'Casa' }, { v: 'trabalho', label: 'Trabalho' }, { v: 'estudo', label: 'Estudo' },
  { v: 'transporte', label: 'Transporte' }, { v: 'social', label: 'Social' }, { v: 'outro', label: 'Outro' },
];
const STIMULI = ['Ruído', 'Luz', 'Multidão', 'Cheiro', 'Textura', 'Movimento', 'Calor/frio'];
const HELPED = ['Fones', 'Óculos escuros', 'Silêncio', 'Pausa', 'Movimento', 'Objeto preferido'];
const LEVEL: Record<Overload, string> = { nenhuma: 'nenhuma', leve: 'leve', moderada: 'moderada', alta: 'alta' };
const envLabel = (e: Env) => ENVS.find((x) => x.v === e)?.label ?? e;
const DAY = 86_400_000;

/** Junta nomes em português: "a, b e c". */
const join = (a: string[]) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} e ${a[a.length - 1]}`);
const lower = (s: string) => s.toLowerCase();
const count = (xs: string[]) => {
  const m = new Map<string, number>();
  xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export function summarize(entries: SensoryEntry[], now = Date.now()) {
  const week = entries.filter((e) => e.at >= now - 7 * DAY);
  if (week.length < 3) return { week: week.length, lines: [] as string[] };
  const lines: string[] = [];
  let heavy = week.filter((e) => e.level === 'alta');
  let word = 'alta';
  if (heavy.length < 2) { heavy = week.filter((e) => e.level === 'alta' || e.level === 'moderada'); word = 'moderada ou alta'; }
  if (heavy.length >= 2) {
    const top = count(heavy.flatMap((e) => e.stimuli)).filter(([, n]) => n >= 2).slice(0, 2).map(([s]) => lower(s));
    if (top.length) lines.push(`Nos últimos 7 dias, ${join(top)} ${top.length > 1 ? 'apareceram' : 'apareceu'} mais vezes junto com sobrecarga ${word}.`);
    const env = count(heavy.map((e) => e.env))[0];
    if (env && env[1] >= 2) lines.push(`Os momentos mais pesados aconteceram mais em: ${lower(envLabel(env[0] as Env))}.`);
  }
  const help = count(week.flatMap((e) => e.helped)).slice(0, 3).map(([h]) => lower(h));
  if (help.length) lines.push(`O que mais apareceu como ajuda: ${join(help)}.`);
  return { week: week.length, lines };
}

export function Sensory() {
  const { state, update } = useStore();
  const [open, setOpen] = useState(false);
  const entries = [...state.sensory].sort((a, b) => b.at - a.at);
  const sum = summarize(state.sensory);

  if (open) return <Form onDone={() => setOpen(false)} />;

  return (
    <>
      <PageHead title="Registro sensorial" sub="Anotar ajuda a ver padrões sem depender da memória." onBack={() => back('/regulacao')} />
      <Button kind="primary" big block icon="plus" onClick={() => setOpen(true)}>Novo registro</Button>

      <section className="mt-6" aria-labelledby="h-padroes">
        <h2 id="h-padroes" className="text-xl font-bold mb-2">Padrões da semana</h2>
        {sum.lines.length > 0 ? (
          <Card><ul className="space-y-2">{sum.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
            <p className="text-sm text-muted mt-3">Isso mostra o que apareceu junto, não o que causou. É um ponto de partida para você, ou para conversar com sua terapeuta.</p></Card>
        ) : (
          <Note>{sum.week} registro(s) nos últimos 7 dias. Com pelo menos 3 registros, o Ritmo mostra o que aparece com mais frequência.</Note>
        )}
      </section>

      {entries.length > 0 && (
        <section className="mt-8" aria-labelledby="h-reg">
          <h2 id="h-reg" className="text-xl font-bold mb-2">Registros</h2>
          <ul className="space-y-3">
            {entries.slice(0, 15).map((e) => (
              <Card as="li" key={e.id}>
                <p className="font-bold">{envLabel(e.env)} · sobrecarga {LEVEL[e.level]}{e.example ? ' · exemplo' : ''}</p>
                <p className="text-sm text-muted">{new Date(e.at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                {e.stimuli.length > 0 && <p>Estímulos: {e.stimuli.join(', ')}</p>}
                {e.helped.length > 0 && <p>Ajudou: {e.helped.join(', ')}</p>}
                {e.note && <p className="text-muted">“{e.note}”</p>}
                <div className="mt-2"><ConfirmButton label="Excluir" onConfirm={() => update((s) => ({ ...s, sensory: s.sensory.filter((x) => x.id !== e.id) }))} /></div>
              </Card>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Form({ onDone }: { onDone: () => void }) {
  const { update } = useStore();
  const [env, setEnv] = useState<Env>();
  const [stimuli, setStimuli] = useState<string[]>([]);
  const [level, setLevel] = useState<Overload>();
  const [helped, setHelped] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [note, setNote] = useState('');

  const save = () => {
    const extra = other.trim();
    update((s) => ({
      ...s,
      sensory: [...s.sensory, { id: uid(), at: Date.now(), env: env ?? 'outro', stimuli, level: level ?? 'nenhuma', helped: extra ? [...helped, extra] : helped, note: note.trim() || undefined }].slice(-500),
    }));
    onDone();
  };

  return (
    <>
      <PageHead title="Novo registro" sub="Preencha só o que quiser. Pode salvar a qualquer momento." onBack={onDone} />
      <div className="space-y-6">
        <Choice legend="Onde você está?" value={env} onChange={setEnv} cols={3} options={ENVS} />
        <MultiChoice legend="O que está pesando? (pode marcar vários)" selected={stimuli} options={STIMULI} onChange={setStimuli} />
        <Choice legend="Nível de sobrecarga" value={level} onChange={setLevel} cols={4} options={[{ v: 'nenhuma', label: 'Nenhuma' }, { v: 'leve', label: 'Leve' }, { v: 'moderada', label: 'Moderada' }, { v: 'alta', label: 'Alta' }]} />
        <MultiChoice legend="O que ajudou?" selected={helped} options={HELPED} onChange={setHelped} />
        <Field label="Outra coisa que ajudou (opcional)"><input className={inputCls} value={other} maxLength={60} onChange={(e) => setOther(e.target.value)} /></Field>
        <Field label="Anotação (opcional)"><textarea className={inputCls} rows={2} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} /></Field>
        <div className="flex flex-wrap gap-2"><Button kind="primary" big onClick={save}>Salvar registro</Button><Button onClick={onDone}>Cancelar</Button></div>
      </div>
    </>
  );
}
