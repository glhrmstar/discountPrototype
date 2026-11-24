/**
 * Catálogo e carrinho do protótipo "Compra avulsa".
 * Pacotes e preços são o mock do Figma (R$ 100,00 → R$ 50,00): substituir pela API antes de produção.
 * Valores sempre em centavos para não acumular erro de ponto flutuante.
 */

export type Filtro = "todos" | "descontos" | "individuais";

export type Pacote = {
  id: string;
  /** Nome da campanha; só os pacotes com desconto têm. */
  tag?: string;
  /** Consultas incluídas, uma por linha (o card reserva sempre duas linhas). */
  linhas: [string] | [string, string];
  precoDeCentavos: number;
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
  { id: "check-up", tag: "Check-up", linhas: ["1 Clinico geral", "1 Nutri"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
  { id: "equilibrio", tag: "Equilibrio", linhas: ["1 Endocrino", "1 Nutri"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
  { id: "mental", tag: "Mental", linhas: ["1 Psiquiatria", "2 Psicologias"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
  { id: "psicologia", linhas: ["1 Psicologia"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
  { id: "especialista", linhas: ["1 Especialista"], precoDeCentavos: 10000, precoPorCentavos: 5000 },
];

/** Percentual de desconto arredondado; 0 quando não há desconto. */
export function percentualDesconto(p: Pacote): number {
  if (p.precoDeCentavos <= 0 || p.precoPorCentavos >= p.precoDeCentavos) return 0;
  return Math.round((1 - p.precoPorCentavos / p.precoDeCentavos) * 100);
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

/** Remove o pacote inteiro do carrinho (ação da lixeira). */
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
      return {
        quantidade: acc.quantidade + qtd,
        totalDeCentavos: acc.totalDeCentavos + p.precoDeCentavos * qtd,
        totalPorCentavos: acc.totalPorCentavos + p.precoPorCentavos * qtd,
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
