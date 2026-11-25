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

/** roxa = consulta de pacote; laranja (roxa: false) = consulta avulsa. */
export type Carta = { anguloGraus: number; atrasoMs: number; roxa: boolean };
export type Leque = { cartas: Carta[]; alturaPx: number; textoAposMs: number };

/**
 * Cor de cada carta pelo que foi comprado: só avulsas = laranja, só pacotes = roxa, compra mista = as duas.
 * Na mista a proporção segue as consultas (com pelo menos 1 carta de cada cor) e as cores são intercaladas.
 */
export function coresLeque(n: number, consultasDePacote: number, totalConsultas: number): boolean[] {
  let roxas = totalConsultas > 0 ? Math.round((n * consultasDePacote) / totalConsultas) : 0;
  if (consultasDePacote > 0 && consultasDePacote < totalConsultas) roxas = Math.min(n - 1, Math.max(1, roxas));
  return Array.from({ length: n }, (_, i) => Math.floor(((i + 1) * roxas) / n) > Math.floor((i * roxas) / n));
}

export function montarLeque(totalConsultas: number, consultasDePacote = 0): Leque {
  const n = Math.max(1, Math.min(LEQUE_MAX, Math.floor(totalConsultas) || 1));
  const roxas = coresLeque(n, consultasDePacote, Math.floor(totalConsultas) || 0);
  const passo = n > 1 ? Math.min(30, 90 / (n - 1)) : 0;
  const meio = (n - 1) / 2;
  const cartas = Array.from({ length: n }, (_, i) => ({
    anguloGraus: Number(((i - meio) * passo).toFixed(2)),
    atrasoMs: Math.round(ABRE_MS + Math.abs(i - meio) * ESCALONA_MS),
    roxa: roxas[i],
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
