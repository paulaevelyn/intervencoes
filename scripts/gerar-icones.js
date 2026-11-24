#!/usr/bin/env node
/* gerar-icones.js — gera os ícones PNG de todos os apps a partir de logos/<app>.svg.

   POR QUE EXISTE
   Os SVGs de logos/ são a fonte única: a página inicial e os apps usam esses arquivos direto, então
   trocar um SVG já atualiza o logo em todo lugar. O que o navegador NÃO aceita em SVG, e por isso é
   gerado aqui: ícone de instalação do Android (192, 512 e "maskable"), ícone da tela inicial do iPhone
   (apple-touch-icon) e favicon PNG (Safari).

   COMO USAR
     node scripts/gerar-icones.js                         gera os PNGs de todos os apps
     node scripts/gerar-icones.js farol                   só de um app
     node scripts/gerar-icones.js farol aurora --subir-cache   também aumenta o cache offline (sw.js) desses apps
   Na prática isso roda sozinho: o workflow .github/workflows/gerar-icones.yml chama este script quando um
   logos/*.svg muda na main.
   Precisa do Playwright (npm i -D playwright, e npx playwright install chromium) ou do que já vem no ambiente.
   Rodando à mão: faça commit dos PNGs junto com o SVG (e use --subir-cache para os aparelhos pegarem o ícone
   novo). Ver logos/LEIA-ME.md. */
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const RAIZ = path.resolve(__dirname, '..');

// app -> pastas que recebem os PNGs (o Ritmo tem a pasta do app compilado e a do código-fonte)
const APPS = {
  farol: ['farol'], floresca: ['floresca'], aurora: ['aurora'], sintonia: ['sintonia'], trilha: ['trilha'],
  matiz: ['matiz'], 'seguranca-interna': ['seguranca-interna'], ritmo: ['ritmo', 'ritmo/fonte/public']
};
// service workers de cada app (Matiz e Segurança Interna não têm)
const SW = { ritmo: ['ritmo/sw.js', 'ritmo/fonte/public/sw.js'] };
function swsDe(a) { return (SW[a] || [a + '/sw.js']).filter((f) => fs.existsSync(path.join(RAIZ, f))); }
// "const CACHE_VERSION = 'farol-v15'" (ou "const CACHE = 'ritmo-v11'") -> sobe o número
function subirCache(arquivo) {
  const p = path.join(RAIZ, arquivo); const s = fs.readFileSync(p, 'utf8');
  const m = s.match(/(CACHE_VERSION|CACHE)(\s*=\s*')([a-z-]+-v)(\d+)(')/);
  if (!m) { console.error('cache não encontrado em', arquivo); return; }
  fs.writeFileSync(p, s.replace(m[0], m[1] + m[2] + m[3] + (Number(m[4]) + 1) + m[5]));
  console.log('cache', arquivo, m[3] + m[4], '->', m[3] + (Number(m[4]) + 1));
}
// o Ritmo não usa apple-touch-icon
const SEM_APPLE = new Set(['ritmo']);

// cor da placa = a do primeiro retângulo do SVG; vira o fundo dos ícones "maskable" e do iPhone
function corDaPlaca(svg) {
  const m = svg.match(/<rect[^>]*fill="(#[0-9a-fA-F]{3,8})"/);
  return m ? m[1] : '#0F3D33';
}

(async () => {
  const args = process.argv.slice(2); const subir = args.includes('--subir-cache');
  const pedidos = args.filter((x) => !x.startsWith('--')); const alvo = pedidos.length ? pedidos : Object.keys(APPS);
  for (const a of alvo) if (!APPS[a]) { console.error('app desconhecido:', a, '| válidos:', Object.keys(APPS).join(', ')); process.exit(1); }
  const b = await chromium.launch(); const p = await b.newPage();
  async function png(svg, saida, n, fundo) {
    await p.setViewportSize({ width: n, height: n });
    await p.setContent(`<style>html,body{margin:0;background:${fundo || 'transparent'}}svg{display:block;width:${n}px;height:${n}px}</style>` + svg);
    await p.screenshot({ path: saida, omitBackground: !fundo, clip: { x: 0, y: 0, width: n, height: n } });
  }
  for (const a of alvo) {
    const origem = path.join(RAIZ, 'logos', a + '.svg');
    if (!fs.existsSync(origem)) { console.error('falta', origem); process.exit(1); }
    const svg = fs.readFileSync(origem, 'utf8'); const fundo = corDaPlaca(svg);
    for (const d of APPS[a]) {
      const dir = path.join(RAIZ, d);
      await png(svg, path.join(dir, 'icon-192.png'), 192);
      await png(svg, path.join(dir, 'icon-512.png'), 512);
      await png(svg, path.join(dir, 'icon-maskable-512.png'), 512, fundo);   // fundo cheio: o Android recorta em círculo, quadrado etc.
      await png(svg, path.join(dir, 'favicon-32.png'), 32);
      if (!SEM_APPLE.has(a)) await png(svg, path.join(dir, 'apple-touch-icon.png'), 180, fundo);   // o iPhone não aceita transparência
    }
    if (subir) swsDe(a).forEach(subirCache);
    console.log('ok', a);
  }
  await b.close();
})();
