import { useStore } from '../store';
import { sampleData } from '../data/sample';
import { Button, Card } from '../ui';

export function Onboarding() {
  const { update } = useStore();
  const start = (examples: boolean) =>
    update((s) => ({ ...s, onboarded: true, ...(examples ? sampleData() : {}) }));
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
        <Button kind="primary" big block onClick={() => start(false)}>Começar do zero</Button>
        <Button block onClick={() => start(true)}>Ver com dados de exemplo</Button>
      </div>
    </main>
  );
}
