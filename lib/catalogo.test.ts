import { describe, expect, it } from "vitest";
import {
  consultasPorEspecialidade,
  rotuloConsultas,
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
  rotuloTipo,
  nomeItem,
  consultasPorTipo,
  type Itens,
} from "./catalogo";

const psicologia = pacotePorId("psicologia")!;

describe("vitrine", () => {
  it("abre com a avulsa e o pacote mais vendidos", () => {
    expect(PACOTES.slice(0, 2).map((p) => p.id)).toEqual(["nutricionista", "terapia-em-dia"]);
  });
  it("sem filtro devolve o catálogo inteiro", () => {
    expect(filtrar(PACOTES, null)).toHaveLength(PACOTES.length);
  });
  it("Descontos devolve só itens com preço riscado", () => {
    expect(filtrar(PACOTES, "descontos").map((p) => p.id)).toEqual(["terapia-em-dia", "mental", "equilibrio", "check-up"]);
  });
  it("Avulsas devolve só itens sem tag", () => {
    expect(filtrar(PACOTES, "avulsas").map((p) => p.id)).toEqual(["nutricionista", "psiquiatria", "psicologia", "clinico-geral", "especialista"]);
  });
  it("Pacotes devolve só itens com tag", () => {
    expect(filtrar(PACOTES, "pacotes").map((p) => p.id)).toEqual(["terapia-em-dia", "mental", "equilibrio", "check-up"]);
  });
  it("rótulo de tipo e compra com pacote", () => {
    expect(rotuloTipo(pacotePorId("psicologia")!)).toBe("AVULSO");
    expect(rotuloTipo(pacotePorId("mental")!)).toBe("PACOTE");
    expect(consultasPorTipo({ psicologia: 2 })).toEqual({ pacote: 0, avulsa: 2 });
    expect(consultasPorTipo({ mental: 1, nutricionista: 2 })).toEqual({ pacote: 3, avulsa: 2 });
    expect(consultasPorTipo({ "check-up": 2, mental: 0 })).toEqual({ pacote: 4, avulsa: 0 });
    expect(nomeItem(pacotePorId("mental")!)).toBe("Pacote 1 Psiquiatria e 2 Psicologias");
    expect(nomeItem(pacotePorId("psicologia")!)).toBe("Psicologia");
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
      totalDeCentavos: 26960,
      totalPorCentavos: 16973,
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
    const terapia = pacotePorId("terapia-em-dia")!;
    expect(percentualDesconto(terapia)).toBe(50);
    expect(percentualDesconto(pacotePorId("mental")!)).toBe(39);
    expect(percentualDesconto(pacotePorId("equilibrio")!)).toBe(24);
    expect(percentualDesconto({ ...terapia, precoPorCentavos: terapia.precoDeCentavos })).toBe(0);
  });
  it("singular e plural", () => {
    expect(rotuloItens(1)).toBe("1 Item");
    expect(rotuloItens(3)).toBe("3 Itens");
  });
});

describe("consultasPorEspecialidade", () => {
  it("agrupa por especialidade e multiplica pela quantidade", () => {
    expect(consultasPorEspecialidade({ "check-up": 1, psicologia: 2 })).toEqual([["Clínico geral", 1], ["Nutri", 1], ["Psicologia", 2]]);
  });
  it("soma a mesma especialidade de pacotes diferentes e tira o plural", () => {
    expect(consultasPorEspecialidade({ "terapia-em-dia": 1, psicologia: 1, "check-up": 1, equilibrio: 1 })).toEqual([
      ["Psicologia", 3], ["Clínico geral", 1], ["Nutri", 2], ["Endócrino", 1],
    ]);
  });
  it("ignora ids desconhecidos e quantidades inválidas", () => {
    expect(consultasPorEspecialidade({ nada: 2, psicologia: 0 })).toEqual([]);
  });
  it("rótulo singular e plural", () => {
    expect(rotuloConsultas(1)).toBe("1 Consulta");
    expect(rotuloConsultas(3)).toBe("3 Consultas");
  });
});

