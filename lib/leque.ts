/**
 * Leque de cartas da tela "Pagamento concluído": uma carta por consulta comprada, até LEQUE_MAX.
 * 1 carta fica parada; 2+ abrem a partir do centro. Passo de 30° entre cartas (±15° com 2, como no Figma 76:7609),
 * limitado a 90° de abertura total. As cartas giram em torno de um pivô abaixo delas (PIVO_Y = 154% da altura).
 */
export const LEQUE_MAX = 6;
export const CARTA = { largura: 50.192, altura: 79.471, topo: 7.4 } as const;
export const PIVO_Y = 1.54;
const ABRE_MS = 350;
const ESCALONA_MS = 60;
const DURACAO_MS = 700;

export type Carta = { anguloGraus: number; atrasoMs: number };
export type Leque = { cartas: Carta[]; alturaPx: number; textoAposMs: number };

export function montarLeque(totalConsultas: number): Leque {
  const n = Math.max(1, Math.min(LEQUE_MAX, Math.floor(totalConsultas) || 1));
  const passo = n > 1 ? Math.min(30, 90 / (n - 1)) : 0;
  const meio = (n - 1) / 2;
  const cartas = Array.from({ length: n }, (_, i) => ({
    anguloGraus: Number(((i - meio) * passo).toFixed(2)),
    atrasoMs: Math.round(ABRE_MS + Math.abs(i - meio) * ESCALONA_MS),
  }));
  /* canto mais baixo da carta mais inclinada, para o leque não encostar no título */
  const t = (meio * passo * Math.PI) / 180;
  const pivo = CARTA.topo + CARTA.altura * PIVO_Y;
  const metade = CARTA.largura / 2;
  const base = CARTA.altura * PIVO_Y - CARTA.altura; // distância do pivô até a base da carta
  const baixo = pivo + Math.max(...[-metade, metade].map((dx) => dx * Math.sin(t) - base * Math.cos(t)));
  const alturaPx = Math.max(92, Math.ceil(baixo) - 3); // -3: com 2 cartas mantém os 92px do Figma
  const textoAposMs = n > 1 ? Math.round((ABRE_MS + meio * ESCALONA_MS + DURACAO_MS) * 0.8) : 400;
  return { cartas, alturaPx, textoAposMs };
}
