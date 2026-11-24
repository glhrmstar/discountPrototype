import { describe, expect, it } from "vitest";
import { LEQUE_MAX, montarLeque } from "./leque";

describe("montarLeque", () => {
  it("uma carta por consulta, parada quando é só uma", () => {
    const l = montarLeque(1);
    expect(l.cartas).toEqual([{ anguloGraus: 0, atrasoMs: 350 }]);
    expect(l.alturaPx).toBe(92);
  });
  it("duas cartas a ±15°, como no Figma", () => {
    expect(montarLeque(2).cartas.map((c) => c.anguloGraus)).toEqual([-15, 15]);
    expect(montarLeque(2).alturaPx).toBe(92);
  });
  it("três cartas abrem a partir do centro", () => {
    const l = montarLeque(3);
    expect(l.cartas.map((c) => c.anguloGraus)).toEqual([-30, 0, 30]);
    expect(l.cartas[1].atrasoMs).toBeLessThan(l.cartas[0].atrasoMs);
    expect(l.alturaPx).toBeGreaterThan(92);
  });
  it(`no máximo ${LEQUE_MAX} cartas e abertura de 90°`, () => {
    const l = montarLeque(20);
    expect(l.cartas).toHaveLength(LEQUE_MAX);
    expect(l.cartas[0].anguloGraus).toBe(-45);
    expect(l.cartas[LEQUE_MAX - 1].anguloGraus).toBe(45);
  });
  it("quantidade inválida vira uma carta", () => {
    expect(montarLeque(0).cartas).toHaveLength(1);
    expect(montarLeque(Number.NaN).cartas).toHaveLength(1);
  });
});
