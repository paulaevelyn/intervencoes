import type { CSSProperties } from 'react';
import { BAR_C, BAR_H, SYMBOL, WORD } from './logoData';

/** Símbolo: 21 barras que formam a onda do ritmo. No Modo calmo (mono) usa uma cor só. */
export function Symbol({ className = '', style, mono = false }: { className?: string; style?: CSSProperties; mono?: boolean }) {
  return (
    <svg viewBox={`0 0 ${SYMBOL.w} ${SYMBOL.h}`} className={className} style={style} aria-hidden="true" focusable="false">
      {BAR_H.map((h, i) => (
        <rect key={i} x={i * SYMBOL.step} y={SYMBOL.h / 2 - h / 2} width={20} height={h} rx={10} fill={mono ? 'var(--brand)' : BAR_C[i]} />
      ))}
    </svg>
  );
}

/** A palavra "ritmo" (Nunito Black contornada), na cor da marca. */
export function Wordmark({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox={`0 0 ${WORD.w} ${WORD.h}`} className={className} style={style} aria-hidden="true" focusable="false">
      <path transform={`translate(${-WORD.x1} ${-WORD.y1})`} d={WORD.d} fill="var(--logo-ink)" />
    </svg>
  );
}

/** Símbolo + palavra lado a lado. `h` é a altura da palavra, em px. */
export function LogoHorizontal({ h = 26, mono = false }: { h?: number; mono?: boolean }) {
  return (
    <span className="inline-flex items-end" style={{ gap: h * 0.49 }} role="img" aria-label="Ritmo">
      <Symbol mono={mono} className="block" style={{ height: h * 0.924, width: 'auto' }} />
      <Wordmark className="block" style={{ height: h, width: 'auto' }} />
    </span>
  );
}

/** Logo empilhada: símbolo em cima, palavra embaixo. `w` é a largura do símbolo, em px. */
export function LogoStacked({ w = 240, mono = false }: { w?: number; mono?: boolean }) {
  return (
    <span className="inline-flex flex-col items-center" style={{ gap: w * 0.08 }} role="img" aria-label="Ritmo">
      <Symbol mono={mono} className="block" style={{ width: w, height: 'auto' }} />
      <Wordmark className="block" style={{ width: w * (540 / 689), height: 'auto' }} />
    </span>
  );
}
