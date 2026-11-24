# Logos dos apps

Esta pasta é a **fonte única** dos logos. Cada arquivo é `logos/<app>.svg` e é usado direto:

- pela página inicial (`index.html`);
- por cada app (favicon, abertura, boas-vindas, menu lateral, tela de login, manifesto e cache offline), que aponta para `../logos/<app>.svg`.

Por isso **trocar um SVG aqui atualiza o logo em todos os lugares**, sem copiar nada.

## Como trocar o logo de um app
1. Substitua `logos/<app>.svg` (mantenha o nome do arquivo).
2. Gere de novo os ícones PNG, que o navegador não aceita em SVG (ícone de instalação do Android, ícone da tela inicial do iPhone e favicon do Safari):
   ```bash
   node scripts/gerar-icones.js <app>
   ```
   Sem o nome do app, ele refaz todos.
3. Aumente o número do `CACHE_VERSION` em `<app>/sw.js` (no Ritmo, `CACHE` em `ritmo/sw.js` e `ritmo/fonte/public/sw.js`), para os aparelhos pegarem o logo novo.
4. Faça o commit do SVG e dos PNGs juntos.

## Regras para um logo novo
- Quadrado, com `viewBox` quadrado e a placa como **primeiro** `<rect fill="#...">` (o script usa essa cor de fundo nos ícones "maskable" e do iPhone).
- O desenho principal fica dentro dos 80% centrais, a "área segura" que o Android preserva ao recortar o ícone.
- Sem texto dentro do SVG (a fonte não carrega quando o SVG é usado como imagem).
- Dê ao `<svg>` um `role="img"` e um `<title>`.

## Nomes
`farol`, `floresca`, `seguranca-interna`, `matiz`, `aurora`, `sintonia`, `ritmo`, `trilha`.
