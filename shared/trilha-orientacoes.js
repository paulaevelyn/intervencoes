/* trilha-orientacoes.js — editor, para a profissional, do que o adolescente vê na Trilha:
   módulo atual, próximas sessões (com o link da videochamada) e tarefas entre sessões.
   TrilhaOrientacoes.montar(sb, pacienteId, container, { aoSalvar })
   Lê e grava SÓ por painel_trilha_ler / painel_trilha_salvar (o banco valida o vínculo e filtra o conteúdo).
   Depende de trilha/data.js (window.TRILHA) e das classes do painel (card, campo, p, s, recado).
   Tudo que vem do banco entra por textContent/value, nunca por innerHTML. */
(function (global) {
  'use strict';
  var T = global.TRILHA;
  if (!T) { console.error('[TrilhaOrientacoes] carregue trilha/data.js antes.'); return; }

  function el(tag, props) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'class') e.className = props[k];
      else if (k === 'texto') e.textContent = props[k];
      else if (k === 'value') e.value = props[k];
      else e.setAttribute(k, props[k]);
    });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) e.appendChild(arguments[i]);
    return e;
  }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function paraInputLocal(isoStr) {                      // ISO -> valor de <input type="datetime-local">
    var d = new Date(isoStr); if (isNaN(d)) return '';
    var z = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + 'T' + z(d.getHours()) + ':' + z(d.getMinutes());
  }

  function montar(sb, pacienteId, container, opts) {
    opts = opts || {};
    container.textContent = '';
    var estado = { modulo: null, sessoes: [], tarefas: [] };
    var aviso = el('div', { class: 'recado', hidden: '' });
    var corpo = el('div', { texto: 'Carregando…' });
    container.appendChild(corpo);

    function mostrar(txt, tipo) { aviso.textContent = txt; aviso.className = 'recado ' + (tipo || 'erro'); aviso.hidden = false; }

    function desenhar() {
      corpo.textContent = '';
      corpo.appendChild(el('p', { class: 'nota', texto: 'O adolescente vê isto na tela inicial da Trilha. A sala de vídeo é externa (Meet, Zoom…): cole o link https da sessão. Os responsáveis não têm acesso.' }));

      // Módulo atual
      var sel = el('select', { 'aria-label': 'Módulo atual', style: 'width:100%;padding:12px 14px;font:inherit;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:inherit' });
      sel.appendChild(el('option', { value: '', texto: '(nenhum)' }));
      T.MODULOS.forEach(function (m) { var o = el('option', { value: String(m.id), texto: 'Módulo ' + m.id + ' · ' + m.nome }); if (estado.modulo === m.id) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('change', function () { estado.modulo = sel.value ? Number(sel.value) : null; });
      corpo.appendChild(el('div', { class: 'card', style: 'margin-bottom:12px' }, el('div', { class: 'campo' }, el('label', { texto: 'Módulo de agora' }), sel)));

      // Sessões
      var cs = el('div', { class: 'card', style: 'margin-bottom:12px' }, el('h2', { texto: 'Próximas sessões', style: 'margin-top:0' }));
      estado.sessoes.forEach(function (s, i) {
        var dt = el('input', { type: 'datetime-local', 'aria-label': 'Data e hora', value: paraInputLocal(s.inicio), style: 'width:100%;padding:10px 12px;font:inherit;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:inherit' });
        dt.addEventListener('change', function () { var d = new Date(dt.value); s.inicio = isNaN(d) ? '' : d.toISOString(); });
        var lk = el('input', { type: 'url', placeholder: 'https:// link da videochamada', 'aria-label': 'Link da sessão', value: s.link || '', style: 'width:100%;padding:10px 12px;font:inherit;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:inherit;margin-top:6px' });
        lk.addEventListener('input', function () { s.link = lk.value.trim(); });
        var cb = el('textarea', { rows: '2', placeholder: 'Combinados para esta sessão (o adolescente lê)', 'aria-label': 'Combinados', maxlength: '1000', style: 'width:100%;padding:10px 12px;font:inherit;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:inherit;margin-top:6px;resize:vertical' });
        cb.value = s.combinados || ''; cb.addEventListener('input', function () { s.combinados = cb.value; });
        var rm = el('button', { class: 's', type: 'button', texto: 'Remover', style: 'margin-top:6px' });
        rm.addEventListener('click', function () { estado.sessoes.splice(i, 1); desenhar(); });
        cs.appendChild(el('div', { style: 'padding:10px 0;border-top:1px solid var(--border)' }, dt, lk, cb, rm));
      });
      var addS = el('button', { class: 's', type: 'button', texto: '+ Sessão' });
      addS.addEventListener('click', function () { estado.sessoes.push({ id: uid('s'), inicio: '', link: '', combinados: '' }); desenhar(); });
      cs.appendChild(addS); corpo.appendChild(cs);

      // Tarefas
      var ct = el('div', { class: 'card', style: 'margin-bottom:12px' }, el('h2', { texto: 'Tarefas entre sessões', style: 'margin-top:0' }));
      estado.tarefas.forEach(function (t, i) {
        var tt = el('input', { type: 'text', placeholder: 'Título (ex.: 2 registros do detetive)', 'aria-label': 'Título', maxlength: '120', value: t.titulo || '', style: 'width:100%;padding:10px 12px;font:inherit;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:inherit' });
        tt.addEventListener('input', function () { t.titulo = tt.value; });
        var ins = el('textarea', { rows: '2', placeholder: 'Instrução curta (o adolescente lê)', 'aria-label': 'Instrução', maxlength: '1000', style: 'width:100%;padding:10px 12px;font:inherit;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:inherit;margin-top:6px;resize:vertical' });
        ins.value = t.instrucao || ''; ins.addEventListener('input', function () { t.instrucao = ins.value; });
        var fs = el('select', { 'aria-label': 'Ferramenta', style: 'padding:10px 12px;font:inherit;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:inherit;margin-top:6px' });
        fs.appendChild(el('option', { value: '', texto: '(sem ferramenta)' }));
        T.FERRAMENTAS.forEach(function (f) { var o = el('option', { value: f.id, texto: f.nome }); if (t.ferramenta === f.id) o.selected = true; fs.appendChild(o); });
        fs.addEventListener('change', function () { t.ferramenta = fs.value || undefined; });
        var ate = el('input', { type: 'date', 'aria-label': 'Combinado para', value: t.ate || '', style: 'padding:10px 12px;font:inherit;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:inherit;margin:6px 0 0 6px' });
        ate.addEventListener('change', function () { t.ate = ate.value || undefined; });
        var rm = el('button', { class: 's', type: 'button', texto: 'Remover', style: 'margin:6px 0 0 6px' });
        rm.addEventListener('click', function () { estado.tarefas.splice(i, 1); desenhar(); });
        ct.appendChild(el('div', { style: 'padding:10px 0;border-top:1px solid var(--border)' }, tt, ins, fs, ate, rm));
      });
      var addT = el('button', { class: 's', type: 'button', texto: '+ Tarefa' });
      addT.addEventListener('click', function () { estado.tarefas.push({ id: uid('t'), titulo: '', instrucao: '' }); desenhar(); });
      ct.appendChild(addT); corpo.appendChild(ct);

      var salvar = el('button', { class: 'p', type: 'button', texto: 'Salvar para o adolescente' });
      salvar.addEventListener('click', function () { gravar(salvar); });
      corpo.appendChild(salvar); corpo.appendChild(aviso);
    }

    function gravar(botao) {
      aviso.hidden = true; botao.disabled = true;
      var conteudo = {
        modulo: estado.modulo,
        sessoes: estado.sessoes.filter(function (s) { return s.inicio; }),
        tarefas: estado.tarefas.filter(function (t) { return t.titulo && t.titulo.trim(); })
      };
      sb.rpc('painel_trilha_salvar', { p_paciente: pacienteId, p_conteudo: conteudo }).then(function (r) {
        botao.disabled = false;
        if (r.error) { mostrar('Não deu certo: ' + r.error.message); return; }
        var salvo = r.data || {};
        var descartadas = conteudo.sessoes.filter(function (s) { return s.link && !/^https:\/\//.test(s.link); }).length;
        estado.modulo = salvo.modulo || null; estado.sessoes = salvo.sessoes || []; estado.tarefas = salvo.tarefas || [];
        desenhar();
        mostrar('Salvo. O adolescente vê na próxima vez que abrir a Trilha.' + (descartadas ? ' ' + descartadas + ' link(s) fora de https:// foram descartados.' : ''), 'ok');
        if (opts.aoSalvar) opts.aoSalvar(salvo);
      });
    }

    sb.rpc('painel_trilha_ler', { p_paciente: pacienteId }).then(function (r) {
      if (r.error) { corpo.textContent = ''; corpo.appendChild(el('p', { class: 'nota', texto: 'Não deu certo: ' + r.error.message })); return; }
      var d = r.data || {};
      estado.modulo = d.modulo || null; estado.sessoes = d.sessoes || []; estado.tarefas = d.tarefas || [];
      desenhar();
    });
  }

  global.TrilhaOrientacoes = { montar: montar };
})(window);
