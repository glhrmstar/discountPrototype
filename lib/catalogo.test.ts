import { describe, expect, it } from "vitest";
import {
  LIMITE_POR_PACOTE,
  PACOTES,
  adicionar,
  filtrar,
  formatarBRL,
  percentualDesconto,
  remover,
  resumo,
  rotuloItens,
  type Itens,
} from "./catalogo";

describe("filtrar", () => {
  it("Todos devolve o catálogo inteiro", () => {
    expect(filtrar(PACOTES, "todos")).toHaveLength(PACOTES.length);
  });
  it("Descontos devolve só pacotes com tag", () => {
    const r = filtrar(PACOTES, "descontos");
    expect(r.map((p) => p.id)).toEqual(["terapia-em-dia", "check-up", "equilibrio", "mental"]);
  });
  it("Individuais devolve só pacotes sem tag", () => {
    expect(filtrar(PACOTES, "individuais").map((p) => p.id)).toEqual(["psicologia", "especialista"]);
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
  it("remover tira o pacote inteiro", () => {
    expect(remover({ mental: 3, "check-up": 1 }, "mental")).toEqual({ "check-up": 1 });
  });
  it("remover id ausente devolve o mesmo objeto", () => {
    const itens: Itens = { mental: 1 };
    expect(remover(itens, "nao-existe")).toBe(itens);
  });
});

describe("resumo", () => {
  it("soma quantidades e totais em centavos", () => {
    expect(resumo({ "terapia-em-dia": 2, "check-up": 1 })).toEqual({
      quantidade: 3,
      totalDeCentavos: 30000,
      totalPorCentavos: 15000,
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
  it("percentual de desconto", () => {
    expect(percentualDesconto(PACOTES[0])).toBe(50);
    expect(percentualDesconto({ ...PACOTES[0], precoPorCentavos: 10000 })).toBe(0);
  });
  it("singular e plural", () => {
    expect(rotuloItens(1)).toBe("1 Item");
    expect(rotuloItens(3)).toBe("3 Itens");
  });
});
