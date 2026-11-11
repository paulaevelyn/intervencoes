import { useEffect, useState } from 'react';
import { LogoStacked } from './Logo';

/** Tela de abertura. Aparece uma vez por sessão, por pouco tempo, e some com um toque ou tecla. */
export function Splash() {
  const [on, setOn] = useState(() => {
    try { if (sessionStorage.getItem('ritmo:splash')) return false; } catch { /* sem armazenamento */ }
    return performance.now() < 1300;
  });
  useEffect(() => {
    if (!on) return;
    try { sessionStorage.setItem('ritmo:splash', '1'); } catch { /* ok */ }
    const t = window.setTimeout(() => setOn(false), Math.max(150, 1300 - performance.now()));
    const k = () => setOn(false);
    window.addEventListener('keydown', k);
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', k); };
  }, [on]);
  if (!on) return null;
  return (
    <div className="rs-wrap" onClick={() => setOn(false)} role="status" aria-label="Ritmo, por Psicoterapia e Afins">
      <LogoStacked w={250} />
      <p className="rs-por" aria-hidden="true">por Psicoterapia e Afins</p>
    </div>
  );
}
