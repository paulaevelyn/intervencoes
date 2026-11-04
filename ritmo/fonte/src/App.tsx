import { useEffect, useLayoutEffect, useState } from 'react';
import { useStore } from './store';
import { go, useRoute } from './router';
import { Button, Icon } from './ui';
import { Home } from './pages/Home';
import { Energy } from './pages/Energy';
import { Tasks } from './pages/Tasks';
import { Routines } from './pages/Routines';
import { Library } from './pages/Library';
import { More } from './pages/More';
import { Plan } from './pages/Plan';
import { SupportNow } from './pages/SupportNow';
import { Sensory } from './pages/Sensory';
import { Comms } from './pages/Comms';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { Onboarding } from './pages/Onboarding';
import { useReminders } from './reminders';

const NAV = [
  { to: '/', label: 'Início', icon: 'home', root: '' },
  { to: '/tarefas', label: 'Tarefas', icon: 'tasks', root: 'tarefas' },
  { to: '/rotinas', label: 'Rotinas', icon: 'clock', root: 'rotinas' },
  { to: '/regulacao', label: 'Regulação', icon: 'wind', root: 'regulacao' },
  { to: '/mais', label: 'Mais', icon: 'more', root: 'mais' },
];
const MORE_ROOTS = ['mais', 'plano', 'sensorial', 'comunicacao', 'ajustes', 'sobre', 'energia'];

function useAppearance() {
  const { state } = useStore();
  const s = state.settings;
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  useLayoutEffect(() => {
    const r = document.documentElement;
    const isDark = s.theme === 'escuro' || (s.theme === 'sistema' && dark);
    r.dataset.theme = isDark ? 'dark' : 'light';
    r.dataset.lowstim = String(s.lowStim);
    r.dataset.font = s.readingFont ? 'leitura' : 'padrao';
    r.style.setProperty('--fs', `${s.fontScale}%`);
    r.style.setProperty('--ls', s.wideSpacing ? '0.04em' : '0');
    r.style.setProperty('--lh', s.wideSpacing ? '1.9' : '1.6');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#171b1e' : '#2f6b62');
  }, [s, dark]);
}

export function App() {
  const { state, update, saveOk } = useStore();
  const route = useRoute();
  useAppearance();
  useReminders(state);
  const root = route.parts[0] ?? '';

  // Ao trocar de tela, leva o foco para o título (leitor de tela e teclado) e volta ao topo.
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => document.getElementById('page-title')?.focus({ preventScroll: true }), 30);
    return () => clearTimeout(t);
  }, [route.path]);

  if (!state.onboarded) return <Onboarding />;

  const simple = root === 'apoio-agora';
  let page;
  switch (root) {
    case '': page = <Home />; break;
    case 'energia': page = <Energy />; break;
    case 'tarefas': page = <Tasks />; break;
    case 'rotinas': page = <Routines />; break;
    case 'regulacao': page = <Library />; break;
    case 'mais': page = <More />; break;
    case 'plano': page = <Plan />; break;
    case 'apoio-agora': page = <SupportNow />; break;
    case 'sensorial': page = <Sensory />; break;
    case 'comunicacao': page = <Comms />; break;
    case 'ajustes': page = <Settings />; break;
    case 'sobre': page = <About />; break;
    default: page = <Home />;
  }

  return (
    <div className="min-h-screen md:flex app-root">
      <a href="#conteudo" className="sr-only-link" onClick={(e) => { e.preventDefault(); document.getElementById('page-title')?.focus(); }}>Ir para o conteúdo</a>

      {!simple && (
        <nav aria-label="Principal" className="fixed bottom-0 inset-x-0 z-20 border-t-2 border-line bg-surface md:sticky md:top-[var(--bar,0px)] md:h-[calc(100vh-var(--bar,0px))] md:w-56 md:shrink-0 md:border-t-0 md:border-r-2 md:pt-20">
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(3.6rem,1fr))] md:grid-cols-1 md:gap-1 md:p-3">
            {NAV.map((n) => {
              const active = n.to === '/mais' ? MORE_ROOTS.includes(root) : root === n.root;
              return (
                <li key={n.to}>
                  <a href={`#${n.to}`} aria-current={active ? 'page' : undefined}
                    className={`tap flex flex-col md:flex-row items-center justify-center md:justify-start gap-0.5 md:gap-3 py-2 md:px-4 md:rounded-xl text-[0.78rem] md:text-base font-semibold min-w-0 break-words text-center md:text-left ${active ? 'text-brand md:bg-soft' : 'text-muted hover:text-ink'}`}>
                    <Icon name={n.icon} className="w-6 h-6" />
                    <span className={active ? 'underline underline-offset-4 decoration-2' : ''}>{n.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="flex-1 min-w-0">
        <header className="sticky top-[var(--bar,0px)] z-10 border-b-2 border-line bg-bg/95 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-4 py-2 flex items-center justify-between gap-3">
            <a href="#/" className="text-xl font-bold tracking-tight tap flex items-center">Ritmo</a>
            {!simple && (
              <Button icon="heart" onClick={() => go('/apoio-agora')} aria-label="Preciso de apoio agora. Abre o plano de apoio simplificado.">Preciso de apoio agora</Button>
            )}
          </div>
        </header>

        <main id="conteudo" className={`mx-auto max-w-2xl px-4 pt-5 ${simple ? 'pb-10' : 'pb-36 md:pb-10'}`}>
          {!saveOk && (
            <p role="status" className="mb-4 rounded-xl bg-warm p-3 text-[0.95rem]">
              Seu navegador não está deixando o Ritmo salvar neste aparelho (pode ser aba privada). O que você fizer agora pode se perder ao fechar. Em Ajustes, você pode baixar uma cópia.
            </p>
          )}
          {state.recovery && !simple && (
            <div className="mb-4 rounded-xl bg-soft p-3 flex flex-wrap items-center justify-between gap-2" role="status">
              <p className="font-semibold">Modo de recuperação ligado. Menos coisas na tela.</p>
              <Button onClick={() => update((s) => ({ ...s, recovery: false }))}>Desligar</Button>
            </div>
          )}
          {page}
        </main>
      </div>
    </div>
  );
}
