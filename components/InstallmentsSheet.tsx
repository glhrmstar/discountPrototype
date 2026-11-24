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
