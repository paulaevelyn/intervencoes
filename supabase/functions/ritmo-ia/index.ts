// Função de borda "ritmo-ia": ajuda de IA do Ritmo (planejar, dividir tarefa, entender o momento).
//
// Segurança e privacidade
//  • Exige usuário autenticado (JWT do Supabase). Sem conta, sem IA.
//  • Limite diário por pessoa (RITMO_IA_LIMITE, padrão 30), contado em ritmo_ia_uso. Nada do texto é guardado.
//  • A chave da Anthropic vive só em segredo da função (ANTHROPIC_API_KEY), nunca no navegador.
//  • Crise: texto com sinais de risco não é enviado à IA; devolve { crise: true } com o 188/192.
//  • A IA responde só em JSON, e o cliente valida e higieniza o que recebe.
//
// Segredos: ANTHROPIC_API_KEY (obrigatório). Opcionais: RITMO_IA_MODELO, RITMO_IA_LIMITE.
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem no ambiente das funções.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const CRISE = /suic[ií]d|me matar|me machucar|me ferir|acabar com (a )?(minha )?vida|n[aã]o quero (mais )?viver|queria (sumir|morrer)/i;
const MSG_CRISE = 'Parece que você está passando por algo muito difícil. Você não precisa enfrentar isso sozinho/a. Ligue 188 (CVV, 24h, gratuito) ou 192 (SAMU).';

const BASE = `Você é o assistente do Ritmo, um app de apoio para adultos neurodivergentes (autistas, com TDAH, dislexia, altas habilidades e outras diferenças), feito por uma psicóloga clínica.
Princípios: neurodiversidade afirmativa; linguagem simples, frases curtas, exemplos concretos; nunca culpe a pessoa; nunca diagnostique; nunca substitua terapia, avaliação ou tratamento; não dê conselho médico nem fale de medicação.
Não use termos como "defeito", "anormal", "superar o autismo/TDAH". Não prometa resultados. Não use metáforas se o tom for "direto".
O objetivo não é produtividade e sim reduzir sobrecarga, apoiar funções executivas e cuidar. Prefira fazer menos. Inclua pausas. Sempre permita parar.
Se a pessoa descrever risco à vida ou de se machucar, responda SOMENTE {"crise": true, "mensagem": "..."} com acolhimento breve e o 188 (CVV) e 192 (SAMU).
Se houver "perfil", use para adaptar as dicas (por exemplo, TDAH: começo curto e tempo visível; autismo: previsibilidade e redução de sobrecarga; altas habilidades: "bom o suficiente"; dislexia: textos curtos), sem rotular a pessoa nem repetir o diagnóstico de volta. Se houver "tom": "direto", seja breve.
Responda APENAS com um objeto JSON válido, sem texto fora dele, em português do Brasil.`;

const ESQUEMAS: Record<string, string> = {
  planejar: `Entrada: texto (lista bagunçada de coisas a fazer), energia ("baixa"|"media"|"alta"), minutos (tempo disponível).
Monte um plano pequeno e realista. Com energia baixa, no máximo 1 tarefa. Escolha pelo que é urgente e pelo que cabe; o resto vai para "depois".
Saída: {"blocos":[{"tipo":"tarefa"|"pausa","titulo":string,"minutos":number,"nota":string?,"passos":[string,...3 a 5 passos pequenos, só nas tarefas]}],"depois":[string],"dicas":[até 3 strings curtas]}.
Intercale pausas (5 min) a cada 25 a 40 min de tarefa e feche com uma pausa. Nunca ultrapasse "minutos" no total.`,
  dividir: `Entrada: texto (uma tarefa).
Saída: {"passos":[3 a 6 strings]}. Cada passo é uma ação concreta e pequena, começando por um verbo. O primeiro leva até 2 minutos.`,
  entender: `Entrada: texto (a pessoa descreve o que sente e vive).
Ajude a traduzir o que ela sente e o que fazer. São hipóteses, nunca diagnóstico. Use só estas chaves de estado: sobrecarga, meltdown, shutdown, exaustao, paralisia, hiperfoco, rejeicao, tedio, ansiedade, tristeza, raiva. Use só estes ids de práticas: respiracao, grounding, descompressao, autocompaixao, reduzir-demandas, frases-apoio, acomodacoes, comecar-2min, preparar, transicao, movimento, reiniciar, checagem-corpo, pressao, dizer-nao.
Saída: {"estados":[até 3 ids],"precisa":[até 3 necessidades em frases curtas],"como_fazer":[até 4 passos concretos; vazio se meltdown, shutdown ou sobrecarga forte],"regular":[até 3 ids de práticas],"parar":[até 3 frases sobre quando parar ou pedir ajuda],"compaixao":string (1 a 2 frases),"ajuda":string (quando buscar profissional; inclui 188 se houver tristeza intensa ou desesperança)}.`,
};

const clip = (x: unknown, n: number) => (typeof x === 'string' ? x.slice(0, n) : '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ erro: 'método não permitido' }, 405);

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: u, error: eu } = await admin.auth.getUser(token);
  if (eu || !u?.user) return json({ erro: 'entre numa conta' }, 401);

  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) return json({ erro: 'IA não configurada' }, 503);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ erro: 'corpo inválido' }, 400); }
  const modo = String(body.modo ?? '');
  if (!ESQUEMAS[modo]) return json({ erro: 'modo inválido' }, 400);

  const texto = clip(body.texto, modo === 'dividir' ? 300 : 3000);
  if (texto.trim().length < 2) return json({ erro: 'texto vazio' }, 400);
  if (CRISE.test(texto)) return json({ crise: true, mensagem: MSG_CRISE });

  const limite = Number(Deno.env.get('RITMO_IA_LIMITE') ?? 30);
  const { data: ok, error: el } = await admin.rpc('ritmo_ia_usar', { p_user: u.user.id, p_limite: limite });
  if (el) return json({ erro: 'falha ao contar uso' }, 500);
  if (!ok) return json({ erro: 'limite diário' }, 429);

  const perfil = body.perfil && typeof body.perfil === 'object' ? (body.perfil as Record<string, unknown>) : undefined;
  const entrada = {
    texto,
    energia: ['baixa', 'media', 'alta'].includes(String(body.energia)) ? body.energia : undefined,
    minutos: Math.max(5, Math.min(600, Number(body.minutos) || 60)),
    perfil: perfil ? {
      tracos: Array.isArray(perfil.tracos) ? perfil.tracos.slice(0, 10).map((t) => clip(t, 30)) : [],
      tom: perfil.tom === 'direto' ? 'direto' : 'acolhedor',
      valores: Array.isArray(perfil.valores) ? perfil.valores.slice(0, 5).map((t) => clip(t, 120)) : [],
      quero: Array.isArray(perfil.quero) ? perfil.quero.slice(0, 5).map((t) => clip(t, 120)) : [],
    } : undefined,
  };

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('RITMO_IA_MODELO') ?? 'claude-sonnet-5-5',
        max_tokens: 1500,
        system: `${BASE}\n\nTarefa: ${modo}\n${ESQUEMAS[modo]}`,
        messages: [{ role: 'user', content: JSON.stringify(entrada) }],
      }),
      signal: AbortSignal.timeout(28_000),
    });
    if (!r.ok) { console.error('anthropic', r.status); return json({ erro: 'IA indisponível' }, 502); }
    const out = await r.json();
    const txt: string = (out.content ?? []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('');
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return json({ erro: 'resposta inválida' }, 502);
    return json(JSON.parse(m[0]));
  } catch (e) {
    console.error('ritmo-ia', (e as Error).message);
    return json({ erro: 'falha ao consultar a IA' }, 502);
  }
});
