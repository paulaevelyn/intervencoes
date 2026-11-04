import { useState } from 'react';
import { useStore, uid } from '../store';
import { back, go } from '../router';
import { Button, Card, Choice, Field, inputCls, Note, PageHead } from '../ui';
import { planejarLocal, type Plano } from '../data/planner';
import { splitTask } from '../data/split';
import { iaLigada, iaPlanejar, iaTemConta } from '../ia';
import type { Level3 } from '../types';
import { CrisisBox } from './Plan';

const TEMPOS = [{ v: 30, label: '30 min' }, { v: 60, label: '1 hora' }, { v: 120, label: '2 horas' }, { v: 240, label: 'Quase o dia todo' }];

export function Planner() {
  const { state, update } = useStore();
  const last = [...state.checkins].reverse().find((c) => c.energy)?.energy;
  const [texto, setTexto] = useState('');
  const [energia, setEnergia] = useState<Level3>(last ?? 'media');
  const [minutos, setMinutos] = useState(60);
  const [plano, setPlano] = useState<Plano | null>(null);
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState('');
  const [crise, setCrise] = useState(false);
  const [feito, setFeito] = useState(false);
  const ia = iaLigada(state.settings);
  const pode = texto.trim().length > 1;

  const regras = () => { setPlano(planejarLocal(texto, energia, minutos, state.profile)); setFeito(false); };
  const comIA = async () => {
    setBusy(true); setAviso(''); setCrise(false);
    const r = await iaPlanejar(state.settings, state.profile, texto, energia, minutos);
    setBusy(false);
    if (r.ok) { setPlano(r.data); setFeito(false); return; }
    setAviso(r.mensagem);
    if (r.motivo === 'crise') setCrise(true); else regras();
  };

  const adicionar = () => {
    if (!plano) return;
    const agora = plano.blocos.filter((b) => b.tipo === 'tarefa').map((b) => ({
      id: uid(), title: b.titulo, minutes: b.minutos, done: false, later: false, createdAt: Date.now(),
      steps: (b.passos?.length ? b.passos : splitTask(b.titulo)).map((text) => ({ id: uid(), text, done: false })),
    }));
    const depois = plano.depois.map((t) => ({ id: uid(), title: t, steps: [], done: false, later: true, createdAt: Date.now() }));
    update((s) => ({ ...s, tasks: [...agora, ...depois, ...s.tasks] }));
    setFeito(true);
  };

  if (plano) {
    return (
      <>
        <PageHead title="Seu plano" sub={plano.fonte === 'ia' ? 'Montado com ajuda de IA. Ajuste do jeito que fizer sentido.' : 'Montado pelo Ritmo, sem IA. Ajuste do jeito que fizer sentido.'} onBack={() => setPlano(null)} />
        {aviso && <p role="status" className="mb-3 rounded-xl bg-warm p-3">{aviso}</p>}
        {plano.blocos.length === 0 && <Note>Escreva suas tarefas para eu montar o plano.</Note>}
        <ol className="space-y-3">
          {plano.blocos.map((b, i) => (
            <Card as="li" key={i} className={b.tipo === 'pausa' ? 'bg-soft border-soft' : ''}>
              <p className="font-bold text-lg">{b.tipo === 'pausa' ? '⏸ ' : ''}{b.titulo}</p>
              <p className="text-muted">{b.minutos} min</p>
              {b.nota && <p className="mt-1">{b.nota}</p>}
              {b.passos && b.passos.length > 0 && <ul className="list-disc pl-5 mt-1">{b.passos.map((p) => <li key={p}>{p}</li>)}</ul>}
            </Card>
          ))}
        </ol>
        {plano.depois.length > 0 && <Card className="mt-4"><h2 className="font-bold text-lg mb-1">Fica para depois, sem culpa</h2><ul className="list-disc pl-5">{plano.depois.map((d) => <li key={d}>{d}</li>)}</ul></Card>}
        {plano.dicas.length > 0 && <Card className="mt-4"><h2 className="font-bold text-lg mb-1">Para o seu jeito</h2><ul className="list-disc pl-5 space-y-1">{plano.dicas.map((d) => <li key={d}>{d}</li>)}</ul></Card>}
        <div className="mt-5 flex flex-wrap gap-2">
          {plano.blocos.some((b) => b.tipo === 'tarefa') && <Button kind="primary" big disabled={feito} onClick={adicionar}>{feito ? 'Adicionado às tarefas' : 'Adicionar às minhas tarefas'}</Button>}
          {feito && <Button onClick={() => go('/tarefas')}>Ver tarefas</Button>}
          <Button onClick={() => setPlano(null)}>Refazer</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Planejar o dia" sub="Despeje o que está na cabeça. Eu ajudo a ordenar, sem encher o seu dia." onBack={() => back('/tarefas')} />
      {aviso && <p role="alert" className="mb-3 rounded-xl bg-warm p-3">{aviso}</p>}
      {crise && <div className="mb-4"><CrisisBox /></div>}
      <div className="space-y-5">
        <Field label="O que está na sua cabeça?" hint="Uma coisa por linha. Pode ser bagunçado. Dá para colocar o tempo, como “estudar 30 min”."><textarea className={inputCls} rows={7} maxLength={3000} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={'responder e-mail da faculdade\nmarcar consulta\nlavar a louça'} /></Field>
        <Choice legend="Sua energia agora" value={energia} onChange={setEnergia} cols={3} options={[{ v: 'baixa', label: 'Baixa' }, { v: 'media', label: 'Média' }, { v: 'alta', label: 'Alta' }]} />
        <Choice legend="Tempo disponível" value={minutos} onChange={setMinutos} cols={4} options={TEMPOS} />
        <div className="flex flex-wrap gap-2">
          {ia && iaTemConta()
            ? <><Button kind="primary" big disabled={!pode || busy} onClick={comIA}>{busy ? 'Pensando…' : 'Montar com ajuda de IA'}</Button><Button disabled={!pode || busy} onClick={regras}>Montar sem IA</Button></>
            : <Button kind="primary" big disabled={!pode} onClick={regras}>Montar plano</Button>}
        </div>
        {ia && !iaTemConta() && <p className="text-sm text-muted">A IA está ligada, mas precisa de uma conta. Entre pelo botão no canto superior direito.</p>}
        {!ia && <p className="text-sm text-muted">Quer ajuda de IA para ordenar e dividir? Ligue em Mais → Ajustes → Ajuda de IA.</p>}
      </div>
    </>
  );
}
