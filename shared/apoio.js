/* apoio.js — três pequenos recursos de cuidado, compartilhados por todos os apps (carregado por auth/auth.js).
   Sem rede, sem conta: tudo fica no aparelho.

   PeaApoio.porQue(texto)        -> HTML de um "Por que isso?" recolhido (autonomia: a pessoa entende o sentido e decide).
   PeaApoio.quandoOnde(id)       -> HTML de "Quando e onde você vai fazer?" (2 campos, opcionais; plano de implementação, COM-B).
   PeaApoio.lerQuandoOnde(id)    -> { quando, onde, frase } com o que foi escrito (frase vazia se nada foi preenchido).
   PeaApoio.apoio(contexto)      -> HTML de "Uma pessoa de apoio (opcional)": a pessoa guarda o nome de alguém de confiança
                                    neste aparelho e pode copiar/compartilhar uma frase pronta. Nada é enviado por nós.
   Os textos passados são do próprio app (confiáveis); o que a pessoa digita só entra por .value / textContent. */
(function (global) {
  'use strict';
  if (global.PeaApoio) return;

  var CHAVE = 'pea_apoio';
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function gravar(o) { try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) { /* sem armazenamento: vale só nesta visita */ } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function porQue(texto) {
    return '<details class="pea-porque"><summary>Por que isso?</summary><p>' + texto +
           '<small>Você decide se e como fazer. Pode pular, adaptar ou voltar depois.</small></p></details>';
  }

  function quandoOnde(id) {
    return '<div class="pea-qo" id="pea-qo-' + esc(id) + '"><b>Quando e onde você vai fazer? (opcional)</b>' +
      '<label for="pea-qo-' + esc(id) + '-q">Quando (um momento do seu dia)</label>' +
      '<input id="pea-qo-' + esc(id) + '-q" type="text" maxlength="80" autocomplete="off" placeholder="Ex.: depois do café, ao chegar em casa">' +
      '<label for="pea-qo-' + esc(id) + '-o">Onde</label>' +
      '<input id="pea-qo-' + esc(id) + '-o" type="text" maxlength="80" autocomplete="off" placeholder="Ex.: na varanda, no ônibus, na mesa do quarto"></div>';
  }
  function lerQuandoOnde(id) {
    var q = document.getElementById('pea-qo-' + id + '-q'), o = document.getElementById('pea-qo-' + id + '-o');
    var quando = q ? q.value.trim() : '', onde = o ? o.value.trim() : '';
    var frase = (quando || onde) ? 'Vou fazer ' + (quando ? quando : 'em um momento que eu escolher') + (onde ? ', ' + onde : '') + '.' : '';
    return { quando: quando, onde: onde, frase: frase };
  }

  function mensagem(contexto, nome) {
    return (nome ? 'Oi, ' + nome + '! ' : 'Oi! ') + 'Estou praticando uma coisa para cuidar de mim (' + contexto + '). ' +
           'Posso te contar como está sendo? Não precisa resolver nada, só ouvir já ajuda.';
  }
  function apoio(contexto) {
    var nome = ler().nome || '';
    return '<details class="pea-apoio" data-apoio-ctx="' + esc(contexto) + '"><summary>Quer dividir isso com alguém de confiança? (opcional)</summary><div>' +
      '<p style="margin:0 0 4px">Contar para uma pessoa de apoio pode tornar o caminho mais leve. Você escolhe se, quando e o quê. Não enviamos nada por você.</p>' +
      '<label>Uma pessoa de confiança (o nome fica só neste aparelho)</label>' +
      '<input type="text" maxlength="40" autocomplete="off" data-apoio-nome value="' + esc(nome) + '" placeholder="Ex.: Ana, minha irmã">' +
      '<label>Uma frase pronta (edite como preferir)</label>' +
      '<textarea data-apoio-msg>' + esc(mensagem(contexto, nome)) + '</textarea>' +
      '<button type="button" data-apoio-acao="enviar">Copiar ou compartilhar a frase</button>' +
      '<p class="pea-apoio-ok" role="status" aria-live="polite"></p></div></details>';
  }

  document.addEventListener('input', function (ev) {
    var t = ev.target; if (!t || !t.closest) return;
    if (t.hasAttribute('data-apoio-nome')) {
      var cx = t.closest('.pea-apoio'), msg = cx && cx.querySelector('[data-apoio-msg]');
      var o = ler(); o.nome = t.value.trim(); gravar(o);
      if (msg && !msg.dataset.editada) msg.value = mensagem(cx.getAttribute('data-apoio-ctx') || 'um exercício', o.nome);
    } else if (t.hasAttribute('data-apoio-msg')) { t.dataset.editada = '1'; }
  });
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('[data-apoio-acao]'); if (!b) return;
    var cx = b.closest('.pea-apoio'), msg = cx.querySelector('[data-apoio-msg]'), ok = cx.querySelector('.pea-apoio-ok');
    var texto = msg.value;
    function aviso(t) { ok.textContent = t; }
    if (navigator.share) { navigator.share({ text: texto }).then(function () { aviso('Pronto. A conversa é sua.'); }, function () { aviso('Tudo bem, nada foi enviado.'); }); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texto).then(function () { aviso('Frase copiada. Cole onde preferir, quando quiser.'); }, function () { msg.select(); aviso('Selecione e copie a frase acima.'); }); return; }
    msg.select(); aviso('Selecione e copie a frase acima.');
  });

  // Páginas estáticas: <div data-pea-apoio="contexto"></div> vira a caixa de pessoa de apoio.
  function montar() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-pea-apoio]'), function (n) {
      if (n.dataset.montado) return; n.dataset.montado = '1'; n.innerHTML = apoio(n.getAttribute('data-pea-apoio'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();

  global.PeaApoio = { porQue: porQue, quandoOnde: quandoOnde, lerQuandoOnde: lerQuandoOnde, apoio: apoio };
})(window);
