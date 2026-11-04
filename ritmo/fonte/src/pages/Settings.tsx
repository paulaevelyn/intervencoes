import { useRef, useState } from 'react';
import { initialState, normalize, useStore } from '../store';
import { back } from '../router';
import { Button, Card, Choice, ConfirmButton, Field, inputCls, Note, PageHead } from '../ui';
import { sampleData } from '../data/sample';
import { iosNotInstalled, notifPermission, notifSupported, show, useRem } from '../reminders';
import type { FontScale, State, ThemePref, AlertMode } from '../types';
import { IA_CONSENT_VERSION, iaLigada, iaTemConta } from '../ia';
import { go } from '../router';

export function Settings() {
  const { state, update, replace } = useStore();
  const s = state.settings;
  const set = (patch: Partial<State['settings']>) => update((x) => ({ ...x, settings: { ...x.settings, ...patch } }));
  const file = useRef<HTMLInputElement>(null);
  const [rem, setRem] = useRem();
  const [perm, setPerm] = useState(notifPermission());
  const [aceito, setAceito] = useState(false);
  const [ask, setAsk] = useState(false);
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
          <Toggle label="Botão “Ouvir”" help="Lê os textos em voz alta com a voz do seu aparelho." on={s.listen} onChange={(v) => set({ listen: v })} />
          <Toggle label="Mostrar contagens de tempo" help="Desligue se contagem regressiva deixa você tenso/a." on={s.showCounts} onChange={(v) => set({ showCounts: v })} />
        </Group>

        <Group title="Avisos de transição">
          <Choice<AlertMode> legend="Como avisar" value={s.alerts} onChange={(v) => set({ alerts: v })} cols={3} options={[{ v: 'off', label: 'Sem avisos' }, { v: 'screen', label: 'Só na tela' }, { v: 'vibrate', label: 'Tela + vibração leve' }]} />
          <Note>O Ritmo não usa sons, nem notificações fora do app, nem lembretes diários. Os avisos só aparecem enquanto você segue uma rotina.</Note>
        </Group>

        <Group title="Ajuda de IA (opcional)">
          <Note>A IA pode ajudar a planejar o dia, dividir tarefas e traduzir o que você sente. Ela pode errar, não faz diagnóstico e não substitui terapia. As sugestões sem IA continuam funcionando.</Note>
          {iaLigada(s) ? (
            <>
              <Toggle label="Ajuda de IA ligada" help="Só envia algo quando você aperta um botão de IA." on onChange={() => set({ ai: { ...s.ai, enabled: false } })} />
              <Toggle label="Usar meu perfil" help="Envia junto seus traços (como TDAH ou autismo), tom e valores, para respostas mais adequadas. Desligado por padrão." on={s.ai.useProfile} onChange={(v) => set({ ai: { ...s.ai, useProfile: v } })} />
              {!iaTemConta() && <Note tone="warm">A IA precisa de uma conta. Entre pelo botão no canto superior direito.</Note>}
            </>
          ) : ask ? (
            <Card>
              <h3 className="font-bold mb-2">Antes de ligar</h3>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>O que é enviado: o texto que você escrever naquele momento, seu nível de energia e o tempo disponível. Seu perfil só vai se você permitir.</li>
                <li>Para quem: um provedor externo de IA (Anthropic), por meio de um servidor do Ritmo, só para gerar a resposta.</li>
                <li>O que o Ritmo guarda: apenas quantos usos você fez no dia (limite diário). Não guarda o que você escreveu nem a resposta.</li>
                <li>Exige conta. O plano de apoio, os registros sensoriais e as tarefas nunca são enviados.</li>
                <li>Evite colocar nomes e dados de outras pessoas. Se você escrever sobre risco de se machucar, o app mostra o 188 (CVV) e não envia.</li>
                <li>Você desliga quando quiser.</li>
              </ul>
              <label className="tap flex items-start gap-3 mb-3"><input type="checkbox" className="w-6 h-6 mt-0.5 accent-[var(--brand)] shrink-0" checked={aceito} onChange={(e) => setAceito(e.target.checked)} /><span>Li e concordo em enviar o que eu escrever, quando eu pedir, para gerar respostas de IA.</span></label>
              <div className="flex flex-wrap gap-2"><Button kind="primary" disabled={!aceito} onClick={() => { set({ ai: { ...s.ai, enabled: true, consent: IA_CONSENT_VERSION } }); setAsk(false); setMsg('Ajuda de IA ligada.'); }}>Ligar ajuda de IA</Button><Button onClick={() => setAsk(false)}>Agora não</Button></div>
            </Card>
          ) : <Button onClick={() => setAsk(true)}>Ver como funciona e ligar</Button>}
        </Group>

        <Group title="Perfil">
          <Button onClick={() => go('/perfil')}>Abrir meu perfil</Button>
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
