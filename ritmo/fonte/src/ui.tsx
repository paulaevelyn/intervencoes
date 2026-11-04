import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { useStore } from './store';

/* ---------- Ícones (sempre acompanhados de texto) ---------- */
const P: Record<string, ReactNode> = {
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  tasks: <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  wind: <path d="M9.6 4.6A2 2 0 1 1 11 8H2m10.6 11.4A2 2 0 1 0 14 16H2m15.7-8.3A2.5 2.5 0 1 1 19.5 12H2" />,
  more: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />,
  sliders: <><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></>,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
  back: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  up: <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>,
  down: <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
};

export function Icon({ name, className = 'w-6 h-6' }: { name: keyof typeof P | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {P[name]}
    </svg>
  );
}

/* ---------- Botões ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: string;
  block?: boolean;
  big?: boolean;
};
export function Button({ kind = 'secondary', icon, block, big, className = '', children, ...rest }: BtnProps) {
  const base = 'tap inline-flex items-center justify-center gap-2 rounded-xl px-4 font-semibold border-2 transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed';
  const k = {
    primary: 'bg-brand text-brand-ink border-brand hover:opacity-90',
    secondary: 'bg-surface text-ink border-line hover:border-brand',
    ghost: 'bg-transparent text-ink border-transparent hover:bg-soft',
    danger: 'bg-surface text-ink border-line hover:border-ink',
  }[kind];
  return (
    <button type="button" className={`${base} ${k} ${block ? 'w-full' : ''} ${big ? 'py-5 text-lg' : 'py-2'} ${className}`} {...rest}>
      {icon && <Icon name={icon} className="w-5 h-5 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}

export function Card({ children, className = '', as: As = 'section', style }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'li' | 'article'; style?: React.CSSProperties }) {
  return <As style={style} className={`rounded-2xl border-2 border-line bg-surface p-4 sm:p-5 ${className}`}>{children}</As>;
}

export function Note({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'warm' }) {
  return <p className={`rounded-xl p-3 text-[0.95rem] ${tone === 'soft' ? 'bg-soft' : 'bg-warm'}`}>{children}</p>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block font-semibold mb-1">{label}</span>
      {hint && <span className="block text-muted text-sm mb-1">{hint}</span>}
      {children}
    </label>
  );
}

export const inputCls = 'w-full tap rounded-xl border-2 border-line bg-surface px-3 py-2 placeholder:text-muted focus:border-brand';

/** Escolha única em botões grandes. */
export function Choice<T extends string | number>({ legend, value, options, onChange, cols = 2 }: {
  legend: string; value: T | undefined; options: { v: T; label: string }[]; onChange: (v: T) => void; cols?: 2 | 3 | 4;
}) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' }[cols];
  return (
    <fieldset>
      <legend className="font-semibold mb-2">{legend}</legend>
      <div className={`grid gap-2 ${grid}`} role="radiogroup" aria-label={legend}>
        {options.map((o) => {
          const on = value === o.v;
          return (
            <button key={String(o.v)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.v)}
              className={`tap rounded-xl border-2 px-3 py-2 font-semibold text-left flex items-center gap-2 ${on ? 'bg-brand text-brand-ink border-brand' : 'bg-surface border-line hover:border-brand'}`}>
              <span aria-hidden="true" className={`inline-block w-4 h-4 rounded-full border-2 shrink-0 ${on ? 'bg-brand-ink border-brand-ink' : 'border-muted'}`} />
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Escolha múltipla (chips). */
export function MultiChoice({ legend, selected, options, onChange }: {
  legend: string; selected: string[]; options: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="font-semibold mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button key={o} type="button" aria-pressed={on}
              onClick={() => onChange(on ? selected.filter((x) => x !== o) : [...selected, o])}
              className={`tap rounded-xl border-2 px-3 py-2 font-semibold flex items-center gap-2 ${on ? 'bg-brand text-brand-ink border-brand' : 'bg-surface border-line hover:border-brand'}`}>
              <span aria-hidden="true" className="w-4 text-center">{on ? '✓' : '+'}</span>{o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Botão de apagar com confirmação no próprio lugar (sem pop-up). */
export function ConfirmButton({ label, confirmLabel = 'Sim, excluir', onConfirm, icon = 'trash' }: {
  label: string; confirmLabel?: string; onConfirm: () => void; icon?: string;
}) {
  const [ask, setAsk] = useState(false);
  if (!ask) return <Button icon={icon} onClick={() => setAsk(true)}>{label}</Button>;
  return (
    <span className="inline-flex flex-wrap gap-2" role="group" aria-label="Confirmar">
      <Button kind="primary" onClick={onConfirm}>{confirmLabel}</Button>
      <Button onClick={() => setAsk(false)}>Manter</Button>
    </span>
  );
}

export function Copy({ text, label = 'Copiar texto' }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button icon="copy" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setOk(true); }
      catch {
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); setOk(true); } catch { setOk(false); }
        ta.remove();
      }
      setTimeout(() => setOk(false), 2500);
    }}>
      {ok ? 'Copiado' : label}
    </Button>
  );
}

export function PageHead({ title, sub, onBack }: { title: string; sub?: string; onBack?: () => void }) {
  return (
    <div className="mb-5">
      {onBack && <div className="mb-2 -ml-2"><Button kind="ghost" icon="back" onClick={onBack}>Voltar</Button></div>}
      <h1 id="page-title" tabIndex={-1} className="text-2xl sm:text-3xl font-bold leading-tight outline-none">{title}</h1>
      {sub && <p className="text-muted mt-1">{sub}</p>}
    </div>
  );
}

/** Lista simples de textos editáveis (plano de apoio, passos, etc.). */
export function TextList({ items, onChange, addLabel, placeholder, ideas = [] }: {
  items: string[]; onChange: (v: string[]) => void; addLabel: string; placeholder: string; ideas?: string[];
}) {
  const [draft, setDraft] = useState('');
  const add = (t: string) => { const v = t.trim(); if (v && !items.includes(v)) onChange([...items, v]); setDraft(''); };
  const free = ideas.filter((i) => !items.includes(i));
  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 items-start">
              <textarea aria-label={`Item ${i + 1}`} rows={Math.max(1, Math.ceil(it.length / 40))} value={it}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
                className={`${inputCls} resize-y`} />
              <Button aria-label={`Remover item ${i + 1}`} icon="trash" onClick={() => onChange(items.filter((_, j) => j !== i))}><span className="sr-only">Remover</span></Button>
            </li>
          ))}
        </ul>
      )}
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(draft); }}>
        <input aria-label={addLabel} className={inputCls} value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} />
        <Button kind="primary" icon="plus" type="submit">Adicionar</Button>
      </form>
      {free.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-1">Ideias para começar (toque para adicionar e depois ajuste do seu jeito):</p>
          <div className="flex flex-wrap gap-2">
            {free.map((i) => (
              <button key={i} type="button" onClick={() => add(i)} className="tap rounded-xl border-2 border-dashed border-line px-3 py-1 text-left hover:border-brand">+ {i}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Lê um texto em voz alta (síntese de voz do aparelho). Só aparece se o recurso existir e estiver ligado em Ajustes. */
export function Listen({ text, label = 'Ouvir' }: { text: string; label?: string }) {
  const { state } = useStore();
  const [on, setOn] = useState(false);
  if (!state.settings.listen || !('speechSynthesis' in window)) return null;
  const toggle = () => {
    const synth = window.speechSynthesis;
    if (on) { synth.cancel(); setOn(false); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.onend = () => setOn(false);
    u.onerror = () => setOn(false);
    setOn(true);
    synth.speak(u);
  };
  return <Button icon="wind" aria-pressed={on} onClick={toggle}>{on ? 'Parar áudio' : label}</Button>;
}
