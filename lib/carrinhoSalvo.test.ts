import { describe, expect, it } from "vitest";
import { LIMITE_POR_PACOTE } from "./catalogo";
import { VALIDADE_CARRINHO_MS, desserializarCarrinho, serializarCarrinho } from "./carrinhoSalvo";

const agora = 1_800_000_000_000;

describe("carrinho salvo", () => {
  it("ida e volta preserva itens e pessoa", () => {
    const texto = serializarCarrinho({ itens: { "check-up": 1, psicologia: 2 }, pessoa: "dep-2" }, agora);
    expect(desserializarCarrinho(texto, agora + 1000)).toEqual({ itens: { "check-up": 1, psicologia: 2 }, pessoa: "dep-2" });
  });
  it("carrinho vazio não é salvo", () => {
    expect(serializarCarrinho({ itens: {}, pessoa: "titular" }, agora)).toBeNull();
  });
  it("expira depois de 7 dias", () => {
    const texto = serializarCarrinho({ itens: { mental: 1 }, pessoa: "titular" }, agora);
    expect(desserializarCarrinho(texto, agora + VALIDADE_CARRINHO_MS + 1)).toBeNull();
  });
  it("ignora JSON inválido e formatos inesperados", () => {
    expect(desserializarCarrinho("{lixo", agora)).toBeNull();
    expect(desserializarCarrinho("[]", agora)).toBeNull();
    expect(desserializarCarrinho(JSON.stringify({ itens: { mental: 1 } }), agora)).toBeNull();
  });
  it("descarta pacotes desconhecidos e quantidades inválidas, limita ao máximo e corrige a pessoa", () => {
    const texto = JSON.stringify({ itens: { fantasma: 3, mental: "2", "check-up": -1, psicologia: 50 }, pessoa: "hacker", salvoEm: agora });
    expect(desserializarCarrinho(texto, agora)).toEqual({ itens: { psicologia: LIMITE_POR_PACOTE }, pessoa: "titular" });
  });
});
