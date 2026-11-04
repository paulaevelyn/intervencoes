import { useEffect, useState } from 'react';

export interface Route { parts: string[]; q: URLSearchParams; path: string }

function parse(): Route {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = h.split('?');
  return { path, parts: path.split('/').filter(Boolean), q: new URLSearchParams(query) };
}

export function useRoute(): Route {
  const [r, setR] = useState<Route>(parse);
  useEffect(() => {
    const on = () => setR(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

export const go = (to: string) => {
  location.hash = to;
};
export const back = (fallback = '/') => {
  if (history.length > 1) history.back();
  else go(fallback);
};
