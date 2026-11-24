import { describe, expect, it } from "vitest";
import { CARTAO_EXEMPLO, formValido, mascarar, mmss, textoParcela, ultimos4, valorParcela, type FormCartao } from "./pagamento";

describe("máscaras", () => {
  it("cartão em grupos de 4, até 16 dígitos", () => {
    expect(mascarar("cartao", "4111111111111111999")).toBe("4111 1111 1111 1111");
  });
  it("CPF 000.000.000-00", () => {
    expect(mascarar("cpf", "12345678909")).toBe("123.456.789-09");
    expect(mascarar("cpf", "1234")).toBe("123.4");
  });
  it("validade MM/AA, CEP e UF", () => {
    expect(mascarar("venc", "1229")).toBe("12/29");
    expect(mascarar("cep", "01310100")).toBe("01310-100");
    expect(mascarar("uf", "s p 1")).toBe("SP");
  });
  it("campo de texto livre só limita o tamanho", () => {
    expect(mascarar("nome", "a".repeat(100))).toHaveLength(80);
  });
});

describe("formValido", () => {
  const completo: FormCartao = {
    nome: "Maria Teste", cartao: "4111 1111 1111 1111", cpf: "123.456.789-09", venc: "12/29", cvv: "123",
    cep: "01310-100", end: "Av. Exemplo", num: "100", bairro: "Centro", cidade: "São Paulo", uf: "SP", pais: "BR",
  };
  it("aceita sem complemento (opcional)", () => {
    expect(formValido(completo)).toBe(true);
  });
  it("dados de exemplo são válidos e já mascarados", () => {
    expect(formValido(CARTAO_EXEMPLO)).toBe(true);
    for (const [k, v] of Object.entries(CARTAO_EXEMPLO)) expect(mascarar(k as keyof FormCartao, v!)).toBe(v);
  });
  it("recusa campo obrigatório vazio", () => {
    expect(formValido({ ...completo, bairro: "  " })).toBe(false);
  });
  it("recusa número de cartão curto", () => {
    expect(formValido({ ...completo, cartao: "4111 1111" })).toBe(false);
  });
});

describe("utilitários", () => {
  it("últimos 4 dígitos", () => {
    expect(ultimos4("4111 1111 1111 4321")).toBe("4321");
  });
  it("mm:ss sem negativos", () => {
    expect(mmss(30 * 60 * 1000)).toBe("30:00");
    expect(mmss(61_500)).toBe("01:02");
    expect(mmss(-5)).toBe("00:00");
  });
});

describe("parcelas", () => {
  const brl = (c: number) => `R$ ${(c / 100).toFixed(2).replace(".", ",")}`;
  it("arredonda a parcela para cima", () => {
    expect(valorParcela(9990, 2)).toBe(4995);
    expect(valorParcela(13483, 2)).toBe(6742);
    expect(valorParcela(5000, 0)).toBe(5000);
  });
  it("texto com 'sem juros' só a partir de 2x", () => {
    expect(textoParcela(9990, 1, brl)).toBe("1x de R$ 99,90");
    expect(textoParcela(9990, 2, brl)).toBe("2x de R$ 49,95 sem juros");
  });
  it("cartão de exemplo é Mastercard de teste", () => {
    expect(ultimos4(CARTAO_EXEMPLO.cartao!)).toBe("4444");
  });
});
