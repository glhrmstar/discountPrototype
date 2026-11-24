/**
 * Carrinho salvo no navegador (localStorage), para sobreviver a sair do fluxo de compra e a fechar a página.
 * Guarda só pacotes, quantidades e a pessoa escolhida — nada de pagamento. Expira em 7 dias.
 *
 * Produção: o carrinho de consultas é dado de saúde (LGPD). O ideal é guardar no backend, por conta,
 * e não no aparelho, que pode ser compartilhado. Aqui é só o protótipo.
 */
import { LIMITE_POR_PACOTE, PESSOAS, pacotePorId, type Itens } from "@/lib/catalogo";

export const CHAVE_CARRINHO = "starbem-proto-carrinho-v1";
export const VALIDADE_CARRINHO_MS = 7 * 24 * 60 * 60 * 1000;

export type CarrinhoSalvo = { itens: Itens; pessoa: string };

/** Serializa o carrinho; `null` quando vazio (nada a guardar). */
export function serializarCarrinho(c: CarrinhoSalvo, agora: number): string | null {
  if (!Object.keys(c.itens).length) return null;
  return JSON.stringify({ itens: c.itens, pessoa: c.pessoa, salvoEm: agora });
}

/** Lê e valida: ignora JSON inválido, carrinho vencido, pacotes desconhecidos e quantidades inválidas. */
export function desserializarCarrinho(texto: string | null, agora: number): CarrinhoSalvo | null {
  if (!texto) return null;
  let dado: unknown;
  try {
    dado = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!dado || typeof dado !== "object") return null;
  const { itens, pessoa, salvoEm } = dado as { itens?: unknown; pessoa?: unknown; salvoEm?: unknown };
  if (typeof salvoEm !== "number" || agora - salvoEm > VALIDADE_CARRINHO_MS || salvoEm > agora) return null;

  const limpos: Record<string, number> = {};
  if (itens && typeof itens === "object") {
    for (const [id, qtd] of Object.entries(itens as Record<string, unknown>)) {
      if (pacotePorId(id) && typeof qtd === "number" && Number.isInteger(qtd) && qtd > 0) limpos[id] = Math.min(qtd, LIMITE_POR_PACOTE);
    }
  }
  if (!Object.keys(limpos).length) return null;
  const pessoaOk = typeof pessoa === "string" && PESSOAS.some((p) => p.id === pessoa) ? pessoa : PESSOAS[0].id;
  return { itens: limpos, pessoa: pessoaOk };
}

/** Acesso ao localStorage protegido: pode não existir (SSR) ou lançar erro (modo privado, cota). */
export function lerCarrinho(): CarrinhoSalvo | null {
  try {
    return desserializarCarrinho(window.localStorage.getItem(CHAVE_CARRINHO), Date.now());
  } catch {
    return null;
  }
}

export function salvarCarrinho(c: CarrinhoSalvo): void {
  try {
    const texto = serializarCarrinho(c, Date.now());
    if (texto) window.localStorage.setItem(CHAVE_CARRINHO, texto);
    else window.localStorage.removeItem(CHAVE_CARRINHO);
  } catch {
    /* sem armazenamento disponível: o carrinho só vive na sessão */
  }
}

/** Apaga o carrinho salvo (compra concluída). */
export function apagarCarrinho(): void {
  try {
    window.localStorage.removeItem(CHAVE_CARRINHO);
  } catch {
    /* sem armazenamento disponível */
  }
}
