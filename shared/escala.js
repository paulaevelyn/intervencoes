/* escala.js — módulo genérico de escalas de autorrelato (Likert).
   Recebe a DEFINIÇÃO de uma escala (nome, instrução, âncoras, itens, pontuação)
   e monta o questionário, calcula a pontuação e devolve o resultado.

   Escala.render(raiz, def, { onDone(resultado), onSkip? }) -> void
   Escala.pontuar(def, respostas) -> { total, media, n }

   O texto dos itens vem SEMPRE de uma versão validada (ver shared/escalas/*.js);
   este arquivo não contém nenhum item. Todo texto entra por textContent. */
(function (global) {
  'use strict';

  function h(tag, props) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'class') e.className = props[k];
      else if (k === 'texto') e.textContent = props[k];
      else e.setAttribute(k, props[k]);
    });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) e.appendChild(arguments[i]);
    return e;
  }

  // Soma dos itens (com inversão, se a escala tiver itens invertidos).
  function pontuar(def, respostas) {
    var inv = (def.pontuacao && def.pontuacao.invertidos) || [];
    var max = def.opcoes;
    var soma = 0, n = 0;
    respostas.forEach(function (v, i) {
      if (typeof v !== 'number') return;
      soma += inv.indexOf(i + 1) >= 0 ? (max + 1 - v) : v;
      n++;
    });
    // Subescalas (opcional): soma dos itens de cada fator, já com a inversão aplicada.
    var subs = null;
    if (def.subescalas) {
      subs = {};
      Object.keys(def.subescalas).forEach(function (nome) {
        var s = 0;
        def.subescalas[nome].forEach(function (num) {
          var v = respostas[num - 1];
          if (typeof v === 'number') s += inv.indexOf(num) >= 0 ? (max + 1 - v) : v;
        });
        subs[nome] = s;
      });
    }
    return { total: soma, media: n ? soma / n : null, n: n, subescalas: subs };
  }

  function render(raiz, def, opts) {
    opts = opts || {};
    raiz.textContent = '';
    var respostas = new Array(def.itens.length).fill(null);

    var contador = h('p', { class: 'esc-contador', role: 'status', 'aria-live': 'polite' });
    var botao = h('button', { class: 'esc-btn', type: 'submit', texto: 'Concluir', disabled: 'disabled' });
    function atualizar() {
      var feitas = respostas.filter(function (x) { return x !== null; }).length;
      contador.textContent = feitas + ' de ' + def.itens.length + ' respondidas';
      if (feitas === def.itens.length) botao.removeAttribute('disabled'); else botao.setAttribute('disabled', 'disabled');
    }

    var form = h('form', { class: 'esc-form', novalidate: 'novalidate' });
    form.appendChild(h('h2', { class: 'esc-titulo', texto: def.nome }));
    form.appendChild(h('p', { class: 'esc-instrucao', texto: def.instrucao }));
    if (def.rotulos) {
      // todos os rótulos das opções, numa linha de legenda
      form.appendChild(h('p', { class: 'esc-legenda', texto: def.rotulos.map(function (r, i) { return (i + 1) + ' = ' + r; }).join(' · ') }));
    } else {
      form.appendChild(h('p', { class: 'esc-ancoras' },
        h('span', { texto: '1 = ' + def.ancoras[1] }), h('span', { texto: def.opcoes + ' = ' + def.ancoras[def.opcoes] })));
    }

    def.itens.forEach(function (texto, i) {
      var grupo = h('fieldset', { class: 'esc-item' }, h('legend', { texto: (i + 1) + '. ' + texto }));
      var linha = h('div', { class: 'esc-opcoes' });
      for (var v = 1; v <= def.opcoes; v++) {
        (function (valor) {
          var id = 'esc-' + def.id + '-' + i + '-' + valor;
          var inp = h('input', { type: 'radio', name: 'esc-' + def.id + '-' + i, id: id, value: String(valor) });
          inp.addEventListener('change', function () { respostas[i] = valor; atualizar(); });
          linha.appendChild(h('label', { for: id, class: 'esc-op' }, inp, h('span', { texto: String(valor) })));
        })(v);
      }
      grupo.appendChild(linha);
      form.appendChild(grupo);
    });

    form.appendChild(contador);
    var acoes = h('div', { class: 'esc-acoes' }, botao);
    if (opts.onSkip) {
      var pular = h('button', { class: 'esc-btn esc-sec', type: 'button', texto: 'Agora não' });
      pular.addEventListener('click', opts.onSkip);
      acoes.appendChild(pular);
    }
    form.appendChild(acoes);
    if (def.fonte) form.appendChild(h('p', { class: 'esc-fonte', texto: def.fonte }));

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (respostas.some(function (x) { return x === null; })) return;
      var p = pontuar(def, respostas);
      if (opts.onDone) opts.onDone({
        id: def.id, versao: def.versao, respostas: respostas.slice(), total: p.total, media: p.media, subescalas: p.subescalas,
        maximo: def.itens.length * def.opcoes, minimo: def.itens.length, data: new Date().toISOString()
      });
    });

    raiz.appendChild(form);
    atualizar();
  }

  global.Escala = { render: render, pontuar: pontuar };
})(window);
