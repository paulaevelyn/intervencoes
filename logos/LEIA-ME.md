# Logos dos apps

Esta pasta é a **fonte única** dos logos. Cada arquivo é `logos/<app>.svg` e é usado direto:

- pela página inicial (`index.html`);
- por cada app (favicon, abertura, boas-vindas, menu lateral, tela de login, manifesto e cache offline), que aponta para `../logos/<app>.svg`.

Por isso **trocar um SVG aqui atualiza o logo em todos os lugares**, sem copiar nada.

## Como trocar o logo de um app
1. Substitua `logos/<app>.svg` (mantenha o nome do arquivo) e faça o merge na `main`.
2. **O resto é automático.** O workflow `.github/workflows/gerar-icones.yml` roda sozinho quando um `logos/*.svg` muda na `main`:
   - descobre quais apps mudaram;
   - gera de novo os ícones PNG deles (ícone de instalação do Android, ícone da tela inicial do iPhone e favicon do Safari), que o navegador não aceita em SVG;
   - aumenta o `CACHE_VERSION` do `sw.js` desses apps, para os aparelhos pegarem o logo novo;
   - faz o commit disso na própria `main` ("Ícones dos apps gerados a partir de logos/ [automático]").

   Leva cerca de 2 a 3 minutos. Acompanhe na aba **Actions** do GitHub.

### Se precisar rodar à mão
- Pelo GitHub: aba **Actions** → "Gerar ícones dos apps" → **Run workflow** (dá para escolher os apps e se o cache sobe).
- Pelo terminal:
  ```bash
  node scripts/gerar-icones.js <app> --subir-cache
  ```
  Sem o nome do app, refaz todos. Precisa do Playwright. Faça o commit do SVG e dos PNGs juntos.

### Se o workflow falhar ao commitar
Se a `main` tiver proteção que bloqueia o push do robô, o passo "Commitar o que mudou" falha. Rode o script à mão (acima) e abra um PR com os PNGs.

## Regras para um logo novo
- Quadrado, com `viewBox` quadrado e a placa como **primeiro** `<rect fill="#...">` (o script usa essa cor de fundo nos ícones "maskable" e do iPhone).
- O desenho principal fica dentro dos 80% centrais, a "área segura" que o Android preserva ao recortar o ícone.
- Sem texto dentro do SVG (a fonte não carrega quando o SVG é usado como imagem).
- Dê ao `<svg>` um `role="img"` e um `<title>`.

## Nomes
`farol`, `floresca`, `seguranca-interna`, `matiz`, `aurora`, `sintonia`, `ritmo`, `trilha`.
