import { useStore } from '../store';
import { back, go } from '../router';
import { Button, Card, Copy, PageHead } from '../ui';
import { CrisisBox } from './Plan';

/** Versão simplificada do plano: poucos blocos, texto grande, tudo numa coluna. */
export function SupportNow() {
  const { state } = useStore();
  const p = state.plan;
  const empty = !p.helps.length && !p.contacts.length && !p.minimum.length && !p.phrases.length;

  return (
    <>
      <PageHead title="Você não está sozinho/a" sub="Uma coisa de cada vez. Respire se puder." onBack={() => back('/')} />
      <div className="space-y-5 text-lg">
        {empty && (
          <Card>
            <p className="font-semibold">Seu plano ainda está vazio.</p>
            <p className="mt-1">Por enquanto: reduza luz e som, beba água e fique num lugar seguro. Se puder, avise alguém de confiança.</p>
            <div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => go('/plano')}>Montar meu plano depois</Button><Button onClick={() => go('/regulacao/descompressao')}>Pausa guiada de 5 minutos</Button></div>
          </Card>
        )}
        {p.helps.length > 0 && <Block title="O que costuma me ajudar" items={p.helps} />}
        {p.contacts.length > 0 && (
          <section aria-label="Pessoas de confiança">
            <h2 className="text-xl font-bold mb-2">Quem posso chamar</h2>
            <ul className="space-y-2">
              {p.contacts.map((c) => (
                <Card as="li" key={c.id}>
                  <p className="font-bold">{c.name || 'Sem nome'}</p>
                  {c.how && <p className="text-muted">Prefiro: {c.how}</p>}
                  {c.phone && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a className="tap inline-flex items-center rounded-xl border-2 border-line bg-surface px-4 font-semibold" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>Ligar</a>
                      <a className="tap inline-flex items-center rounded-xl border-2 border-line bg-surface px-4 font-semibold" href={`sms:${c.phone.replace(/[^\d+]/g, '')}`}>Mensagem</a>
                    </div>
                  )}
                </Card>
              ))}
            </ul>
          </section>
        )}
        {p.phrases.length > 0 && (
          <section aria-label="Frases prontas">
            <h2 className="text-xl font-bold mb-2">Frases prontas</h2>
            <ul className="space-y-2">{p.phrases.map((f, i) => <Card as="li" key={i}><p>{f}</p><div className="mt-2"><Copy text={f} label="Copiar" /></div></Card>)}</ul>
          </section>
        )}
        {p.minimum.length > 0 && <Block title="O mínimo para hoje" items={p.minimum} />}
        <CrisisBox />
        <div className="flex flex-wrap gap-2"><Button onClick={() => go('/plano')}>Editar meu plano</Button><Button onClick={() => go('/')}>Voltar ao início</Button></div>
      </div>
    </>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <section aria-label={title}>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <ul className="space-y-2">{items.map((t, i) => <Card as="li" key={i}>{t}</Card>)}</ul>
    </section>
  );
}
