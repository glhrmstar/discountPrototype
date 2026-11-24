/**
 * Catálogo, carrinho e regras de preço do protótipo "Compra avulsa".
 * Preços e faixas são o mock do Figma: substituir pela API/regra de negócio antes de produção.
 * Valores sempre em centavos para não acumular erro de ponto flutuante.
 */

export type Filtro = "todos" | "descontos" | "individuais";

export type Pacote = {
  id: string;
  /** Nome da campanha. Pacotes com tag têm desconto fixo; sem tag são consultas individuais. */
  tag?: string;
  /** Consultas incluídas, uma por linha (o card reserva sempre duas linhas). */
  linhas: [string] | [string, string];
  precoDeCentavos: number;
  /** Preço com desconto fixo (pacotes de campanha). Individuais usam as FAIXAS. */
  precoPorCentavos: number;
};

/** Quantidade por id de pacote. Um id ausente equivale a zero. */
export type Itens = Readonly<Record<string, number>>;

export type Pessoa = { id: string; nome: string; tipo: "Titular" | "Dependente" };

/** Dados fictícios. */
export const PESSOAS: readonly Pessoa[] = [
  { id: "titular", nome: "Guilherme Marques", tipo: "Titular" },
  { id: "dep-1", nome: "Lucas Almeida", tipo: "Dependente" },
  { id: "dep-2", nome: "Vanessa Camargo", tipo: "Dependente" },
  { id: "dep-3", nome: "Antonio Oliveira", tipo: "Dependente" },
];

export const PACOTES: readonly Pacote[] = [
  { id: "terapia-em-dia", tag: "Terapia em dia", linhas: ["2 Psicologias"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
  { id: "check-up", tag: "Check-up", linhas: ["1 Clínico geral", "1 Nutri"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
  { id: "equilibrio", tag: "Equilíbrio", linhas: ["1 Endócrino", "1 Nutri"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
  { id: "mental", tag: "Mental", linhas: ["1 Psiquiatria", "2 Psicologias"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
  { id: "psicologia", linhas: ["1 Psicologia"], precoDeCentavos: 4990, precoPorCentavos: 4990 },
  { id: "especialista", linhas: ["1 Especialista"], precoDeCentavos: 4990, precoPorCentavos: 4990 },
];

export const pacotePorId = (id: string) => PACOTES.find((p) => p.id === id);
export const ehIndividual = (p: Pacote) => !p.tag;

/** Desconto progressivo das consultas individuais: [consultas, % de desconto]. Contado por item. */
export const FAIXAS: readonly (readonly [number, number])[] = [
  [2, 15],
  [4, 20],
  [6, 25],
  [8, 30],
];

export function descontoIndividual(qtd: number): number {
  return FAIXAS.reduce((pct, [min, p]) => (qtd >= min ? p : pct), 0);
}

/** Próxima faixa ainda não atingida, ou undefined se já está na máxima. */
export function proximaFaixa(qtd: number): { faltam: number; pct: number } | undefined {
  const f = FAIXAS.find(([min]) => qtd < min);
  return f ? { faltam: f[0] - qtd, pct: f[1] } : undefined;
}

/** Percentual exibido no selo do pacote (0 quando não há desconto). */
export function percentualDesconto(p: Pacote, qtd = 1): number {
  if (ehIndividual(p)) return descontoIndividual(qtd);
  if (p.precoDeCentavos <= 0 || p.precoPorCentavos >= p.precoDeCentavos) return 0;
  return Math.round((1 - p.precoPorCentavos / p.precoDeCentavos) * 100);
}

/** Preço de uma linha do carrinho (pacote × quantidade). */
export function precoItem(p: Pacote, qtd: number): { deCentavos: number; porCentavos: number } {
  const de = p.precoDeCentavos * qtd;
  if (ehIndividual(p)) return { deCentavos: de, porCentavos: Math.round((de * (100 - descontoIndividual(qtd))) / 100) };
  return { deCentavos: de, porCentavos: p.precoPorCentavos * qtd };
}

/** "Descontos" = pacotes de campanha (com tag); "Individuais" = os demais. */
export function filtrar(pacotes: readonly Pacote[], filtro: Filtro): Pacote[] {
  if (filtro === "descontos") return pacotes.filter((p) => p.tag);
  if (filtro === "individuais") return pacotes.filter((p) => !p.tag);
  return [...pacotes];
}

export const LIMITE_POR_PACOTE = 10;

export function adicionar(itens: Itens, id: string): Itens {
  const atual = itens[id] ?? 0;
  if (atual >= LIMITE_POR_PACOTE) return itens;
  return { ...itens, [id]: atual + 1 };
}

/** Tira uma unidade; com 1 unidade, remove o pacote. */
export function diminuir(itens: Itens, id: string): Itens {
  const atual = itens[id] ?? 0;
  if (atual <= 1) return remover(itens, id);
  return { ...itens, [id]: atual - 1 };
}

/** Remove o pacote inteiro do carrinho (lixeira e "Limpar"). */
export function remover(itens: Itens, id: string): Itens {
  if (!(id in itens)) return itens;
  const { [id]: _removido, ...resto } = itens;
  return resto;
}

export type Resumo = { quantidade: number; totalDeCentavos: number; totalPorCentavos: number };

/** Ignora ids que não existem no catálogo e quantidades inválidas. */
export function resumo(itens: Itens, pacotes: readonly Pacote[] = PACOTES): Resumo {
  const porId = new Map(pacotes.map((p) => [p.id, p]));
  return Object.entries(itens).reduce<Resumo>(
    (acc, [id, qtd]) => {
      const p = porId.get(id);
      if (!p || !Number.isInteger(qtd) || qtd <= 0) return acc;
      const v = precoItem(p, qtd);
      return {
        quantidade: acc.quantidade + qtd,
        totalDeCentavos: acc.totalDeCentavos + v.deCentavos,
        totalPorCentavos: acc.totalPorCentavos + v.porCentavos,
      };
    },
    { quantidade: 0, totalDeCentavos: 0, totalPorCentavos: 0 },
  );
}

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Ex.: 5000 → "R$ 50,00" (com espaço comum, não o não separável do Intl). */
export function formatarBRL(centavos: number): string {
  return fmt.format(centavos / 100).replace(/ /g, " ");
}

export const rotuloItens = (n: number) => `${n} ${n === 1 ? "Item" : "Itens"}`;

/**
 * Consultas compradas agrupadas por especialidade (tela "Pagamento concluído").
 * Ex.: Check-up + 2× Psicologia → [["Clínico geral", 1], ["Nutri", 1], ["Psicologia", 2]].
 * As linhas do catálogo seguem o formato "<n> <Especialidade>" (plural com "s" quando n > 1).
 */
export function consultasPorEspecialidade(itens: Itens, pacotes: readonly Pacote[] = PACOTES): [string, number][] {
  const porId = new Map(pacotes.map((p) => [p.id, p]));
  const total = new Map<string, number>();
  for (const [id, qtd] of Object.entries(itens)) {
    const p = porId.get(id);
    if (!p || !Number.isInteger(qtd) || qtd <= 0) continue;
    for (const linha of p.linhas) {
      const m = /^(\d+)\s+(.+)$/.exec(linha.trim());
      const n = m ? Number(m[1]) : 1;
      const nome = m ? (n > 1 ? m[2].replace(/s$/, "") : m[2]) : linha.trim();
      total.set(nome, (total.get(nome) ?? 0) + n * qtd);
    }
  }
  return [...total];
}

export const rotuloConsultas = (n: number) => `${n} ${n === 1 ? "Consulta" : "Consultas"}`;
