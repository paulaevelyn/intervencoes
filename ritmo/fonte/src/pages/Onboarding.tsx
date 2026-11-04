import { useStore } from '../store';
import { sampleData } from '../data/sample';
import { Button, Card } from '../ui';
import { useState } from 'react';
import { Profile } from './Profile';

export function Onboarding() {
  const { update } = useStore();
  const [step, setStep] = useState<'intro' | 'perfil'>('intro');
  const [ex, setEx] = useState(false);
  const start = (examples: boolean) =>
    update((s) => ({ ...s, onboarded: true, ...(examples ? sampleData() : {}) }));
  if (step === 'perfil') {
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 id="page-title" tabIndex={-1} className="text-3xl font-bold mb-2 outline-none">Quer personalizar?</h1>
        <p className="text-muted mb-5">Opcional, e dá para mudar depois em Mais → Meu perfil.</p>
        <Profile onboarding onDone={() => start(ex)} />
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 id="page-title" tabIndex={-1} className="text-3xl font-bold mb-2 outline-none">Ritmo</h1>
      <p className="text-xl mb-6">Apoio no seu ritmo, para adultos neurodivergentes.</p>
      <Card className="space-y-3 text-lg">
        <p>Aqui você encontra tarefas em passos pequenos, rotinas visuais, pausas e um plano de apoio.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Conta opcional. Sem conta, seus dados ficam só neste aparelho.</li>
          <li>Sem metas, sem pontos, sem cobrança.</li>
          <li>Não faz diagnóstico nem substitui terapia ou tratamento.</li>
        </ul>
        <p className="text-muted text-base">Se algo incomodar (cores, movimento, texto pequeno), os ajustes ficam em Mais → Ajustes e acessibilidade.</p>
      </Card>
      <div className="mt-6 space-y-3">
        <Button kind="primary" big block onClick={() => { setEx(false); setStep('perfil'); }}>Começar do zero</Button>
        <Button block onClick={() => { setEx(true); setStep('perfil'); }}>Ver com dados de exemplo</Button>
      </div>
    </main>
  );
}
