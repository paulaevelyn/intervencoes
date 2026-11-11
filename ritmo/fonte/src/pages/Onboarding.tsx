import { useState } from 'react';
import { useStore } from '../store';
import { sampleData } from '../data/sample';
import { Blobs, Button, Card, Choice, MultiChoice } from '../ui';
import { iosNotInstalled, notifSupported, useRem } from '../reminders';
import type { Settings, ThemePref } from '../types';

const PESOS = ['Tarefas', 'Rotinas', 'Sobrecarga', 'Sono', 'Trabalho', 'Relacionamentos'];
const APOIOS = ['Silêncio, sem avisos', 'Lembretes discretos', 'Rotinas visuais', 'Textos curtos', 'Áudio (ouvir os textos)'];
const AJUSTES = ['Texto maior', 'Contraste alto', 'Modo calmo'];

/** Boas-vindas curtas e, se a pessoa quiser, 3 telas opcionais e puláveis. Não pergunta diagnóstico. */
export function Onboarding() {
  const { state, update } = useStore();
  const [, setRem] = useRem();
  const [step, setStep] = useState(0); // 0 boas-vindas, 1-3 perguntas
  const [pesos, setPesos] = useState<string[]>([]);
  const [apoios, setApoios] = useState<string[]>([]);
  const [ajustes, setAjustes] = useState<string[]>([]);
  const [tema, setTema] = useState<ThemePref>('sistema');
  const calmo = state.settings.lowStim;

  const finish = async (aplicar: boolean, exemplos = false) => {
    if (aplicar && apoios.includes('Lembretes discretos') && notifSupported() && !iosNotInstalled()) {
      try { if ((await Notification.requestPermission()) === 'granted') setRem({ enabled: true }); } catch { /* sem permissão */ }
    }
    update((s) => {
      const settings: Settings = { ...s.settings };
      let tone = s.profile.tone;
      const weighs = [...pesos.map((p) => p.toLowerCase())];
      if (aplicar) {
        if (apoios.includes('Silêncio, sem avisos')) settings.alerts = 'off';
        if (apoios.includes('Áudio (ouvir os textos)')) settings.listen = true;
        if (apoios.includes('Textos curtos')) tone = 'direto';
        if (apoios.includes('Rotinas visuais') && !weighs.includes('rotinas')) weighs.push('rotinas');
        settings.theme = tema;
        if (ajustes.includes('Texto maior')) settings.fontScale = 115;
        if (ajustes.includes('Contraste alto')) settings.contrast = 'alto';
        if (ajustes.includes('Modo calmo')) settings.lowStim = true;
      }
      return { ...s, onboarded: true, settings, profile: { ...s.profile, tone, weighs: aplicar ? weighs : [] }, ...(exemplos ? sampleData() : {}) };
    });
  };

  const toggleCalmo = () => update((s) => ({ ...s, settings: { ...s.settings, lowStim: !s.settings.lowStim } }));

  if (step === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <Blobs className="w-full max-w-[18rem] mb-2" />
        <h1 id="page-title" tabIndex={-1} className="brand-word text-5xl mb-2 outline-none text-brand">Ritmo</h1>
        <p className="text-xl mb-6">Um espaço para organizar seu dia no seu tempo, com menos sobrecarga e mais apoio.</p>
        <Card className="space-y-2">
          <p>Seus registros ficam no seu aparelho por padrão. Conta é opcional.</p>
          <p className="text-muted">Este app não faz diagnóstico nem substitui cuidado profissional.</p>
        </Card>
        <button type="button" role="switch" aria-checked={calmo} onClick={toggleCalmo}
          className="tap w-full text-left flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-line bg-surface p-4 mt-4 hover:border-brand">
          <span className="min-w-0 flex-1 basis-48"><span className="block font-semibold">Modo calmo</span><span className="block text-muted text-sm">Menos cores, sem enfeites nem movimento. Dá para mudar quando quiser.</span></span>
          <span className={`shrink-0 rounded-full px-3 py-1 font-bold text-sm border-2 ${calmo ? 'bg-brand text-brand-ink border-brand' : 'border-line'}`}>{calmo ? 'Ligado' : 'Desligado'}</span>
        </button>
        <div className="mt-6 space-y-3">
          <Button kind="action" big block onClick={() => setStep(1)}>Começar</Button>
          <Button block onClick={() => void finish(false)}>Pular e explorar</Button>
          <Button kind="ghost" block onClick={() => void finish(false, true)}>Ver com dados de exemplo</Button>
        </div>
      </main>
    );
  }

  const nextLabel = step < 3 ? 'Próximo' : 'Pronto';
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 id="page-title" tabIndex={-1} className="text-2xl font-bold mb-1 outline-none">
        {step === 1 ? 'O que mais pesa no seu dia?' : step === 2 ? 'Como você prefere receber apoio?' : 'Quais ajustes ajudam você?'}
      </h1>
      <p className="text-muted mb-5">Pergunta {step} de 3. Pode marcar vários, ou pular. Dá para mudar depois.</p>
      {step === 1 && <MultiChoice legend="Marque o que quiser" selected={pesos} options={PESOS} onChange={setPesos} />}
      {step === 2 && <MultiChoice legend="Marque o que quiser" selected={apoios} options={APOIOS} onChange={setApoios} />}
      {step === 3 && (
        <div className="space-y-5">
          <Choice<ThemePref> legend="Tema" value={tema} onChange={setTema} cols={3} options={[{ v: 'sistema', label: 'Do aparelho' }, { v: 'claro', label: 'Claro' }, { v: 'escuro', label: 'Escuro' }]} />
          <MultiChoice legend="Mais ajustes" selected={ajustes} options={AJUSTES} onChange={setAjustes} />
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <Button kind="action" big onClick={() => (step < 3 ? setStep(step + 1) : void finish(true))}>{nextLabel}</Button>
        <Button big onClick={() => (step < 3 ? setStep(step + 1) : void finish(true))}>Pular</Button>
        <Button kind="ghost" onClick={() => setStep(step - 1)}>Voltar</Button>
      </div>
    </main>
  );
}
