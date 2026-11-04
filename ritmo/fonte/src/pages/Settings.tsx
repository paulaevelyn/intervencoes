import { useRef, useState } from 'react';
import { initialState, normalize, useStore } from '../store';
import { back } from '../router';
import { Button, Card, Choice, ConfirmButton, Note, PageHead } from '../ui';
import { sampleData } from '../data/sample';
import type { FontScale, State, ThemePref, AlertMode } from '../types';

export function Settings() {
  const { state, update, replace } = useStore();
  const s = state.settings;
  const set = (patch: Partial<State['settings']>) => update((x) => ({ ...x, settings: { ...x.settings, ...patch } }));
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const hasExamples = [...state.tasks, ...state.routines, ...state.sensory, ...state.checkins].some((x) => x.example);

  const download = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ritmo-copia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Cópia baixada. Guarde em um lugar seguro: ela contém seus dados.');
  };

  return (
    <>
      <PageHead title="Ajustes e acessibilidade" sub="Deixe o Ritmo do seu jeito. Tudo é salvo neste aparelho." onBack={() => back('/mais')} />
      <p role="status" className={msg ? 'mb-4 rounded-xl bg-soft p-3' : 'sr-only'}>{msg}</p>

      <div className="space-y-8">
        <Group title="Aparência">
          <Choice<ThemePref> legend="Tema" value={s.theme} onChange={(v) => set({ theme: v })} cols={3} options={[{ v: 'sistema', label: 'Do aparelho' }, { v: 'claro', label: 'Claro' }, { v: 'escuro', label: 'Escuro' }]} />
          <Toggle label="Modo baixo estímulo" help="Cores neutras, sem sombras e sem nenhuma animação." on={s.lowStim} onChange={(v) => set({ lowStim: v })} />
        </Group>

        <Group title="Leitura">
          <Choice<FontScale> legend="Tamanho do texto" value={s.fontScale} onChange={(v) => set({ fontScale: v })} cols={4} options={[{ v: 100, label: 'Padrão' }, { v: 115, label: 'Grande' }, { v: 130, label: 'Maior' }, { v: 150, label: 'Muito grande' }]} />
          <Toggle label="Fonte de leitura facilitada" help="Usa uma fonte mais aberta e fácil de distinguir letras." on={s.readingFont} onChange={(v) => set({ readingFont: v })} />
          <Toggle label="Espaçamento amplo" help="Mais espaço entre letras e linhas." on={s.wideSpacing} onChange={(v) => set({ wideSpacing: v })} />
          <Toggle label="Mostrar contagens de tempo" help="Desligue se contagem regressiva deixa você tenso/a." on={s.showCounts} onChange={(v) => set({ showCounts: v })} />
        </Group>

        <Group title="Avisos de transição">
          <Choice<AlertMode> legend="Como avisar" value={s.alerts} onChange={(v) => set({ alerts: v })} cols={3} options={[{ v: 'off', label: 'Sem avisos' }, { v: 'screen', label: 'Só na tela' }, { v: 'vibrate', label: 'Tela + vibração leve' }]} />
          <Note>O Ritmo não usa sons, nem notificações fora do app, nem lembretes diários. Os avisos só aparecem enquanto você segue uma rotina.</Note>
        </Group>

        <Group title="Seus dados">
          <Note>Tudo fica salvo apenas neste aparelho, no navegador. Não há cadastro, anúncios, rastreamento nem venda de dados. Limpar os dados do navegador apaga o Ritmo, então baixe uma cópia de vez em quando.</Note>
          <div className="flex flex-wrap gap-2">
            <Button onClick={download}>Baixar uma cópia</Button>
            <Button onClick={() => file.current?.click()}>Restaurar de uma cópia</Button>
            <input ref={file} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={async (e) => {
              const f = e.target.files?.[0]; e.target.value = '';
              if (!f) return;
              try { const next = normalize(JSON.parse(await f.text())); next.onboarded = true; replace(next); setMsg('Cópia restaurada.'); }
              catch { setMsg('Não consegui ler esse arquivo. Seus dados atuais não foram alterados.'); }
            }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { const d = sampleData(); update((x) => ({ ...x, tasks: [...x.tasks, ...d.tasks], routines: [...x.routines, ...d.routines], sensory: [...x.sensory, ...d.sensory], checkins: [...x.checkins, ...d.checkins] })); setMsg('Exemplos adicionados. Eles aparecem marcados como “exemplo”.'); }}>Carregar dados de exemplo</Button>
            {hasExamples && <Button onClick={() => { update((x) => ({ ...x, tasks: x.tasks.filter((t) => !t.example), routines: x.routines.filter((t) => !t.example), sensory: x.sensory.filter((t) => !t.example), checkins: x.checkins.filter((t) => !t.example) })); setMsg('Exemplos removidos. Seus próprios dados continuam.'); }}>Remover exemplos</Button>}
          </div>
          <ConfirmButton label="Apagar todos os meus dados" confirmLabel="Sim, apagar tudo" onConfirm={() => { replace({ ...initialState(), onboarded: true }); setMsg('Tudo foi apagado deste aparelho.'); }} />
        </Group>

        <Group title="Conta e sincronização">
          <Card>
            <p className="font-semibold">Ainda não disponível.</p>
            <p className="text-muted">No futuro, poderá existir uma conta opcional para usar o Ritmo em mais de um aparelho. Ela nunca será obrigatória, os dados só seriam enviados se você ligasse isso, com texto claro sobre o que é guardado, e poderão ser apagados quando você quiser. Até lá, use “Baixar uma cópia” e “Restaurar”.</p>
          </Card>
        </Group>
      </div>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <section aria-label={title} className="space-y-4"><h2 className="text-xl font-bold">{title}</h2>{children}</section>;
}

function Toggle({ label, help, on, onChange }: { label: string; help: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="tap w-full text-left flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-line bg-surface p-3 hover:border-brand">
      <span className="min-w-0 flex-1 basis-40"><span className="block font-semibold">{label}</span><span className="block text-muted text-sm">{help}</span></span>
      <span className={`shrink-0 rounded-full px-3 py-1 font-bold text-sm border-2 ${on ? 'bg-brand text-brand-ink border-brand' : 'border-line'}`}>{on ? 'Ligado' : 'Desligado'}</span>
    </button>
  );
}
