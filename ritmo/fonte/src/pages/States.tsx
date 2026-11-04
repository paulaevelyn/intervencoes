import { useState } from 'react';
import { useStore, uid } from '../store';
import { back, go, useRoute } from '../router';
import { Button, Card, Choice, Copy, Listen, MultiChoice, Note, PageHead, TextList, Field, inputCls } from '../ui';
import { estadoById } from '../data/estados';
import { BARREIRAS, CONTEXTOS, EMOCOES, SENSACOES, estadosOrdenados, guiaDoMomento, type Guia } from '../data/sensacoes';
import { practiceById } from '../data/library';
import { iaEntender, iaLigada, iaTemConta } from '../ia';
import { CrisisBox } from './Plan';

export function States() {
  const { parts } = useRoute();
  const id = parts[1];
  const e = id ? estadoById(id) : undefined;
  return e ? <Detail id={e.id} /> : <List />;
}

function List() {
  const { state } = useStore();
  const ordered = estadosOrdenados(state.profile.traits);
  const log = [...state.stateLog].sort((a, b) => b.at - a.at).slice(0, 5);
  return (
    <>
      <PageHead title="Meus estados" sub="Reconhecer o que está acontecendo e o que fazer com isso." onBack={() => back('/mais')} />
      <Button kind="primary" big block onClick={() => go('/entender')}>Não sei o que estou sentindo</Button>

      <h2 className="text-xl font-bold mt-7 mb-2">Estados comuns</h2>
      <ul className="space-y-3">
        {ordered.map((e) => (
          <li key={e.id}>
            <a href={`#/estados/${e.id}`} className="block">
              <Card as="div" className="hover:border-brand"><h3 className="font-bold text-lg">{e.label}</h3><p className="text-muted">{e.short}</p></Card>
            </a>
          </li>
        ))}
      </ul>

      <details className="mt-7">
        <summary className="tap cursor-pointer font-bold text-xl flex items-center">Vocabulário de emoções</summary>
        <p className="text-muted my-2">Como cada emoção costuma aparecer no corpo e do que ela pode precisar. São pistas, não regras.</p>
        <ul className="space-y-2">{EMOCOES.map((m) => <Card as="li" key={m.id}><p className="font-bold">{m.label}</p><p>No corpo: {m.corpo}.</p><p className="text-muted">Pode precisar de: {m.precisa}.</p></Card>)}</ul>
      </details>

      {log.length > 0 && (
        <section className="mt-7" aria-labelledby="h-log">
          <h2 id="h-log" className="text-xl font-bold mb-2">Registros recentes</h2>
          <ul className="space-y-2">
            {log.map((l) => (
              <Card as="li" key={l.id}>
                <p className="font-bold">{l.state ? estadoById(l.state)?.label : 'Sem nome ainda'}</p>
                <p className="text-sm text-muted">{new Date(l.at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                {l.sensations.length > 0 && <p>Corpo: {l.sensations.map((s) => SENSACOES.find((x) => x.id === s)?.label ?? s).join('; ')}</p>}
              </Card>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Sec({ title, items, open }: { title: string; items: string[]; open?: boolean }) {
  return (
    <details open={open} className="rounded-2xl border-2 border-line bg-surface p-4">
      <summary className="tap cursor-pointer font-bold text-lg flex items-center">{title}</summary>
      <ul className="list-disc pl-5 space-y-1 mt-2">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </details>
  );
}

function Detail({ id }: { id: string }) {
  const { state, update } = useStore();
  const e = estadoById(id)!;
  const notes = state.stateNotes[id] ?? { signs: [], helps: [] };
  const [done, setDone] = useState(false);
  const setNotes = (p: Partial<typeof notes>) => update((s) => ({ ...s, stateNotes: { ...s.stateNotes, [id]: { ...notes, ...p } } }));
  const falar = `${e.label}. ${e.oQue} O que fazer agora: ${e.agora.join(' ')}`;
  return (
    <>
      <PageHead title={e.label} sub={e.short} onBack={() => back('/estados')} />
      <Card className="mb-4"><p className="text-lg">{e.oQue}</p><div className="mt-3"><Listen text={falar} /></div></Card>
      <div className="space-y-3">
        <Sec title="Como costuma aparecer" items={e.sinais} />
        <Sec title="O que fazer agora" items={e.agora} open />
        <Sec title="O que evitar agora" items={e.evitar} />
        <Sec title="Depois, para se recuperar" items={e.depois} />
        <Sec title="Quando parar" items={e.parar} />
      </div>
      <Card className="mt-4 bg-soft border-soft"><p className="font-bold mb-1">Uma frase de compaixão</p><p className="text-lg">{e.compaixao}</p></Card>
      <p className="mt-4">{e.ajuda}</p>

      <section className="mt-6 space-y-4" aria-label="Meu jeito de viver isso">
        <h2 className="text-xl font-bold">Meu jeito de viver isso</h2>
        <div><p className="font-semibold mb-1">Os sinais que eu percebo em mim</p><TextList items={notes.signs} onChange={(v) => setNotes({ signs: v })} addLabel="Novo sinal" placeholder="Um sinal que é meu" /></div>
        <div><p className="font-semibold mb-1">O que me ajuda quando é isso</p><TextList items={notes.helps} onChange={(v) => setNotes({ helps: v })} addLabel="Algo que ajuda" placeholder="Algo que me ajuda" /></div>
      </section>

      <section className="mt-6" aria-label="Práticas relacionadas">
        <h2 className="text-xl font-bold mb-2">Práticas que podem ajudar</h2>
        <div className="flex flex-wrap gap-2">{e.praticas.map((p) => <Button key={p} onClick={() => go(`/regulacao/${p}`)}>{practiceById(p)?.title}</Button>)}</div>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button kind="primary" disabled={done} onClick={() => { update((s) => ({ ...s, stateLog: [...s.stateLog, { id: uid(), at: Date.now(), state: id, sensations: [], context: [] }].slice(-300) })); setDone(true); }}>{done ? 'Registrado' : 'Estou assim agora'}</Button>
      </div>
      {id === 'meltdown' || id === 'shutdown' ? <div className="mt-6"><CrisisBox /></div> : null}
    </>
  );
}

/* ---------- "Entender o momento" ---------- */
export function Understand() {
  const { state, update } = useStore();
  const [step, setStep] = useState(0);
  const [sens, setSens] = useState<string[]>([]);
  const [ctx, setCtx] = useState<string[]>([]);
  const [objetivo, setObjetivo] = useState('');
  const [barreira, setBarreira] = useState<string>();
  const [guia, setGuia] = useState<Guia | null>(null);
  const [texto, setTexto] = useState('');
  const [modoTexto, setModoTexto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState('');
  const [salvo, setSalvo] = useState(false);
  const ia = iaLigada(state.settings);

  const porRegras = () => { setGuia(guiaDoMomento({ sens, ctx, objetivo, barreira, profile: state.profile })); setSalvo(false); };
  const porIA = async () => {
    setBusy(true); setAviso('');
    const r = await iaEntender(state.settings, state.profile, texto);
    setBusy(false);
    if (r.ok) { setGuia(r.data); setSalvo(false); return; }
    setAviso(r.mensagem);
    if (r.motivo !== 'crise') { setModoTexto(false); setStep(0); }
  };

  if (guia) {
    return (
      <>
        <PageHead title="O que pode estar acontecendo" sub="São hipóteses para você pensar, não diagnósticos. Você é quem melhor sabe." onBack={() => { setGuia(null); setStep(0); }} />
        <GuiaView g={guia} />
        <div className="mt-6 flex flex-wrap gap-2">
          <Button kind="primary" disabled={salvo} onClick={() => { update((s) => ({ ...s, stateLog: [...s.stateLog, { id: uid(), at: Date.now(), state: guia.principal?.id, sensations: sens, context: ctx }].slice(-300) })); setSalvo(true); }}>{salvo ? 'Registrado' : 'Salvar este registro'}</Button>
          <Button onClick={() => { setGuia(null); setStep(0); setSens([]); setCtx([]); setObjetivo(''); setBarreira(undefined); setTexto(''); }}>Recomeçar</Button>
        </div>
      </>
    );
  }

  if (modoTexto) {
    return (
      <>
        <PageHead title="Contar com minhas palavras" sub="Escreva do seu jeito. A IA ajuda a traduzir o que você sente e o que fazer." onBack={() => setModoTexto(false)} />
        {aviso && <p role="alert" className="mb-3 rounded-xl bg-warm p-3">{aviso}</p>}
        <Field label="O que está acontecendo?" hint="Evite dados que identifiquem outras pessoas. O texto é enviado a um provedor de IA só para gerar a resposta."><textarea className={inputCls} rows={6} maxLength={2000} value={texto} onChange={(e) => setTexto(e.target.value)} /></Field>
        <div className="mt-4 flex flex-wrap gap-2"><Button kind="primary" big disabled={busy || texto.trim().length < 5} onClick={porIA}>{busy ? 'Pensando…' : 'Entender com IA'}</Button><Button onClick={() => setModoTexto(false)}>Prefiro escolher opções</Button></div>
        {aviso.includes('188') && <div className="mt-5"><CrisisBox /></div>}
      </>
    );
  }

  const next = () => (step < 2 ? setStep(step + 1) : porRegras());
  return (
    <>
      <PageHead title="Entender o momento" sub={`Passo ${step + 1} de 3. Responda só o que souber.`} onBack={() => (step === 0 ? back('/estados') : setStep(step - 1))} />
      {aviso && <p role="alert" className="mb-3 rounded-xl bg-warm p-3">{aviso}</p>}
      <div className="space-y-5">
        {step === 0 && <MultiChoice legend="Onde você sente isso no corpo?" selected={sens.map((s) => SENSACOES.find((x) => x.id === s)!.label)} options={SENSACOES.map((s) => s.label)} onChange={(ls) => setSens(ls.map((l) => SENSACOES.find((x) => x.label === l)!.id))} />}
        {step === 1 && <MultiChoice legend="O que está acontecendo ao redor?" selected={ctx.map((s) => CONTEXTOS.find((x) => x.id === s)!.label)} options={CONTEXTOS.map((s) => s.label)} onChange={(ls) => setCtx(ls.map((l) => CONTEXTOS.find((x) => x.label === l)!.id))} />}
        {step === 2 && (
          <>
            <Field label="Tem algo que você quer ou precisa fazer? (opcional)"><input className={inputCls} value={objetivo} maxLength={120} placeholder="Ex.: responder um e-mail" onChange={(e) => setObjetivo(e.target.value)} /></Field>
            {objetivo.trim() && <Choice legend="O que mais atrapalha?" value={barreira} onChange={setBarreira} options={BARREIRAS.map((b) => ({ v: b.id, label: b.label }))} />}
          </>
        )}
        <div className="flex flex-wrap gap-2">
          <Button kind="primary" big onClick={next}>{step < 2 ? 'Próximo' : 'Ver o que pode ajudar'}</Button>
          {step === 0 && ia && <Button onClick={() => { setAviso(''); setModoTexto(true); }} disabled={!iaTemConta()}>Prefiro contar com minhas palavras (IA)</Button>}
        </div>
        {step === 0 && ia && !iaTemConta() && <p className="text-sm text-muted">Para usar a IA, entre numa conta.</p>}
      </div>
    </>
  );
}

function GuiaView({ g }: { g: Guia }) {
  const falar = [g.principal ? `Pode ser ${g.principal.label}.` : '', g.precisa.join('. '), g.compaixao].join(' ');
  return (
    <div className="space-y-4">
      {g.poucasPistas ? <Note>Não deu para ter pistas só com isso, e tudo bem. Comece pela checagem do corpo.</Note> : (
        <Card>
          <h2 className="font-bold text-lg mb-2">Pode ser</h2>
          <ul className="space-y-2">{g.hipoteses.map((e) => <li key={e.id}><a className="font-semibold underline" href={`#/estados/${e.id}`}>{e.label}</a><span className="text-muted"> · {e.short}</span></li>)}</ul>
        </Card>
      )}
      {g.precisa.length > 0 && <Card><h2 className="font-bold text-lg mb-2">Do que você pode estar precisando</h2><ul className="list-disc pl-5 space-y-1">{g.precisa.map((x) => <li key={x}>{x}</li>)}</ul></Card>}
      {g.principal && <Card><h2 className="font-bold text-lg mb-2">O que fazer agora</h2><ul className="list-disc pl-5 space-y-1">{g.principal.agora.slice(0, 3).map((x) => <li key={x}>{x}</li>)}</ul></Card>}
      {g.comoFazer.length > 0 && <Card><h2 className="font-bold text-lg mb-2">Como fazer o que você quer</h2><ul className="space-y-1">{g.comoFazer.map((x) => <li key={x}>{x}</li>)}</ul></Card>}
      <Card>
        <h2 className="font-bold text-lg mb-2">Como se regular</h2>
        <div className="flex flex-wrap gap-2">{g.regular.map((id) => practiceById(id)).filter(Boolean).map((p) => <Button key={p!.id} onClick={() => go(`/regulacao/${p!.id}`)}>{p!.title}</Button>)}</div>
      </Card>
      {g.parar.length > 0 && <Card><h2 className="font-bold text-lg mb-2">Quando parar</h2><ul className="list-disc pl-5 space-y-1">{g.parar.map((x) => <li key={x}>{x}</li>)}</ul></Card>}
      <Card className="bg-soft border-soft"><h2 className="font-bold text-lg mb-1">Uma frase de compaixão</h2><p className="text-lg">{g.compaixao}</p><div className="mt-3 flex flex-wrap gap-2"><Copy text={g.compaixao} label="Copiar frase" /><Listen text={falar} label="Ouvir o resumo" /></div></Card>
      <p>{g.ajuda}</p>
      <CrisisBox />
    </div>
  );
}

