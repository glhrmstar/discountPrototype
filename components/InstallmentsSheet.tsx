"use client";

import { useState } from "react";
import { BotaoPrincipal, Radio, Sheet } from "@/components/ui";
import { formatarBRL } from "@/lib/catalogo";
import { PARCELAS_MAX, valorParcela } from "@/lib/pagamento";

type Props = { totalCentavos: number; selecionada: number; onFechar: () => void; onConfirmar: (n: number) => void };

/** Tela 7.A — gaveta "Parcelas", aberta por cima de "Novo cartão". */
export default function InstallmentsSheet({ totalCentavos, selecionada, onFechar, onConfirmar }: Props) {
  const [sel, setSel] = useState(selecionada);
  const opcoes = Array.from({ length: PARCELAS_MAX }, (_, i) => i + 1);
  return (
    <Sheet topo onFechar={onFechar} titulo="Parcelas" rodape={<BotaoPrincipal onClick={() => onConfirmar(sel)}>Confirmar</BotaoPrincipal>}>
      <div role="radiogroup" aria-label="Quantidade de parcelas" className="flex flex-col overflow-hidden rounded-xl border border-[#dcdcdc]">
        {opcoes.map((n, i) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={sel === n}
            onClick={() => setSel(n)}
            className={`flex h-[72px] items-center gap-3 px-3 text-left ${i ? "border-t border-[#dcdcdc]" : ""}`}
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-base">{n}x de {formatarBRL(valorParcela(totalCentavos, n))}</span>
              <span className="text-sm text-[#808080]">{n > 1 ? "Sem juros · " : ""}Total {formatarBRL(totalCentavos)}</span>
            </span>
            <Radio on={sel === n} />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/** Campo "Parcelas" (Novo cartão e Trocar método): mostra a escolha atual e abre a gaveta de parcelas. */
export function CampoParcelas({ texto, onAbrir }: { texto: string; onAbrir: () => void }) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Parcelas: ${texto}`}
      onClick={onAbrir}
      className="flex h-14 w-full flex-wrap content-center items-center gap-x-2 rounded-2xl border border-[#b6b6b6] bg-[#f7f7f7] px-4 py-2 text-left shadow-[0_1px_2px_rgba(12,17,29,0.1)]"
    >
      <span className="basis-full text-xs leading-4 text-[#9c9c9c]">Parcelas</span>
      <span className="flex-1 text-base leading-6">{texto}</span>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="flex-none">
        <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="#808080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
