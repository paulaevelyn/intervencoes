import { useState } from 'react';
import { useStore } from '../store';
import { back } from '../router';
import { Button, Card, Choice, MultiChoice, Note, PageHead, TextList } from '../ui';
import { TRAITS, suggestedSettings, traitInfo } from '../data/profile';
import type { TraitId } from '../types';

const IDEAS_VALUES = ['Cuidar da minha saúde', 'Ser uma pessoa presente para quem amo', 'Aprender coisas que me interessam', 'Ter autonomia e tranquilidade', 'Criar e terminar projetos'];
const IDEAS_WANTS = ['Dormir melhor', 'Começar tarefas sem tanta luta', 'Fazer pausas antes de chegar ao limite', 'Pedir ajuda quando precisar', 'Comer e beber água durante o dia'];

export function Profile({ onboarding, onDone }: { onboarding?: boolean; onDone?: () => void }) {
  const { state, update } = useStore();
  const p = state.profile;
  const [applied, setApplied] = useState('');
  const set = (patch: Partial<typeof p>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch, asked: true } }));
  const sug = suggestedSettings(p.traits, state.settings);

  const body = (
    <div className="space-y-7">
      <Note>Escolha só o que quiser. Isso não é diagnóstico e você não precisa de laudo. Serve para o Ritmo ajustar dicas e configurações ao seu jeito. Fica neste aparelho (e na sua conta, se você entrar), e você muda quando quiser.</Note>

      <MultiChoice legend="Como você se identifica? (pode marcar vários)" selected={p.traits.map((t) => traitInfo(t).label)} options={TRAITS.map((t) => t.label)}
        onChange={(labels) => set({ traits: labels.map((l) => TRAITS.find((t) => t.label === l)!.id as TraitId) })} />

      {p.traits.length > 0 && (
        <Card as="div">
          <h2 className="font-bold mb-2">O que o Ritmo faz por você</h2>
          <ul className="list-disc pl-5 space-y-1">
            {[...new Set(p.traits.flatMap((t) => traitInfo(t).does))].map((d) => <li key={d}>{d}</li>)}
          </ul>
          {sug.why.length > 0 && (
            <div className="mt-3">
              <p className="mb-2">Ajustes que costumam ajudar: <strong>{sug.why.join(', ')}</strong>.</p>
              <Button kind="primary" onClick={() => { update((s) => ({ ...s, settings: { ...s.settings, ...sug.patch } })); setApplied(`Apliquei: ${sug.why.join(', ')}. Você pode desfazer em Ajustes.`); }}>Aplicar esses ajustes</Button>
            </div>
          )}
          <p role="status" className={applied ? 'mt-2 rounded-xl bg-soft p-3' : 'sr-only'}>{applied}</p>
        </Card>
      )}

      <Choice legend="Como prefere que o app fale com você?" value={p.tone} onChange={(v) => set({ tone: v })}
        options={[{ v: 'acolhedor', label: 'Acolhedor, com calma' }, { v: 'direto', label: 'Direto e curto' }]} />

      <section aria-label="O que importa para mim">
        <h2 className="text-xl font-bold mb-1">O que importa para mim</h2>
        <p className="text-muted mb-3">Lembrar do porquê ajuda a se motivar. Aparece nas tarefas, sem cobrança.</p>
        <TextList items={p.values} onChange={(v) => set({ values: v.slice(0, 8) })} addLabel="Algo que importa" placeholder="Algo que importa para mim" ideas={IDEAS_VALUES} />
      </section>

      <section aria-label="Comportamentos que quero cultivar">
        <h2 className="text-xl font-bold mb-1">O que quero cultivar</h2>
        <p className="text-muted mb-3">Hábitos ou jeitos de agir que você quer, no seu ritmo. Não são metas obrigatórias.</p>
        <TextList items={p.wants} onChange={(v) => set({ wants: v.slice(0, 8) })} addLabel="Algo que quero cultivar" placeholder="Um comportamento que quero cultivar" ideas={IDEAS_WANTS} />
      </section>

      {onboarding
        ? <div className="flex flex-wrap gap-2"><Button kind="primary" big onClick={() => { set({}); onDone?.(); }}>Continuar</Button><Button big onClick={() => { set({}); onDone?.(); }}>Pular por enquanto</Button></div>
        : null}
    </div>
  );

  if (onboarding) return body;
  return <><PageHead title="Meu perfil" sub="Opcional. Para o Ritmo se adaptar ao seu jeito." onBack={() => back('/mais')} />{body}</>;
}
