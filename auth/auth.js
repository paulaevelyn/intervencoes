/* ═══════════════════════════════════════════════════════════════════════
   auth.js — login e sincronização compartilhados pelas intervenções

   O QUE FAZ
   1. Esconde o app até saber quem está entrando.
   2. Pede e-mail e senha (as contas são criadas só por convite).
   3. Pede o consentimento para guardar dados de saúde, uma vez por versão do aviso.
   4. Copia o estado do app (o que ele guarda no localStorage) para a conta da
      pessoa, e o traz de volta em outro aparelho.
   5. "Minha conta": baixar os dados e apagar a conta (LGPD).

   COMO CADA APP USA (uma linha, no fim do <body>):
     <script type="module" src="../auth/auth.js"
             data-app="farol" data-storage-keys="np_v4"
             data-nome="Farol" data-logo="assets/farol-logo.svg"></script>
   e, no <head>, os dois itens marcados com "LOGIN:" em INTEGRACAO.md.

   SEGURANÇA — o que vale saber
   • A chave abaixo é PÚBLICA de propósito. Quem protege os dados é a regra
     RLS do banco (tabela app_dados): cada pessoa só alcança as próprias linhas.
   • Este arquivo roda no navegador, então nada aqui é segredo.
   ═══════════════════════════════════════════════════════════════════════ */

// ════════════════════ 1. CONFIGURAÇÃO ════════════════════
const SUPABASE_URL = 'https://qhjdhlrmmopgucseprkb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gaCdnOB0LUazCo57jU1tSQ_sZjyXBDw';
const SUPABASE_LIB = 'https://esm.sh/@supabase/supabase-js@2.45.4';
const TABELA = 'app_dados';

const CONTATO_PRIVACIDADE = 'contato@psicoterapiaeafins.com.br';
const REGIAO_SERVIDOR = 'São Paulo, Brasil';
// Mude esta data sempre que o texto do aviso mudar: quem já tinha concordado
// verá o aviso de novo, e o registro mostra com qual versão cada pessoa concordou.
const AVISO_VERSAO = '2026-10-02';

const eu = document.querySelector('script[data-app]');
const APP = eu.dataset.app;
const NOME = eu.dataset.nome || APP;
const LOGO = eu.dataset.logo || '';
const CHAVES = (eu.dataset.storageKeys || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

const K_DONO = 'pea_dono_' + APP;
const K_SYNC = 'pea_sync_' + APP;
const K_RELOAD = 'pea_reload_' + APP;

// O link do convite traz "type=invite" na URL. A biblioteca apaga isso ao ler,
// então guardamos antes: quem chega por convite ainda não tem senha.
const veioConvite = /type=invite/.test(location.hash);
const erroNoLink = /error_code=([a-z_]+)/.exec(location.hash);

// ════════════════════ 2. ESTADO ════════════════════
let sb = null;
let usuario = null;
let overlay = null;
let botaoConta = null;
let ultimoSnap = '';
let enviando = false;
let podeEnviar = false;
let aguardandoSenha = false;
const raiz = document.documentElement;

// ════════════════════ 3. AJUDANTES ════════════════════
function novo(tag, props, ...filhos) {
  const e = document.createElement(tag);
  Object.entries(props || {}).forEach(function (par) {
    const k = par[0], v = par[1];
    if (k === 'class') e.className = v;
    else if (k === 'texto') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== false && v !== undefined) e.setAttribute(k, v === true ? '' : v);
  });
  filhos.filter(Boolean).forEach(function (f) { e.appendChild(f); });
  return e;
}

function traduzirErro(erro) {
  const m = (erro && erro.message ? erro.message : String(erro)).toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar: o link está na sua caixa de entrada.';
  if (m.includes('password should be')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (m.includes('same password')) return 'Escolha uma senha diferente da anterior.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas seguidas. Espere um minuto e tente outra vez.';
  if (m.includes('failed to fetch') || m.includes('networkerror')) return 'Não consegui falar com o servidor. Verifique sua conexão e tente de novo.';
  return 'Não deu certo: ' + (erro && erro.message ? erro.message : 'erro desconhecido') + '.';
}

function recadoEm(caixa, texto, tipo) {
  caixa.textContent = texto;
  caixa.dataset.tipo = tipo || 'erro';
  caixa.hidden = false;
}

// ════════════════════ 4. TELAS ════════════════════
function abrirOverlay(cartao, comLogo) {
  const aviso = document.getElementById('pea-auth-aviso');
  if (aviso) aviso.remove();
  if (overlay) overlay.remove();
  overlay = novo('div', { id: 'pea-auth-tela', role: 'dialog', 'aria-modal': 'true' });
  if (comLogo && LOGO) overlay.appendChild(novo('img', { class: 'pea-auth-logo', src: LOGO, alt: NOME }));
  overlay.appendChild(cartao);
  overlay.appendChild(novo('div', { class: 'pea-auth-rodape', texto: 'Psicoterapia e Afins' }));
  document.body.appendChild(overlay);
  return overlay;
}

function fecharOverlay() {
  if (overlay) { overlay.remove(); overlay = null; }
}

function liberarApp() {
  const aviso = document.getElementById('pea-auth-aviso');
  if (aviso) aviso.remove();
  raiz.classList.remove('pea-auth-carregando');
  fecharOverlay();
}

function esconderApp() {
  raiz.classList.add('pea-auth-carregando');
}

// ── Entrar / recuperar ──────────────────────────────────────────────
function mostrarTelaAcesso(modoInicial) {
  esconderApp();
  let modo = modoInicial || 'entrar'; // 'entrar' | 'recuperar'

  const email = novo('input', { type: 'email', id: 'pea-email', autocomplete: 'email', placeholder: 'voce@email.com' });
  const senha = novo('input', { type: 'password', id: 'pea-senha', autocomplete: 'current-password', placeholder: 'sua senha' });
  const campoSenha = novo('div', { class: 'pea-auth-campo' }, novo('label', { for: 'pea-senha', texto: 'Senha' }), senha);
  const titulo = novo('h1', { class: 'pea-auth-titulo' });
  const texto = novo('p', { class: 'pea-auth-texto' });
  const botao = novo('button', { class: 'pea-auth-btn', type: 'submit' });
  const recado = novo('div', { class: 'pea-auth-recado', hidden: true });
  const alternar = novo('button', { class: 'pea-auth-link', type: 'button' });

  function pintar() {
    recado.hidden = true;
    campoSenha.hidden = modo === 'recuperar';
    if (modo === 'entrar') {
      titulo.textContent = 'Entrar';
      texto.textContent = 'O acesso é individual. Use o e-mail e a senha da sua conta: seu progresso fica guardado nela e acompanha você em qualquer aparelho.';
      botao.textContent = 'Entrar';
      alternar.textContent = 'Esqueci minha senha / primeiro acesso';
    } else {
      titulo.textContent = 'Recuperar acesso';
      texto.textContent = 'Digite o e-mail da sua conta e enviaremos um link para você definir uma senha nova.';
      botao.textContent = 'Enviar link';
      alternar.textContent = 'Voltar para entrar';
    }
  }
  alternar.addEventListener('click', function () { modo = modo === 'entrar' ? 'recuperar' : 'entrar'; pintar(); });

  const form = novo('form', { class: 'pea-auth-cartao' },
    titulo, texto,
    novo('div', { class: 'pea-auth-campo' }, novo('label', { for: 'pea-email', texto: 'E-mail' }), email),
    campoSenha, botao, alternar, recado);

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const e = email.value.trim();
    if (!e) { recadoEm(recado, 'Preencha o e-mail.'); return; }
    if (modo === 'entrar' && senha.value.length < 6) { recadoEm(recado, 'A senha precisa ter pelo menos 6 caracteres.'); return; }
    botao.disabled = true;
    const original = botao.textContent;
    botao.textContent = 'Aguarde…';
    try {
      if (modo === 'entrar') {
        const r = await sb.auth.signInWithPassword({ email: e, password: senha.value });
        if (r.error) throw r.error;
      } else {
        const r = await sb.auth.resetPasswordForEmail(e, { redirectTo: location.origin + location.pathname });
        if (r.error) throw r.error;
        recadoEm(recado, 'Se existir uma conta com esse e-mail, o link já está a caminho. Confira também o spam.', 'ok');
      }
    } catch (erro) {
      recadoEm(recado, traduzirErro(erro));
    } finally {
      botao.disabled = false;
      botao.textContent = original;
    }
  });

  abrirOverlay(form, true);
  pintar();
  if (erroNoLink) {
    recadoEm(recado, erroNoLink[1] === 'otp_expired'
      ? 'O link expirou ou já foi usado. Peça um novo em "Esqueci minha senha / primeiro acesso".'
      : 'O link não funcionou. Peça um novo em "Esqueci minha senha / primeiro acesso".');
  }
}

// ── Definir senha (convite ou recuperação) ───────────────────────────
function mostrarTelaNovaSenha() {
  esconderApp();
  aguardandoSenha = true;
  const senha = novo('input', { type: 'password', id: 'pea-nova', autocomplete: 'new-password', placeholder: 'nova senha' });
  const botao = novo('button', { class: 'pea-auth-btn', type: 'submit', texto: 'Salvar senha e entrar' });
  const recado = novo('div', { class: 'pea-auth-recado', hidden: true });
  const form = novo('form', { class: 'pea-auth-cartao' },
    novo('h1', { class: 'pea-auth-titulo', texto: 'Defina sua senha' }),
    novo('p', { class: 'pea-auth-texto', texto: 'Escolha uma senha de pelo menos 6 caracteres. Você vai usá-la nos próximos acessos.' }),
    novo('div', { class: 'pea-auth-campo' }, novo('label', { for: 'pea-nova', texto: 'Nova senha' }), senha),
    botao, recado);
  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    if (senha.value.length < 6) { recadoEm(recado, 'A senha precisa ter pelo menos 6 caracteres.'); return; }
    botao.disabled = true;
    const r = await sb.auth.updateUser({ password: senha.value });
    botao.disabled = false;
    if (r.error) { recadoEm(recado, traduzirErro(r.error)); return; }
    aguardandoSenha = false;
    history.replaceState(null, '', location.pathname + location.search);
    entrarNoApp(r.data.user);
  });
  abrirOverlay(form, true);
}

// ── Consentimento (dado de saúde → consentimento informado e específico) ──
function mostrarTelaConsentimento(u, aoConcordar) {
  esconderApp();
  const caixa = novo('input', { type: 'checkbox', id: 'pea-consent' });
  const botao = novo('button', { class: 'pea-auth-btn', type: 'button', texto: 'Concordar e continuar', disabled: true });
  const recusar = novo('button', { class: 'pea-auth-link', type: 'button', texto: 'Não concordo — sair' });
  const recado = novo('div', { class: 'pea-auth-recado', hidden: true });
  caixa.addEventListener('change', function () { botao.disabled = !caixa.checked; });

  const cartao = novo('div', { class: 'pea-auth-cartao' },
    novo('h1', { class: 'pea-auth-titulo', texto: 'Antes de começar' }),
    novo('p', { class: 'pea-auth-texto', texto: 'O ' + NOME + ' guarda o que você registra nele na sua conta. Como são informações sobre saúde emocional, preciso do seu consentimento.' }),
    novo('details', { class: 'pea-auth-detalhes', open: true },
      novo('summary', { texto: 'O que fica guardado, onde e por quanto tempo' }),
      novo('ul', {},
        novo('li', { texto: 'O quê: seu e-mail e tudo o que você preencher no app (respostas, diário, progresso).' }),
        novo('li', { texto: 'Onde: banco de dados no Supabase (' + REGIAO_SERVIDOR + '), protegido por senha e por regras que separam os dados de cada pessoa.' }),
        novo('li', { texto: 'Quem vê: você, com a sua senha. Quem administra o serviço tem acesso técnico ao banco, como em qualquer serviço online.' }),
        novo('li', { texto: 'Por quanto tempo: até você apagar. Em "Minha conta" você baixa tudo ou apaga a conta na hora.' }),
        novo('li', { texto: 'Não acontece: venda, publicidade ou entrega a terceiros. É uma ferramenta psicoeducativa e não substitui o acompanhamento profissional.' }),
        novo('li', { texto: 'Dúvidas ou pedidos sobre seus dados: ' + CONTATO_PRIVACIDADE }))),
    novo('div', { class: 'pea-auth-consent' }, caixa,
      novo('label', { for: 'pea-consent', texto: 'Li o aviso acima e concordo em guardar meus dados na minha conta.' })),
    botao, recusar, recado);

  botao.addEventListener('click', async function () {
    botao.disabled = true;
    const r = await sb.auth.updateUser({ data: { consentimento_em: new Date().toISOString(), consentimento_versao: AVISO_VERSAO } });
    if (r.error) { botao.disabled = false; recadoEm(recado, traduzirErro(r.error)); return; }
    aoConcordar(r.data.user);
  });
  recusar.addEventListener('click', function () { sb.auth.signOut(); });
  abrirOverlay(cartao, true);
}

// ── Minha conta ─────────────────────────────────────────────────────
function mostrarPainelConta() {
  if (overlay) { fecharOverlay(); return; }
  const recado = novo('div', { class: 'pea-auth-recado', hidden: true });
  const area = novo('div', {});

  const baixar = novo('button', { class: 'pea-auth-btn sec', type: 'button', texto: 'Baixar meus dados' });
  const apagar = novo('button', { class: 'pea-auth-btn perigo', type: 'button', texto: 'Apagar minha conta' });
  const sairBtn = novo('button', { class: 'pea-auth-btn sec', type: 'button', texto: 'Sair' });
  const fechar = novo('button', { class: 'pea-auth-link', type: 'button', texto: 'Voltar ao app' });

  const cartao = novo('div', { class: 'pea-auth-cartao' },
    novo('h1', { class: 'pea-auth-titulo', texto: 'Minha conta' }),
    novo('p', { class: 'pea-auth-texto', texto: usuario.email }),
    novo('div', { class: 'pea-auth-campo' }, baixar),
    novo('div', { class: 'pea-auth-campo' }, sairBtn),
    novo('div', { class: 'pea-auth-campo' }, apagar),
    area, fechar, recado);

  fechar.addEventListener('click', fecharOverlay);
  sairBtn.addEventListener('click', function () { sairDaConta(sairBtn); });

  baixar.addEventListener('click', async function () {
    baixar.disabled = true;
    const r = await sb.from(TABELA).select('*');
    baixar.disabled = false;
    if (r.error) { recadoEm(recado, 'Não consegui montar o arquivo: ' + r.error.message); return; }
    const pacote = { exportado_em: new Date().toISOString(), conta: { email: usuario.email, criada_em: usuario.created_at }, apps: r.data };
    const url = URL.createObjectURL(new Blob([JSON.stringify(pacote, null, 2)], { type: 'application/json' }));
    const a = novo('a', { href: url, download: 'meus-dados-' + APP + '.json' });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  apagar.addEventListener('click', function () {
    if (area.firstChild) { area.innerHTML = ''; return; }
    const campo = novo('input', { type: 'text', placeholder: 'APAGAR', 'aria-label': 'digite APAGAR para confirmar' });
    const confirmar = novo('button', { class: 'pea-auth-btn perigo', type: 'button', texto: 'Apagar definitivamente' });
    confirmar.addEventListener('click', async function () {
      if (campo.value.trim().toUpperCase() !== 'APAGAR') { campo.focus(); return; }
      confirmar.disabled = true;
      const r = await sb.rpc('apagar_minha_conta');
      if (r.error) { confirmar.disabled = false; recadoEm(recado, 'Não consegui apagar: ' + r.error.message); return; }
      limparLocal();
      await sb.auth.signOut();
    });
    area.appendChild(novo('div', { class: 'pea-auth-campo' },
      novo('p', { class: 'pea-auth-texto', texto: 'Isto apaga a sua conta e tudo o que está guardado nela, sem volta. Para confirmar, digite APAGAR.' }),
      campo, confirmar));
    campo.focus();
  });

  abrirOverlay(cartao, false);
}

// ════════════════════ 5. SINCRONIZAÇÃO ════════════════════
// O app guarda o estado dele em uma ou mais chaves do localStorage. Tratamos
// o conjunto como um bloco só: um "snapshot" em texto, comparável e enviável.
function lerSnap() {
  const o = {};
  CHAVES.forEach(function (k) {
    try { const v = localStorage.getItem(k); if (v !== null) o[k] = v; } catch (e) { /* indisponível */ }
  });
  return Object.keys(o).length ? JSON.stringify(o) : '';
}

function lerMeta() {
  try { return JSON.parse(localStorage.getItem(K_SYNC) || 'null') || {}; } catch (e) { return {}; }
}
function gravarMeta(ts, snap) {
  try { localStorage.setItem(K_SYNC, JSON.stringify({ ts: ts, snap: snap })); } catch (e) { /* ok */ }
}

function limparLocal() {
  CHAVES.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { /* ok */ } });
  try { localStorage.removeItem(K_DONO); localStorage.removeItem(K_SYNC); } catch (e) { /* ok */ }
}

function aplicarRemoto(valor, ts) {
  const chaves = (valor && valor.chaves) || {};
  CHAVES.forEach(function (k) {
    try {
      if (typeof chaves[k] === 'string') localStorage.setItem(k, chaves[k]);
      else localStorage.removeItem(k);
    } catch (e) { /* ok */ }
  });
  gravarMeta(ts, lerSnap());
}

function marcarEstado(estado, texto) {
  if (!botaoConta) return;
  botaoConta.dataset.estado = estado;
  botaoConta.textContent = texto;
}

async function enviar(forcar) {
  // Só envia depois de ter conferido a conta com sucesso: sem isso, uma falha
  // de leitura poderia levar este aparelho a sobrescrever o que já estava lá.
  if (!sb || !usuario || enviando || !podeEnviar) return;
  const snap = lerSnap();
  if (!snap || (!forcar && snap === ultimoSnap)) return;
  enviando = true;
  marcarEstado('sync', 'salvando…');
  try {
    const r = await sb.from(TABELA)
      .upsert({ user_id: usuario.id, app: APP, valor: { chaves: JSON.parse(snap) }, atualizado_em: new Date().toISOString() },
              { onConflict: 'user_id,app' })
      .select('atualizado_em').single();
    if (r.error) throw r.error;
    ultimoSnap = snap;
    gravarMeta(r.data.atualizado_em, snap);
    marcarEstado('ok', '✓ salvo na conta');
  } catch (erro) {
    console.error('[auth] falha ao salvar', erro);
    marcarEstado('erro', '⚠ não salvou');
  } finally {
    enviando = false;
  }
}

// Decide, ao entrar, quem manda: a conta ou este aparelho.
// Regras: (a) dados deste aparelho de OUTRA pessoa nunca são aproveitados;
// (b) se a conta tem versão mais nova e este aparelho não tem alterações
// pendentes, vale a conta; (c) alterações pendentes deste aparelho são enviadas.
async function sincronizarEntrada() {
  const r = await sb.from(TABELA).select('valor, atualizado_em').eq('app', APP).maybeSingle();
  if (r.error) throw r.error;

  const dono = localStorage.getItem(K_DONO);
  const meta = lerMeta();
  const snap = lerSnap();
  const remoto = r.data;
  const jaRecarregou = sessionStorage.getItem(K_RELOAD) === '1';

  // Dados locais de outra conta: descartar antes de qualquer coisa.
  if (dono && dono !== usuario.id) { limparLocal(); }
  // "Pendente" só existe num aparelho que JÁ sincronizou com esta conta: aí dá
  // para saber o que mudou desde a última vez. Num aparelho novo, o app cria
  // sozinho um estado vazio — isso NÃO é trabalho da pessoa e não pode vencer
  // o que já está na conta.
  const jaSincronizou = dono === usuario.id && !!meta.ts;
  const snapLocal = jaSincronizou ? lerSnap() : '';
  const pendente = jaSincronizou && snapLocal && snapLocal !== (meta.snap || '');

  localStorage.setItem(K_DONO, usuario.id);

  if (remoto) {
    const remotoMaisNovo = !jaSincronizou || new Date(remoto.atualizado_em) > new Date(meta.ts);
    if (!pendente && remotoMaisNovo && !jaRecarregou) {
      aplicarRemoto(remoto.valor, remoto.atualizado_em);
      sessionStorage.setItem(K_RELOAD, '1');
      location.reload();
      return false; // a página vai recarregar com os dados da conta
    }
    ultimoSnap = pendente ? '' : lerSnap();
    if (!pendente) gravarMeta(remoto.atualizado_em, ultimoSnap);
  } else {
    ultimoSnap = '';
  }
  sessionStorage.removeItem(K_RELOAD);
  return true;
}

// ════════════════════ 6. ENTRAR / SAIR ════════════════════
async function entrarNoApp(u) {
  if (usuario && usuario.id === u.id) return;
  usuario = u;

  const consentido = u.user_metadata && u.user_metadata.consentimento_versao === AVISO_VERSAO;
  if (!consentido) {
    mostrarTelaConsentimento(u, function (atualizado) { usuario = atualizado; seguirEntrada(); });
    return;
  }
  await seguirEntrada();
}

async function seguirEntrada() {
  esconderApp();
  let seguir = true;
  let falhou = false;
  try {
    seguir = await sincronizarEntrada();
  } catch (erro) {
    console.error('[auth] falha ao sincronizar', erro);
    falhou = true;
  }
  if (!seguir) return;

  podeEnviar = !falhou;
  liberarApp();
  montarBotaoConta(falhou);
  clearInterval(entrarNoApp.timer);
  entrarNoApp.timer = setInterval(function () { enviar(false); }, 4000);
  if (!falhou) enviar(false);
}

function montarBotaoConta(falhou) {
  document.querySelectorAll('.pea-auth-barra').forEach(function (b) { b.remove(); });
  botaoConta = novo('button', { class: 'pea-auth-conta-btn', type: 'button', 'aria-label': 'Minha conta', onclick: mostrarPainelConta });
  const sairVisivel = novo('button', {
    class: 'pea-auth-conta-btn', type: 'button', texto: 'Sair', 'aria-label': 'Sair da conta',
    onclick: function () { sairDaConta(sairVisivel); }
  });
  document.body.appendChild(novo('div', { class: 'pea-auth-barra' }, botaoConta, sairVisivel));
  if (falhou) marcarEstado('erro', '⚠ sem sincronizar'); else marcarEstado('ok', '👤 conta');
}

// Salva o que faltar na conta e só então encerra a sessão.
async function sairDaConta(botao) {
  if (botao) { botao.disabled = true; botao.textContent = 'Saindo…'; }
  await enviar(true);
  await sb.auth.signOut();
}

function sairDoApp() {
  clearInterval(entrarNoApp.timer);
  usuario = null;
  limparLocal();
  sessionStorage.removeItem(K_RELOAD);
  // O app guarda o estado também na memória; recarregar garante que nada
  // da pessoa anterior continue visível.
  location.replace(location.pathname + location.search);
}

document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') enviar(false);
});
window.addEventListener('pagehide', function () { enviar(false); });

// ════════════════════ 7. PARTIDA ════════════════════
async function iniciar() {
  const { createClient } = await import(SUPABASE_LIB);
  sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  aguardandoSenha = veioConvite;

  sb.auth.onAuthStateChange(function (evento, sessao) {
    // Nunca chamar o Supabase direto aqui dentro: adiar evita travamento.
    setTimeout(function () {
      if (evento === "USER_UPDATED") return;
      if (evento === "PASSWORD_RECOVERY") { mostrarTelaNovaSenha(); return; }
      if (sessao && sessao.user) {
        if (aguardandoSenha) { mostrarTelaNovaSenha(); return; }
        if (!usuario || usuario.id !== sessao.user.id) entrarNoApp(sessao.user);
      } else if (usuario) {
        sairDoApp();
      }
    }, 0);
  });

  const r = await sb.auth.getSession();
  const sessao = r.data && r.data.session;
  if (sessao && sessao.user) {
    if (aguardandoSenha) mostrarTelaNovaSenha(); else entrarNoApp(sessao.user);
  } else {
    mostrarTelaAcesso('entrar');
  }
}

iniciar().catch(function (erro) {
  console.error('[auth]', erro);
  // Falha ao carregar o login: o app continua protegido (escondido) e a
  // pessoa vê o motivo, em vez de uma página em branco.
  esconderApp();
  const aviso = document.getElementById('pea-auth-aviso');
  if (aviso) aviso.textContent = 'Não consegui carregar o login. Verifique sua conexão e recarregue a página.';
});
