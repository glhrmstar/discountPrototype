import { describe, expect, it } from "vitest";
import {
  LIMITE_POR_PACOTE,
  PACOTES,
  adicionar,
  descontoIndividual,
  diminuir,
  filtrar,
  formatarBRL,
  pacotePorId,
  percentualDesconto,
  precoItem,
  proximaFaixa,
  remover,
  resumo,
  rotuloItens,
  type Itens,
} from "./catalogo";

const psicologia = pacotePorId("psicologia")!;

describe("filtrar", () => {
  it("Todos devolve o catálogo inteiro", () => {
    expect(filtrar(PACOTES, "todos")).toHaveLength(PACOTES.length);
  });
  it("Descontos devolve só pacotes com tag", () => {
    expect(filtrar(PACOTES, "descontos").map((p) => p.id)).toEqual(["terapia-em-dia", "check-up", "equilibrio", "mental"]);
  });
  it("Individuais devolve só pacotes sem tag", () => {
    expect(filtrar(PACOTES, "individuais").map((p) => p.id)).toEqual(["psicologia", "especialista"]);
  });
});

describe("desconto progressivo (individuais)", () => {
  it("faixas 2/4/6/8 → 15/20/25/30%", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 10].map(descontoIndividual)).toEqual([0, 15, 15, 20, 20, 25, 25, 30, 30]);
  });
  it("próxima faixa", () => {
    expect(proximaFaixa(1)).toEqual({ faltam: 1, pct: 15 });
    expect(proximaFaixa(3)).toEqual({ faltam: 1, pct: 20 });
    expect(proximaFaixa(8)).toBeUndefined();
  });
  it("preço com faixa aplicada e arredondado em centavos", () => {
    expect(precoItem(psicologia, 1)).toEqual({ deCentavos: 4990, porCentavos: 4990 });
    expect(precoItem(psicologia, 3)).toEqual({ deCentavos: 14970, porCentavos: 12725 });
    expect(percentualDesconto(psicologia, 8)).toBe(30);
  });
});

describe("carrinho", () => {
  it("adicionar soma uma unidade e não muta o original", () => {
    const vazio: Itens = {};
    const um = adicionar(vazio, "mental");
    expect(um).toEqual({ mental: 1 });
    expect(vazio).toEqual({});
    expect(adicionar(um, "mental")).toEqual({ mental: 2 });
  });
  it("adicionar respeita o limite por pacote", () => {
    let itens: Itens = {};
    for (let i = 0; i < LIMITE_POR_PACOTE + 3; i++) itens = adicionar(itens, "mental");
    expect(itens.mental).toBe(LIMITE_POR_PACOTE);
  });
  it("diminuir tira uma unidade e remove na última", () => {
    expect(diminuir({ mental: 2 }, "mental")).toEqual({ mental: 1 });
    expect(diminuir({ mental: 1 }, "mental")).toEqual({});
  });
  it("remover tira o pacote inteiro", () => {
    expect(remover({ mental: 3, "check-up": 1 }, "mental")).toEqual({ "check-up": 1 });
  });
  it("remover id ausente devolve o mesmo objeto", () => {
    const itens: Itens = { mental: 1 };
    expect(remover(itens, "nao-existe")).toBe(itens);
  });
});

describe("resumo", () => {
  it("soma pacotes com desconto fixo e individuais com faixa", () => {
    expect(resumo({ "check-up": 1, psicologia: 2 })).toEqual({
      quantidade: 3,
      totalDeCentavos: 19980,
      totalPorCentavos: 13483,
    });
  });
  it("ignora ids desconhecidos e quantidades inválidas", () => {
    expect(resumo({ fantasma: 4, mental: 0, check: -1, "check-up": 1.5 })).toEqual({
      quantidade: 0,
      totalDeCentavos: 0,
      totalPorCentavos: 0,
    });
  });
});

describe("formatação", () => {
  it("formata reais", () => {
    expect(formatarBRL(5000)).toBe("R$ 50,00");
    expect(formatarBRL(123456)).toBe("R$ 1.234,56");
  });
  it("percentual de desconto de pacote", () => {
    expect(percentualDesconto(PACOTES[0])).toBe(50);
    expect(percentualDesconto({ ...PACOTES[0], precoPorCentavos: 10000 })).toBe(0);
  });
  it("singular e plural", () => {
    expect(rotuloItens(1)).toBe("1 Item");
    expect(rotuloItens(3)).toBe("3 Itens");
  });
});
