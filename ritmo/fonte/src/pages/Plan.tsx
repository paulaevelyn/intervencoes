import { useStore, uid } from '../store';
import { back, go } from '../router';
import { Button, Card, Field, inputCls, Note, PageHead, TextList } from '../ui';
import type { Plan as PlanT } from '../types';

export const PLAN_IDEAS = {
  signals: ['Fico mais irritável ou choro com facilidade', 'Barulhos que eu tolerava começam a doer', 'Dificuldade de falar ou de achar palavras', 'Mais movimentos repetitivos ou rigidez', 'Evito mensagens e pessoas', 'Sono ou fome desregulados'],
  helps: ['Fones e silêncio', 'Luz baixa', 'Cobertor pesado', 'Água e comida simples', 'Objeto preferido', 'Estar sozinho/a por um tempo'],
  phrases: ['Estou com sobrecarga e preciso de uma pausa.', 'Hoje está difícil. Pode ficar por perto sem conversar?', 'Pode me mandar por escrito?'],
  reduce: ['Responder mensagens não urgentes', 'Compromissos sociais', 'Tarefas domésticas além do básico', 'Reuniões que podem virar texto'],
  minimum: ['Beber água', 'Comer algo simples', 'Tomar meus remédios, se uso', 'Higiene mínima', 'Dormir ou deitar no escuro'],
};

export function Plan() {
  const { state, update } = useStore();
  const plan = state.plan;
  const set = <K extends keyof PlanT>(k: K, v: PlanT[K]) => update((s) => ({ ...s, plan: { ...s.plan, [k]: v } }));

  return (
    <>
      <PageHead title="Meu plano de apoio" sub="Escreva com calma, num dia mais leve. Nos dias difíceis, ele já estará pronto." onBack={() => back('/regulacao')} />
      <Note>Este plano fica neste aparelho. Só vai para um servidor se você entrar numa conta, e nunca aparece para a profissional. Quem usa o seu celular desbloqueado pode ver. Se precisar, o botão “Preciso de apoio agora” abre uma versão simples.</Note>
      <div className="mt-5 mb-6"><Button kind="primary" icon="heart" onClick={() => go('/apoio-agora')}>Ver versão simplificada</Button></div>

      <div className="space-y-8">
        <Sec title="Sinais de que estou entrando em sobrecarga"><TextList items={plan.signals} onChange={(v) => set('signals', v)} addLabel="Novo sinal" placeholder="Um sinal que noto em mim" ideas={PLAN_IDEAS.signals} /></Sec>
        <Sec title="O que costuma me ajudar"><TextList items={plan.helps} onChange={(v) => set('helps', v)} addLabel="Algo que ajuda" placeholder="Algo que me ajuda" ideas={PLAN_IDEAS.helps} /></Sec>

        <Sec title="Pessoas de confiança">
          <ul className="space-y-3 mb-3">
            {plan.contacts.map((c) => (
              <Card as="li" key={c.id} className="space-y-2">
                <Field label="Nome"><input className={inputCls} value={c.name} onChange={(e) => set('contacts', plan.contacts.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))} /></Field>
                <Field label="Como prefiro ser contatado/a" hint="Ex.: mensagem de texto, sem ligação"><input className={inputCls} value={c.how} onChange={(e) => set('contacts', plan.contacts.map((x) => (x.id === c.id ? { ...x, how: e.target.value } : x)))} /></Field>
                <Field label="Telefone (opcional)"><input type="tel" inputMode="tel" className={inputCls} value={c.phone ?? ''} onChange={(e) => set('contacts', plan.contacts.map((x) => (x.id === c.id ? { ...x, phone: e.target.value } : x)))} /></Field>
                <Button onClick={() => set('contacts', plan.contacts.filter((x) => x.id !== c.id))}>Remover pessoa</Button>
              </Card>
            ))}
          </ul>
          <Button icon="plus" onClick={() => set('contacts', [...plan.contacts, { id: uid(), name: '', how: '' }])}>Adicionar pessoa</Button>
        </Sec>

        <Sec title="Frases prontas para pedir apoio"><TextList items={plan.phrases} onChange={(v) => set('phrases', v)} addLabel="Nova frase" placeholder="Uma frase que facilita" ideas={PLAN_IDEAS.phrases} /></Sec>
        <Sec title="Demandas que posso reduzir temporariamente"><TextList items={plan.reduce} onChange={(v) => set('reduce', v)} addLabel="Nova demanda" placeholder="O que posso reduzir" ideas={PLAN_IDEAS.reduce} /></Sec>
        <Sec title="Plano mínimo de autocuidado para dias difíceis"><TextList items={plan.minimum} onChange={(v) => set('minimum', v)} addLabel="Novo item" placeholder="O mínimo que já basta" ideas={PLAN_IDEAS.minimum} /></Sec>
      </div>

      <div className="mt-8"><CrisisBox /></div>
    </>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function CrisisBox() {
  return (
    <Card className="bg-warm">
      <h2 className="font-bold text-lg mb-1">Se você estiver em risco ou pensando em se machucar</h2>
      <p className="mb-3">Procure ajuda agora. Você não precisa passar por isso sozinho/a.</p>
      <div className="flex flex-wrap gap-2">
        <a className="tap inline-flex items-center rounded-xl border-2 border-brand bg-brand text-brand-ink px-4 font-bold" href="tel:188">Ligar 188 (CVV, 24h)</a>
        <a className="tap inline-flex items-center rounded-xl border-2 border-line bg-surface px-4 font-bold" href="tel:192">Ligar 192 (SAMU)</a>
      </div>
    </Card>
  );
}
