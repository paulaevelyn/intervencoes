import { useRef, useState } from 'react';
import { initialState, normalize, useStore } from '../store';
import { back } from '../router';
import { Button, Card, Choice, ConfirmButton, Field, inputCls, Note, PageHead } from '../ui';
import { sampleData } from '../data/sample';
import { iosNotInstalled, notifPermission, notifSupported, show, useRem } from '../reminders';
import type { FontScale, State, ThemePref, AlertMode } from '../types';

export function Settings() {
  const { state, update, replace } = useStore();
  const s = state.settings;
  const set = (patch: Partial<State['settings']>) => update((x) => ({ ...x, settings: { ...x.settings, ...patch } }));
  const file = useRef<HTMLInputElement>(null);
  const [rem, setRem] = useRem();
  const [perm, setPerm] = useState(notifPermission());
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

        <Group title="Lembretes fora do app">
          <Toggle label="Lembretes" help="Notificações discretas, sem som. Você escolhe os horários. Desligado por padrão." on={rem.enabled && perm === 'granted'} onChange={async (v) => {
            if (!v) { setRem({ enabled: false }); return; }
            if (!notifSupported()) { setMsg('Este navegador não oferece notificações.'); return; }
            if (iosNotInstalled()) { setMsg('No iPhone, instale o Ritmo na tela de início (Compartilhar → Adicionar à Tela de Início) para ligar lembretes. É uma regra da Apple.'); return; }
            const p = await Notification.requestPermission();
            setPerm(p);
            if (p === 'granted') { setRem({ enabled: true }); setMsg('Lembretes ligados.'); }
            else setMsg('A permissão não foi concedida. Para ligar depois, libere as notificações nas configurações do navegador (cadeado ao lado do endereço).');
          }} />
          {perm === 'denied' && notifSupported() && <Note tone="warm">As notificações estão bloqueadas neste navegador. Libere nas configurações do navegador para usar lembretes.</Note>}
          {rem.enabled && perm === 'granted' && (
            <>
              <Toggle label="Lembrete diário para ver como você está" help="No máximo 1 por dia, e só se você ainda não registrou nada no dia." on={rem.daily} onChange={(v) => setRem({ daily: v })} />
              {rem.daily && (
                <Field label="Horário do lembrete diário">
                  <select className={inputCls} value={rem.hour} onChange={(e) => setRem({ hour: Number(e.target.value) })}>
                    {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                  </select>
                </Field>
              )}
              <Note>Lembretes de rotinas: defina o horário ao editar cada rotina (Rotinas → Editar).</Note>
              <div><Button onClick={() => show('Assim aparece um lembrete do Ritmo.', 'ritmo-teste')}>Enviar um lembrete de teste</Button></div>
            </>
          )}
          <Note>Os lembretes são agendados no seu aparelho, sem servidor, e não são sincronizados com a conta. Funcionam melhor com o Ritmo instalado na tela de início. Se o navegador ficar fechado por muito tempo, um aviso pode não aparecer.</Note>
        </Group>

        <Group title="Seus dados">
          <Note>Sem conta, tudo fica salvo apenas neste aparelho, no navegador. Não há anúncios, rastreamento nem venda de dados. Limpar os dados do navegador apaga o Ritmo, então baixe uma cópia de vez em quando.</Note>
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
            <p className="font-semibold">Opcional.</p>
            <p className="text-muted">Pelo botão de conta, no canto superior direito (“sem conta”, “Entrar” ou “conta”), você entra com e-mail e senha para guardar seus dados na conta e usar o Ritmo em outros aparelhos. As contas seguem o mesmo sistema dos outros apps da Psicoterapia e Afins. Antes de guardar, o aviso de privacidade pede seu consentimento. Seu plano de apoio, seus registros e suas tarefas nunca aparecem no painel da profissional. Os lembretes ficam só no aparelho.</p>
            <p className="text-muted mt-2">Se o botão não aparecer, o login não carregou (por exemplo, sem internet): o Ritmo segue funcionando só com os dados deste aparelho.</p>
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
