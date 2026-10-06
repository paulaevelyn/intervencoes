/* bemestar.js — bem-estar digital e design compassivo (camada compartilhada por todos os apps).
   Carregada por auth/auth.js. Não depende de nenhum app e não guarda nada fora do aparelho.

   O QUE FAZ
   1. Barra de progresso da tela: mostra o quanto da tela já foi percorrido (os celulares escondem a
      barra de rolagem nativa), e um botão "Topo" depois de rolar um pouco. Funciona com os dois jeitos
      de rolar que os apps usam: um contêiner interno (.scr) ou a própria janela.
   2. Painel "Cuidado digital" (botão ⚙ ao lado de "conta"): o que o app promete, ajuda em crise
      (188 e 192) e três ajustes: menos movimento, barra de progresso, lembrete de pausa.
   3. Lembrete de pausa: depois de ~20 minutos de uso contínuo, um convite discreto, que não bloqueia
      nada e pode ser dispensado para sempre. Pausa guiada de 1 minuto, sem cobrança.
   4. Menos movimento: segue o sistema (prefers-reduced-motion) e pode ser ligado ou desligado.

   Ajustes ficam em localStorage ('pea_bemestar'), compartilhados por todos os apps do mesmo endereço. */
(function (global) {
  'use strict';
  if (global.PeaBemEstar) return;

  var CHAVE = 'pea_bemestar';
  var MIN_PAUSA = 20;                       // minutos de uso contínuo até o convite de pausa
  var raiz = document.documentElement;

  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function gravar(o) { try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) { /* sem armazenamento: vale só nesta visita */ } }
  var cfg = ler();
  function barraLigada() { return cfg.barra !== false; }
  function pausasLigadas() { return cfg.pausas !== false; }
  function movimentoReduzido() { return cfg.calmo === true || (cfg.calmo == null && matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function el(tag, props, txt) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) { if (k === 'class') e.className = props[k]; else e.setAttribute(k, props[k]); });
    if (txt) e.textContent = txt;
    for (var i = 3; i < arguments.length; i++) if (arguments[i]) e.appendChild(arguments[i]);
    return e;
  }

  function aplicarMovimento() {
    raiz.classList.toggle('pea-calmo', cfg.calmo === true);
    raiz.classList.toggle('pea-mov-ok', cfg.calmo === false);   // o usuário pediu movimento mesmo com o sistema em "menos movimento"
  }

  /* ── 1. Barra de progresso e botão Topo ─────────────────────────────── */
  var barra, miolo, topo, atual = null;
  function rolador() {
    // O contêiner que rola agora: a tela ativa (.scr.on), se rolável; senão, a janela.
    var s = document.querySelector('.scr.on');
    if (s && s.scrollHeight > s.clientHeight + 8) return s;
    return document.scrollingElement || document.documentElement;
  }
  function medir(alvo) {
    if (!alvo || alvo === document) alvo = document.scrollingElement || document.documentElement;
    if (alvo === document.body) alvo = document.scrollingElement || document.documentElement;
    var max = alvo.scrollHeight - alvo.clientHeight;
    return { alvo: alvo, max: max, p: max > 8 ? Math.min(1, Math.max(0, alvo.scrollTop / max)) : 0, top: alvo.scrollTop };
  }
  function desenhar(m) {
    if (!barra) return;
    var rolavel = m.max > 8 && barraLigada();
    barra.classList.toggle('on', rolavel);
    miolo.style.width = (m.p * 100).toFixed(1) + '%';
    barra.setAttribute('aria-valuenow', String(Math.round(m.p * 100)));
    topo.classList.toggle('on', m.top > 400 && barraLigada());
  }
  function aoRolar(ev) { var m = medir(ev.target); atual = m.alvo; desenhar(m); }
  function recalcular() { var a = rolador(); atual = a; desenhar(medir(a)); }
  function montarRolagem() {
    barra = el('div', { id: 'pea-prog', role: 'progressbar', 'aria-label': 'Quanto da tela você já percorreu', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' });
    miolo = el('i'); barra.appendChild(miolo);
    topo = el('button', { id: 'pea-topo', type: 'button', 'aria-label': 'Voltar ao topo da tela' }, '↑ Topo');
    topo.addEventListener('click', function () {
      var a = atual || rolador();
      try { a.scrollTo({ top: 0, behavior: movimentoReduzido() ? 'auto' : 'smooth' }); } catch (e) { a.scrollTop = 0; }
    });
    document.body.appendChild(barra); document.body.appendChild(topo);
    document.addEventListener('scroll', aoRolar, true);          // captura: os scrolls dos contêineres internos não "borbulham"
    // Trocar de tela (clique, teclado, histórico) muda o contêiner: recalcula logo depois.
    ['click', 'keyup', 'popstate', 'resize'].forEach(function (t) { global.addEventListener(t, function () { setTimeout(recalcular, 90); }, true); });
    setTimeout(recalcular, 400);
  }

  /* ── 2. Painel "Cuidado digital" ────────────────────────────────────── */
  var ov = null;
  function linhaAjuste(titulo, dica, marcado, aoMudar) {
    var cb = el('input', { type: 'checkbox' }); cb.checked = marcado; cb.addEventListener('change', function () { aoMudar(cb.checked); });
    var id = 'pea-aj-' + Math.random().toString(36).slice(2, 7); cb.id = id;
    var lab = el('label', { for: id }, titulo, el('small', {}, dica));
    return el('div', { class: 'pea-bem-linha' }, lab, cb);
  }
  function fechar() { if (ov) { ov.remove(); ov = null; } }
  function abrir() {
    fechar();
    var cx = el('div', { class: 'pea-bem-cx', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pea-bem-t' });
    cx.appendChild(el('h2', { id: 'pea-bem-t' }, 'Cuidado digital'));
    cx.appendChild(el('p', {}, 'Como este app tenta cuidar de você, e não do seu tempo de tela:'));
    var ul = el('ul');
    ['Sem anúncios, sem rolagem infinita e sem feed. O objetivo é ajudar e deixar você livre, não prender a sua atenção.',
     'Notificações só se você pedir, no máximo uma por dia e sem cobrança.',
     'Dias difíceis fazem parte do processo e não apagam o que você já fez.',
     'Seus dados são seus: ficam no seu aparelho ou na sua conta, e você pode baixar ou apagar quando quiser.',
     'Você pode parar a qualquer momento. Pausas são bem-vindas.'].forEach(function (t) { ul.appendChild(el('li', {}, t)); });
    cx.appendChild(ul);

    var ajuda = el('div', { class: 'pea-bem-ajuda' });
    ajuda.appendChild(document.createTextNode('Precisa de ajuda agora? Ligue '));
    var a1 = el('a', { href: 'tel:188' }, '188 (CVV)'); ajuda.appendChild(a1);
    ajuda.appendChild(document.createTextNode(', gratuito, 24 horas, ou '));
    var a2 = el('a', { href: 'tel:192' }, '192 (SAMU)'); ajuda.appendChild(a2);
    ajuda.appendChild(document.createTextNode('. Você não precisa explicar tudo.'));
    cx.appendChild(ajuda);
    /* Quem caminha com você: opcional, só neste aparelho, nunca enviado a lugar nenhum */
    var ap = el('div', { class: 'pea-bem-apoio' });
    ap.appendChild(el('strong', {}, 'Quem caminha com você (opcional)'));
    ap.appendChild(el('small', {}, 'Ter alguém por perto ajuda. Se quiser, anote o nome de uma pessoa de confiança. Fica só neste aparelho.'));
    var nome = el('input', { type: 'text', maxlength: '40', placeholder: 'Ex.: minha irmã, um amigo', 'aria-label': 'Pessoa de apoio' }); nome.value = cfg.apoio || '';
    nome.addEventListener('change', function () { cfg.apoio = nome.value.trim(); gravar(cfg); });
    ap.appendChild(nome);
    var MODELOS = ['Oi! Estou fazendo um programa para cuidar de mim. Podemos conversar um pouco hoje?',
                   'Hoje não está um dia fácil. Você pode ficar comigo um tempinho, mesmo sem falar de nada em especial?',
                   'Fiz uma coisa por mim hoje e queria te contar.'];
    var sel = el('select', { 'aria-label': 'Mensagem pronta' });
    ['Uma conversa', 'Um dia difícil', 'Contar uma conquista'].forEach(function (t, i) { var o = el('option', { value: String(i) }, t); sel.appendChild(o); });
    ap.appendChild(sel);
    var env = el('button', { class: 'pea-bem-btn sec', type: 'button' }, 'Enviar uma mensagem pronta');
    env.addEventListener('click', function () {
      var txt = MODELOS[+sel.value];
      if (navigator.share) { navigator.share({ text: txt }).catch(function () { /* cancelado */ }); return; }
      try { navigator.clipboard.writeText(txt).then(function () { env.textContent = 'Mensagem copiada. Cole onde preferir.'; }); } catch (e) { env.textContent = txt; }
    });
    ap.appendChild(env);
    cx.appendChild(ap);


    cx.appendChild(linhaAjuste('Menos movimento', 'Reduz animações e rolagem suave. Segue a configuração do seu aparelho, a menos que você escolha aqui.', movimentoReduzido(), function (v) { cfg.calmo = v; gravar(cfg); aplicarMovimento(); }));
    cx.appendChild(linhaAjuste('Barra de progresso da tela', 'Mostra no topo o quanto você já percorreu, e um botão para voltar ao início.', barraLigada(), function (v) { cfg.barra = v; gravar(cfg); recalcular(); }));
    cx.appendChild(linhaAjuste('Convite de pausa', 'Depois de cerca de ' + MIN_PAUSA + ' minutos de uso, um convite gentil para respirar e descansar. Não bloqueia nada.', pausasLigadas(), function (v) { cfg.pausas = v; gravar(cfg); }));

    var fecharBtn = el('button', { class: 'pea-bem-btn', type: 'button' }, 'Fechar'); fecharBtn.addEventListener('click', fechar);
    var pausa = el('button', { class: 'pea-bem-btn sec', type: 'button' }, 'Fazer uma pausa de 1 minuto'); pausa.addEventListener('click', function () { fechar(); pausaGuiada(); });
    cx.appendChild(pausa); cx.appendChild(fecharBtn);
    ov = el('div', { id: 'pea-bem-ov', class: 'on' }, '', cx);
    ov.addEventListener('click', function (e) { if (e.target === ov) fechar(); });
    document.addEventListener('keydown', escFecha);
    document.body.appendChild(ov); fecharBtn.focus();
  }
  function escFecha(e) { if (e.key === 'Escape') { fechar(); document.removeEventListener('keydown', escFecha); } }

  /* ── 3. Pausa ───────────────────────────────────────────────────────── */
  var convite = null, segundos = 0, avisou = false;
  function pausaGuiada() {
    fechar();
    var cx = el('div', { class: 'pea-bem-cx', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Pausa de um minuto' });
    cx.appendChild(el('h2', {}, 'Uma pausa de 1 minuto'));
    cx.appendChild(el('p', {}, 'Se quiser, solte os ombros, apoie os pés no chão e respire devagar: inspire pelo nariz contando até 4 e solte o ar pela boca, devagar. Sem pressa e sem fazer certo.'));
    cx.appendChild(el('div', { class: 'pea-resp', 'aria-hidden': 'true' }));
    var fim = el('button', { class: 'pea-bem-btn', type: 'button' }, 'Voltar'); fim.addEventListener('click', fechar);
    cx.appendChild(fim);
    ov = el('div', { id: 'pea-bem-ov', class: 'on' }, '', cx);
    document.body.appendChild(ov); fim.focus();
  }
  function mostrarConvite() {
    if (convite || !pausasLigadas()) return;
    convite = el('div', { id: 'pea-pausa', class: 'on', role: 'status' });
    convite.appendChild(el('strong', {}, 'Você está aqui há um tempo'));
    convite.appendChild(document.createTextNode('Que tal uma pausa para respirar, beber água ou se alongar? Você pode voltar quando quiser.'));
    var b1 = el('button', { class: 'pea-bem-btn', type: 'button' }, 'Fazer uma pausa de 1 minuto');
    var b2 = el('button', { class: 'pea-bem-btn sec', type: 'button' }, 'Continuar mais um pouco');
    var b3 = el('button', { class: 'pea-bem-btn sec', type: 'button' }, 'Não me lembrar disso');
    b1.addEventListener('click', function () { dispensar(); pausaGuiada(); });
    b2.addEventListener('click', function () { dispensar(); segundos = 0; avisou = false; });
    b3.addEventListener('click', function () { dispensar(); cfg.pausas = false; gravar(cfg); });
    convite.appendChild(b1); convite.appendChild(b2); convite.appendChild(b3);
    document.body.appendChild(convite);
  }
  function dispensar() { if (convite) { convite.remove(); convite = null; } }
  function relogio() {
    // Conta só o tempo com a página visível; cada ida e volta de segundo plano não zera nem acelera o relógio.
    if (document.visibilityState !== 'visible') return;
    segundos++;
    if (!avisou && segundos >= MIN_PAUSA * 60 && pausasLigadas() && !document.documentElement.classList.contains('pea-auth-carregando')) { avisou = true; mostrarConvite(); }
  }

  /* ── Partida ────────────────────────────────────────────────────────── */
  function iniciar() {
    aplicarMovimento();
    montarRolagem();
    setInterval(relogio, 1000);
  }
  if (document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);

  global.PeaBemEstar = { abrir: abrir, pausa: pausaGuiada, recalcular: recalcular, convite: mostrarConvite, _config: function () { return cfg; } };
})(window);
