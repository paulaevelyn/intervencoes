import type { Level3, Profile, Settings } from './types';
import type { Bloco, Plano } from './data/planner';
import { practiceById } from './data/library';
import { estadoById, type EstadoInfo } from './data/estados';
import type { Guia } from './data/sensacoes';

/* Ajuda de IA (opcional). O Ritmo só envia texto quando a pessoa pede, tem conta e consentiu.
   A chamada passa pela função ritmo-ia (Supabase), que guarda só um contador diário. */

export const IA_CONSENT_VERSION = '2026-11-04';
const CRISE = /suic[ií]d|me matar|me machucar|me ferir|acabar com (a )?(minha )?vida|n[aã]o quero (mais )?viver|queria (sumir|morrer)/i;

type Falha = { ok: false; motivo: 'desligada' | 'sem-conta' | 'crise' | 'limite' | 'erro'; mensagem: string };
export type Resultado<T> = { ok: true; data: T } | Falha;

interface PeaAuth { cliente(): { functions: { invoke(n: string, o: { body: unknown }): Promise<{ data: unknown; error: { message?: string; context?: Response } | null }> } } | null; usuario(): unknown }
const auth = () => (window as unknown as { PeaAuth?: PeaAuth }).PeaAuth;

export const iaLigada = (s: Settings) => s.ai.enabled && s.ai.consent === IA_CONSENT_VERSION;
export const iaTemConta = () => !!auth()?.usuario();

const str = (x: unknown, n = 300) => (typeof x === 'string' ? x.trim().slice(0, n) : '');
const list = (x: unknown, n = 8, m = 300) => (Array.isArray(x) ? x.map((i) => str(i, m)).filter(Boolean).slice(0, n) : []);

async function chamar(s: Settings, modo: string, corpo: Record<string, unknown>, perfil: Profile): Promise<Resultado<Record<string, unknown>>> {
  if (!iaLigada(s)) return { ok: false, motivo: 'desligada', mensagem: 'A ajuda de IA está desligada. Você pode ligar em Ajustes.' };
  const texto = JSON.stringify(corpo);
  if (CRISE.test(texto)) return { ok: false, motivo: 'crise', mensagem: 'Parece que você está passando por algo muito difícil. Você não precisa enfrentar isso sozinho/a. Ligue 188 (CVV, 24h) ou 192 (SAMU).' };
  const cli = auth()?.cliente();
  if (!cli || !auth()?.usuario()) return { ok: false, motivo: 'sem-conta', mensagem: 'Para usar a IA, entre numa conta (botão no canto superior direito).' };
  const body = { modo, ...corpo, perfil: s.ai.useProfile ? { tracos: perfil.traits, tom: perfil.tone, valores: perfil.values.slice(0, 5), quero: perfil.wants.slice(0, 5) } : undefined };
  try {
    const r = await Promise.race([
      cli.functions.invoke('ritmo-ia', { body }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('tempo')), 35_000)),
    ]);
    if (r.error) {
      const status = r.error.context?.status;
      if (status === 429) return { ok: false, motivo: 'limite', mensagem: 'Você chegou ao limite de usos da IA por hoje. Use as sugestões sem IA, ou volte amanhã.' };
      return { ok: false, motivo: 'erro', mensagem: 'A IA não respondeu agora. Mostrei a versão sem IA.' };
    }
    const d = r.data as Record<string, unknown> | null;
    if (!d || typeof d !== 'object') return { ok: false, motivo: 'erro', mensagem: 'A resposta da IA veio num formato inesperado. Mostrei a versão sem IA.' };
    if (d.crise === true) return { ok: false, motivo: 'crise', mensagem: str(d.mensagem, 400) || 'Se você está em risco, ligue 188 (CVV, 24h) ou 192 (SAMU).' };
    return { ok: true, data: d };
  } catch {
    return { ok: false, motivo: 'erro', mensagem: 'Não consegui falar com a IA agora. Mostrei a versão sem IA.' };
  }
}

export async function iaPlanejar(s: Settings, perfil: Profile, texto: string, energia: Level3, minutos: number): Promise<Resultado<Plano>> {
  const r = await chamar(s, 'planejar', { texto: texto.slice(0, 3000), energia, minutos }, perfil);
  if (!r.ok) return r;
  const d = r.data;
  const blocos: Bloco[] = (Array.isArray(d.blocos) ? d.blocos : []).slice(0, 14).map((b: Record<string, unknown>) => ({
    tipo: b.tipo === 'pausa' ? 'pausa' as const : 'tarefa' as const,
    titulo: str(b.titulo, 140),
    minutos: Math.max(1, Math.min(240, Math.round(Number(b.minutos) || 10))),
    nota: str(b.nota, 240) || undefined,
    passos: list(b.passos, 6, 160),
  })).filter((b) => b.titulo);
  if (!blocos.some((b) => b.tipo === 'tarefa')) return { ok: false, motivo: 'erro', mensagem: 'A IA não conseguiu montar um plano. Mostrei a versão sem IA.' };
  return { ok: true, data: { blocos, depois: list(d.depois, 15, 140), dicas: list(d.dicas, 3, 240), fonte: 'ia' } };
}

export async function iaDividir(s: Settings, perfil: Profile, titulo: string): Promise<Resultado<string[]>> {
  const r = await chamar(s, 'dividir', { texto: titulo.slice(0, 300) }, perfil);
  if (!r.ok) return r;
  const passos = list(r.data.passos, 6, 160);
  return passos.length >= 3 ? { ok: true, data: passos } : { ok: false, motivo: 'erro', mensagem: 'A IA não conseguiu dividir. Usei a divisão sem IA.' };
}

export async function iaEntender(s: Settings, perfil: Profile, texto: string): Promise<Resultado<Guia>> {
  const r = await chamar(s, 'entender', { texto: texto.slice(0, 2000) }, perfil);
  if (!r.ok) return r;
  const d = r.data;
  const hip = (Array.isArray(d.estados) ? d.estados : []).map((e) => estadoById(str(e, 30))).filter((e): e is EstadoInfo => !!e).slice(0, 3);
  const regular = list(d.regular, 4, 40).filter((id) => practiceById(id));
  const guia: Guia = {
    hipoteses: hip, principal: hip[0],
    precisa: list(d.precisa, 4, 140), comoFazer: list(d.como_fazer, 5, 240),
    regular: regular.length ? regular : hip[0]?.praticas ?? ['respiracao'],
    parar: list(d.parar, 4, 240), compaixao: str(d.compaixao, 300),
    ajuda: str(d.ajuda, 300) || 'Se você se sentir em risco, ligue 188 (CVV, 24h) ou 192 (SAMU).',
    poucasPistas: hip.length === 0,
  };
  if (!guia.precisa.length && !guia.parar.length) return { ok: false, motivo: 'erro', mensagem: 'A resposta da IA veio incompleta. Mostrei a versão sem IA.' };
  return { ok: true, data: guia };
}
