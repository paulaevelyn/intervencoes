import { useStore } from '../store';
import { PageHead, Icon, Card } from '../ui';

const ITEMS = [
  { to: '/perfil', icon: 'heart', title: 'Meu perfil', text: 'Como você funciona. O Ritmo se adapta ao seu jeito.' },
  { to: '/ajustes', icon: 'sliders', title: 'Ajustes e acessibilidade', text: 'Tema, texto, contraste, avisos, lembretes e seus dados.' },
  { to: '/sobre', icon: 'info', title: 'Privacidade e sobre o Ritmo', text: 'O que o app é, o que não é e como cuida dos seus dados.' },
];

export function More() {
  const { state, update } = useStore();
  const on = state.settings.lowStim;
  return (
    <>
      <PageHead title="Perfil" sub="Acessibilidade, lembretes, dados e privacidade." />
      <button type="button" role="switch" aria-checked={on} onClick={() => update((s) => ({ ...s, settings: { ...s.settings, lowStim: !on } }))}
        className="tap w-full text-left flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-line bg-surface p-4 mb-4 hover:border-brand">
        <span className="min-w-0 flex-1 basis-48"><span className="block font-bold text-lg">Modo calmo</span><span className="block text-muted text-sm">Menos cores, sem enfeites nem movimento, uma coisa de cada vez.</span></span>
        <span className={`shrink-0 rounded-full px-3 py-1 font-bold text-sm border-2 ${on ? 'bg-brand text-brand-ink border-brand' : 'border-line'}`}>{on ? 'Ligado' : 'Desligado'}</span>
      </button>
      <ul className="space-y-3">
        {ITEMS.map((i) => (
          <li key={i.to}>
            <a href={`#${i.to}`} className="block">
              <Card as="div" className="flex gap-4 items-start hover:border-brand">
                <span className="text-brand mt-1"><Icon name={i.icon} className="w-7 h-7" /></span>
                <span>
                  <span className="block font-bold text-lg">{i.title}</span>
                  <span className="block text-muted">{i.text}</span>
                </span>
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
