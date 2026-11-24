"use client";

import { useEffect, useMemo, useState } from "react";
import { BarraInferior, Header } from "@/components/ui";
import { formatarBRL } from "@/lib/catalogo";
import { mmss } from "@/lib/pagamento";

type Props = {
  totalCentavos: number;
  expiraEm: number;
  onVoltar: () => void;
  onCopiar: () => void;
  /** Protótipo: simula a confirmação do Pix pelo banco (não existe pagamento real). */
  onSimularPagamento: () => void;
};

/**
 * QR apenas ilustrativo: padrão gerado sem dados (não é lido por leitores de QR).
 * O QR do Figma é escaneável e aponta para um site de terceiros, por isso não foi usado.
 */
function QrIlustrativo() {
  const rects = useMemo(() => {
    const n = 25;
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const naFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    const out: [number, number][] = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!naFinder(x, y) && rnd() < 0.48) out.push([x, y]);
    return out;
  }, []);
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x * 10} y={y * 10} width={70} height={70} />
      <rect x={(x + 1) * 10} y={(y + 1) * 10} width={50} height={50} fill="#fff" />
      <rect x={(x + 2) * 10} y={(y + 2) * 10} width={30} height={30} />
    </g>
  );
  return (
    <svg viewBox="0 0 250 250" width={180} height={180} role="img" aria-label="QR code ilustrativo" shapeRendering="crispEdges">
      {rects.map(([x, y]) => <rect key={`${x}.${y}`} x={x * 10} y={y * 10} width={10} height={10} />)}
      {finder(0, 0)}
      {finder(18, 0)}
      {finder(0, 18)}
    </svg>
  );
}

/** Tela 10 — Aguardando pagamento via Pix (Figma 57:7293). */
export default function PixScreen({ totalCentavos, expiraEm, onVoltar, onCopiar, onSimularPagamento }: Props) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const restante = expiraEm - agora;

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-[calc(110px+env(safe-area-inset-bottom))] leading-[normal]">
      <Header titulo="Aguardando pagamento" onVoltar={onVoltar} />
      <div className="mt-12 flex flex-col items-center gap-8 text-center">
        <button type="button" onClick={onSimularPagamento} disabled={restante <= 0} aria-label="QR code ilustrativo. Toque para simular o pagamento confirmado">
          <QrIlustrativo />
        </button>
        <div className="flex flex-col gap-2 leading-none">
          <p className="text-xl font-semibold">Total a pagar</p>
          <p className="text-[40px]">{formatarBRL(totalCentavos)}</p>
        </div>
        {/* Figma: "Copie e o cole" (corrigido) */}
        <p className="text-xl">Copie e cole o código desse QR code no aplicativo do seu banco antes do tempo expirar.</p>
        <p className="text-xl leading-none font-semibold tabular-nums" aria-live="polite">
          {restante > 0 ? <>Expira em {mmss(restante)}</> : "Código expirado"}
        </p>
        <p className="text-xs text-muted">Protótipo: toque no QR code para simular o pagamento confirmado.</p>
      </div>
      <BarraInferior>
        <button type="button" onClick={onCopiar} disabled={restante <= 0} className="h-12 w-full rounded-lg bg-cta text-base font-semibold text-white disabled:bg-[#e9e9e9] disabled:text-[#696969]">
          Copiar código
        </button>
      </BarraInferior>
    </div>
  );
}
