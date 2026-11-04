/* ═══════════════════════════════════════════════════════════════════════
   Trilha — treino.js  ·  Treino social e de pensamentos

   Estratégias (a partir dos jogos do Psicoterapia e Afins, sem a pontuação punitiva):
   • Aprendizagem por problema: situação + contexto + escolha de uma ação ou de um pensamento.
   • Feedback explicado para TODAS as opções, cada uma com o rótulo do estilo (assertivo, passivo, etc.).
   • "Para guardar": uma frase de aprendizagem por cenário.
   • Mapa das armadilhas do pensamento (glossário), com a pergunta do detetive.
   • Dificuldade progressiva (níveis 1–3), sem bloqueio.
   • Pensar-sentir-agir em classificação, com "onde você tem mais facilidade" (sem percentual).
   • Micro-ação da semana: vira item das "Ações da semana" (agenda), que é só da pessoa.

   Dados: tudo vai em registros f:'treino' (n números, c escolhas) e nenhum texto livre, então o painel lê
   sem migração nova. Progresso ("Feito", facilidades) é derivado desses registros; não há estado extra.
   Sem placar, sem % de acerto, sem ❌, sem sequência.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

const CEN = window.TRILHA_CENARIOS;
const TODOS_CEN = CEN.SOCIAIS.concat(CEN.PENSAMENTOS);
const NIVEIS_TREINO = { 1: 'Situações simples', 2: 'Do dia a dia', 3: 'Mais difíceis' };
const cenarioPorId = id => TODOS_CEN.find(c => c.id === id);
const armadilhaPorId = id => CEN.ARMADILHAS.find(a => a.id === id);

/* ── Progresso derivado dos registros ────────────────────────────────── */
function regsTreino() { return getRegs().filter(r => r.f === 'treino'); }
function cenFeitos() {                       // { idCenario: { p: 1|0 } }  (primeiro registro de cada um)
  const m = {}; regsTreino().forEach(r => { const id = r.c && r.c.cenario && r.c.cenario[0]; if (id && !m[id]) m[id] = { p: r.n && r.n.p }; }); return m;
}
function psaFeitas() { const s = {}; regsTreino().forEach(r => { const id = r.c && r.c.psa && r.c.psa[0]; if (id) s[id] = 1; }); return s; }
function totaisCategorias() {
  const k = { pens: [0, 0], emo: [0, 0], acao: [0, 0] };
  regsTreino().forEach(r => { if (!(r.c && r.c.psa)) return; ['pens', 'emo', 'acao'].forEach(c => { k[c][0] += (r.n && r.n[c + '_c']) || 0; k[c][1] += (r.n && r.n[c + '_t']) || 0; }); });
  return k;
}
function microAdicionadas() { return rd(K.agenda, []).filter(a => a.o).length; }

/* ── Medalhas do treino (habilidades, não sequência) ─────────────────── */
MEDALHAS.push(
  { id: 'cen5', e: '🎭', n: 'Em cena', d: 'Treinou 5 cenários.', ok: () => Object.keys(cenFeitos()).length >= 5 },
  { id: 'armadilhas8', e: '🪤', n: 'Caçador/a de armadilhas', d: 'Treinou os 8 cenários de pensamentos.', ok: () => CEN.PENSAMENTOS.every(c => cenFeitos()[c.id]) },
  { id: 'psa6', e: '🧩', n: 'Pensar, sentir, agir', d: 'Completou as 6 situações de pensar, sentir e agir.', ok: () => CEN.PSA.every(s => psaFeitas()[s.id]) },
  { id: 'micro3', e: '🌱', n: 'Do pensar ao fazer', d: 'Adicionou 3 micro-ações às suas ações da semana.', ok: () => microAdicionadas() >= 3 }
);

/* ── Hub do treino ───────────────────────────────────────────────────── */
function cartaoCenario(c, feitos) {
  const f = feitos[c.id], rot = c.tipo === 'social' ? c.hab : 'Pensamentos';
  return `<button class="mod" type="button" onclick="abrirCenario('${esc(c.id)}')"><span class="mod-e">${esc(c.e)}</span>
    <span style="flex:1;min-width:0"><span class="mod-n">${esc(rot)}</span><br><span class="mod-t">${esc(c.titulo)}</span>${f ? '<br><span class="mod-tag vis">Feito</span>' : ''}</span></button>`;
}
function secaoCenarios(titulo, lista, feitos) {
  let h = `<div class="fase-h">${esc(titulo)}</div>`;
  [1, 2, 3].forEach(n => {
    const its = lista.filter(c => c.nivel === n); if (!its.length) return;
    h += `<div class="hist-d">Nível ${n} · ${esc(NIVEIS_TREINO[n])}</div>` + its.map(c => cartaoCenario(c, feitos)).join('');
  });
  return h;
}
/* "Onde você tem mais facilidade": linguagem de força, sem percentual e sem nota. */
function facilidadesHTML() {
  const k = totaisCategorias(), nomes = { pens: 'pensamentos', emo: 'emoções e sinais do corpo', acao: 'ações' };
  const total = k.pens[1] + k.emo[1] + k.acao[1], feitos = cenFeitos(), ids = Object.keys(feitos);
  let linhas = '';
  if (total >= 12) {
    const r = ['pens', 'emo', 'acao'].map(c => [c, k[c][1] ? k[c][0] / k[c][1] : 0]).sort((a, b) => b[1] - a[1]);
    linhas += `<p>Você identifica com mais facilidade <strong>${esc(nomes[r[0][0]])}</strong>.` +
      (r[0][1] - r[2][1] >= 0.15 ? ` Vale praticar um pouco mais com <strong>${esc(nomes[r[2][0]])}</strong>, usando as situações dos níveis 2 e 3.` : ' As três partes aparecem de forma parecida para você.') + '</p>';
  }
  if (ids.length >= 3) {
    const diretas = [...new Set(ids.filter(id => feitos[id].p === 1).map(id => { const c = cenarioPorId(id); return c ? (c.tipo === 'social' ? c.hab : 'Pensamentos equilibrados') : null; }).filter(Boolean))];
    const explorar = [...new Set(ids.filter(id => feitos[id].p === 0).map(id => { const c = cenarioPorId(id); return c ? (c.tipo === 'social' ? c.hab : 'Pensamentos equilibrados') : null; }).filter(Boolean))];
    if (diretas.length) linhas += `<p>Onde você foi direto ao ponto: <strong>${esc(diretas.join(', '))}</strong>.</p>`;
    if (explorar.length) linhas += `<p>Para explorar mais: <strong>${esc(explorar.join(', '))}</strong>. Rever as explicações ajuda.</p>`;
  }
  return linhas ? `<div class="tr-card"><div class="tr-lbl">Onde você tem mais facilidade</div>${linhas}<p class="pv-txt">Não é nota: é um retrato para você e sua psicóloga conversarem.</p></div>` : '';
}
function renderTreino() {
  const feitos = cenFeitos(), psa = psaFeitas();
  let h = `<div class="hdr"><h1>🎮 Treino</h1><p>Pratique situações reais, sem nota e no seu ritmo.</p></div><div style="height:12px"></div>
    <div class="insight-c"><div class="insight-t">Como funciona</div><div class="insight-b">Você vê uma situação, escolhe como agiria e depois entende o porquê de <strong>cada</strong> opção. Não tem placar: o objetivo é aprender. Comece pelo nível 1 e suba quando quiser. Nada fica bloqueado.</div></div>`;
  h += facilidadesHTML();
  h += secaoCenarios('🗣️ Cenários sociais', CEN.SOCIAIS, feitos);
  h += secaoCenarios('💭 Cenários de pensamentos', CEN.PENSAMENTOS, feitos);
  h += `<div class="fase-h">🧩 Pensar, sentir e agir</div>` + [1, 2, 3].map(n => `<div class="hist-d">Nível ${n} · ${esc(NIVEIS_TREINO[n])}</div>` +
    CEN.PSA.filter(s => s.nivel === n).map(s => `<button class="mod" type="button" onclick="abrirPSA('${esc(s.id)}')"><span class="mod-e">${esc(s.e)}</span>
      <span style="flex:1;min-width:0"><span class="mod-n">Classificação</span><br><span class="mod-t">${esc(s.titulo)}</span>${psa[s.id] ? '<br><span class="mod-tag vis">Feito</span>' : ''}</span></button>`).join('')).join('');
  h += `<div class="fase-h">📖 Para consultar</div><button class="mod" type="button" onclick="goTo('armadilhas')"><span class="mod-e">🪤</span><span style="flex:1;min-width:0"><span class="mod-n">Glossário</span><br><span class="mod-t">Mapa das armadilhas do pensamento</span></span></button>`;
  $('tr-wrap').innerHTML = h;
}
function treinoHomeHTML() {
  const feitos = cenFeitos(), prox = TODOS_CEN.slice().sort((a, b) => a.nivel - b.nivel).find(c => !feitos[c.id]);
  if (!prox) return `<div class="tr-card suave"><div class="tr-lbl">Treino</div><h3>🎮 Treino livre</h3><p>Você já passou por todos os cenários. Dá para rever os que quiser.</p><div class="tr-acoes"><button class="tr-btn ghost" type="button" onclick="goTo('treino')">Abrir o treino</button></div></div>`;
  return `<div class="tr-card suave"><div class="tr-lbl">Treino rápido · 2 minutos</div><h3>${esc(prox.e)} ${esc(prox.titulo)}</h3><p>Uma situação para praticar, com explicação de cada opção.</p>
    <div class="tr-acoes"><button class="tr-btn" type="button" onclick="abrirCenario('${esc(prox.id)}')">Treinar</button><button class="tr-btn ghost" type="button" onclick="goTo('treino')">Ver todos</button></div></div>`;
}
function linksTreinoHTML(modId) {
  const mapa = { 2: ["abrirPSA('psa_1')", '🧩 Treinar pensar, sentir e agir'], 9: ["goTo('armadilhas')", '🪤 Mapa das armadilhas do pensamento'], 12: ["goTo('treino')", '🗣️ Cenários sociais'] };
  return mapa[modId] ? `<div class="tr-card suave"><div class="tr-lbl">Para treinar mais</div><div class="tr-acoes"><button class="tr-btn ghost" type="button" onclick="${mapa[modId][0]}">${mapa[modId][1]}</button></div></div>` : '';
}

/* ── Cenário ─────────────────────────────────────────────────────────── */
let _cn = null;
function abrirCenario(id) {
  const c = cenarioPorId(id); if (!c) return;
  _cn = { c: c, ordem: embaralha(c.ops.map((_, i) => i)), resp: null, micro: false }; goTo('cenario'); renderCenario();
}
function renderCenario() {
  const c = _cn.c, w = $('cn-wrap'), ok = _cn.resp !== null, escolhida = ok ? c.ops[_cn.resp] : null, arm = c.tipo === 'pens' ? armadilhaPorId(c.arm) : null;
  let h = `<div class="hdr"><h1>${esc(c.e)} ${esc(c.titulo)}</h1><p>${c.tipo === 'social' ? esc(c.hab) : 'Pensamentos'} · Nível ${c.nivel}</p></div><div style="height:12px"></div>
    <div class="bloco"><h3>Situação</h3><p>${esc(c.situacao)}</p>${c.contexto ? `<div class="cn-ctx">🔍 <strong>Contexto:</strong> ${esc(c.contexto)}</div>` : ''}
    ${c.pens ? `<div class="cn-pens"><span>O pensamento que passa pela cabeça:</span>${esc(c.pens)}</div>` : ''}
    ${c.dicaSocial ? `<details class="cn-dica"><summary>🔍 Dica de leitura social</summary><p>${esc(c.dicaSocial)}</p></details>` : ''}</div>
    <div class="campo"><div class="form-lbl">${c.tipo === 'social' ? 'O que você faria?' : 'Qual pensamento ajuda mais?'}</div></div><div class="cn-ops">`;
  _cn.ordem.forEach(i => {
    const o = c.ops[i];
    if (!ok) h += `<button type="button" class="cn-op" onclick="responderCenario(${i})">${esc(o.t)}</button>`;
    else h += `<div class="cn-op fim${o.ok ? ' ok' : ''}${i === _cn.resp ? ' esc' : ''}"><div class="cn-t">${esc(o.t)}</div><span class="cn-rot${o.ok ? ' ok' : ''}">${esc(o.r)}</span>
      <div class="cn-x">${i === _cn.resp ? '<strong>Você escolheu esta. </strong>' : ''}${esc(o.x)}</div></div>`;
  });
  h += '</div>';
  if (ok) {
    h += `<div class="tr-card"><div class="tr-lbl">${escolhida.ok ? 'Boa escolha' : 'Vamos olhar juntos'}</div><p>${escolhida.ok ? 'Você foi direto ao ponto. Veja por que cada opção funciona (ou não) e guarde a ideia.' : 'Todas as opções fazem sentido para alguém. Repare no que muda em cada uma e guarde a ideia.'}</p></div>
      <div class="tr-card"><div class="tr-lbl">Para guardar</div><p>${esc(c.dica)}</p>
      ${arm ? `<div class="tr-acoes"><button class="tr-btn ghost" type="button" onclick="_arAberta='${esc(arm.id)}';goTo('armadilhas')">${esc(arm.e)} Armadilha: ${esc(arm.n)}</button></div>` : ''}</div>`;
    h += _cn.micro ? `<div class="tr-card suave"><div class="tr-lbl">Micro-ação</div><p>✓ Adicionada às suas ações da semana. Só você vê.</p></div>`
      : `<div class="tr-card"><div class="tr-lbl">Micro-ação da semana</div><p>Aprender vira hábito quando vira ação. Quer testar algo pequeno esta semana?</p>
        <input type="text" id="mi-txt" maxlength="${MAXTXT}" autocomplete="off" aria-label="Micro-ação" value="${esc(c.micro)}" style="margin-top:8px">
        <div class="tr-acoes"><button class="tr-btn" type="button" onclick="addMicro()">Adicionar às minhas ações</button></div></div>`;
    const lista = c.tipo === 'social' ? CEN.SOCIAIS : CEN.PENSAMENTOS, feitos = cenFeitos(), prox = lista.slice().sort((a, b) => a.nivel - b.nivel).find(x => x.id !== c.id && !feitos[x.id]);
    h += `<div class="tr-acoes" style="padding:0 var(--pg) 16px"><button class="tr-btn ghost" type="button" onclick="abrirCenario('${esc(c.id)}')">Ver de novo</button>
      ${prox ? `<button class="tr-btn" type="button" onclick="abrirCenario('${esc(prox.id)}')">Próximo cenário</button>` : ''}<button class="tr-btn ghost" type="button" onclick="goTo('treino')">Voltar ao treino</button></div>`;
  }
  w.innerHTML = h; window.scrollTo(0, 0);
}
function responderCenario(i) {
  if (_cn.resp !== null) return; _cn.resp = i; const c = _cn.c;
  if (!cenFeitos()[c.id]) {                      // só a primeira vez grava (p = a primeira escolha foi a mais útil)
    const rec = novoRegistro('treino'); rec.n.p = c.ops[i].ok ? 1 : 0; rec.c.cenario = [c.id]; rec.c.tipo = [c.tipo === 'social' ? 'social' : 'pensamento'];
    guardarRegistro(rec); concluirTarefa(); jogoAtualiza(J => ptsAdd(J, 'cen:' + c.id, 10));
  }
  renderCenario();
}
function addMicro() {
  const v = ($('mi-txt').value || '').trim().slice(0, MAXTXT); if (!v) { toast('Escreva a micro-ação.'); return; }
  const c = _cn.c, l = rd(K.agenda, []);
  l.push({ id: uid(), ts: Date.now(), t: { acao: v }, c: { tipo: [c.tipo === 'social' ? 'gente' : 'importa'] }, feito: null, o: c.id });
  wr(K.agenda, l); _cn.micro = true; jogoAtualiza(J => ptsAdd(J, 'micro:' + c.id, 5)); renderCenario();
}

/* ── Mapa das armadilhas ─────────────────────────────────────────────── */
function renderArmadilhas() {
  const feitos = cenFeitos(), treinadas = {}; CEN.PENSAMENTOS.forEach(c => { if (feitos[c.id]) treinadas[c.arm] = 1; });
  $('ar-wrap').innerHTML = `<div class="hdr"><h1>🪤 Mapa das armadilhas</h1><p>Os atalhos que a mente toma, e como sair deles.</p></div><div style="height:12px"></div>
    <div class="insight-c"><div class="insight-t">Como usar</div><div class="insight-b">Quando um pensamento pesado aparecer, veja se ele combina com alguma armadilha. Dar nome já tira parte da força. Depois, faça a <strong>pergunta do detetive</strong> e procure um pensamento mais equilibrado, que combine com as provas.</div></div>` +
    CEN.ARMADILHAS.map(a => `<details class="ar"${_arAberta === a.id ? ' open' : ''}><summary><span>${esc(a.e)}</span> ${esc(a.n)}${treinadas[a.id] ? ' <em>· já treinei</em>' : ''}</summary>
      <p><strong>Como soa:</strong> ${esc(a.soa)}</p><p><strong>Pergunta do detetive:</strong> ${esc(a.pergunta)}</p><p><strong>Pensamento mais equilibrado:</strong> ${esc(a.eq)}</p></details>`).join('') +
    `<div class="tr-acoes" style="padding:8px var(--pg) 16px"><button class="tr-btn" type="button" onclick="openTool('detetive')">🕵️ Usar o detetive agora</button><button class="tr-btn ghost" type="button" onclick="goTo('treino')">Treinar com cenários</button></div>`;
}
let _arAberta = null;

/* ── Pensar, sentir e agir (classificação progressiva) ───────────────── */
let _ps = null;
function abrirPSA(id) { const i = CEN.PSA.findIndex(s => s.id === id); if (i < 0) return; _ps = { i: i }; goTo('psa'); renderPSA(); }
function renderPSA() {
  const w = $('ps-wrap'), s = CEN.PSA[_ps.i], head = `<div class="hdr"><h1>🧩 Pensar, sentir e agir</h1><p>Nível ${s.nivel} · ${esc(NIVEIS_TREINO[s.nivel])} · situação ${_ps.i + 1} de ${CEN.PSA.length}</p></div><div style="height:12px"></div>`;
  w.innerHTML = head + `<div class="bloco"><h3>${esc(s.e)} ${esc(s.titulo)}</h3><p>${esc(s.situacao)}</p></div><div class="bloco"><div id="ps-q"></div></div>
    <p class="pv-txt" style="padding:0 var(--pg)">Use de forma leve e curiosa: não precisa acertar tudo. O objetivo é entender como a mente funciona.</p>`;
  renderQuestao($('ps-q'), { tipo: 'sort', q: 'Toque para dizer o que é pensamento, emoção e ação nesta situação.', cats: CEN.PSA_CATS, itens: s.itens, fb: CEN.PSA_FB }, (ok, det) => {
    if (!psaFeitas()[s.id]) {
      const rec = novoRegistro('treino'); rec.n.p = ok ? 1 : 0; rec.c.psa = [s.id]; rec.c.tipo = ['psa'];
      ['pens', 'emo', 'acao'].forEach(c => { const d = (det || []).filter(x => x.c === c); rec.n[c + '_t'] = d.length; rec.n[c + '_c'] = d.filter(x => x.ok).length; });
      guardarRegistro(rec); concluirTarefa(); jogoAtualiza(J => ptsAdd(J, 'psa:' + s.id, 10));
    }
    if (_ps.i < CEN.PSA.length - 1) { _ps.i++; renderPSA(); return; }
    w.innerHTML = head.replace(/situação \d+ de \d+/, 'concluído') + `<div class="tr-card"><h3>Situações concluídas 🎉</h3><p>Agora, reflita: quais partes foram mais fáceis de identificar, os pensamentos, as emoções ou as ações? Alguma coisa te surpreendeu?</p>
      <p>Leve essas observações para a sua próxima sessão. Reconhecer o que você pensa, sente e faz é o primeiro passo para mudar padrões automáticos.</p>
      <div class="tr-acoes"><button class="tr-btn" type="button" onclick="goTo('treino')">Voltar ao treino</button><button class="tr-btn ghost" type="button" onclick="openTool('checkin')">🌡️ Fazer um check-in</button></div></div>`;
  });
}
