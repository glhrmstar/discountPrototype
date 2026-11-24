"use client";

import { useState } from "react";
import { iconeMetodo, type OpcaoMetodo } from "@/components/CartScreen";
import InstallmentsDropdown from "@/components/InstallmentsDropdown";
import { BotaoPrincipal, Radio, Sheet } from "@/components/ui";
import type { MetodoId } from "@/lib/pagamento";

type Props = {
  cartaoFinal: string | null;
  metodoAtual: MetodoId | null;
  totalCentavos: number;
  parcelas: number;
  onParcelas: (n: number) => void;
  onFechar: () => void;
  /** "novo" abre a gaveta Novo cartão; os demais viram o método escolhido. */
  onConfirmar: (m: OpcaoMetodo) => void;
};

/**
 * Tela 8.A — gaveta "Método de pagamento" (Figma 57:6925), aberta ao tocar no cartão escolhido.
 * Cartão salvo primeiro; quando ele está marcado, o dropdown de parcelas aparece logo abaixo.
 * Figma: o título repetia "Novo cartão"; aqui é "Método de pagamento".
 */
export default function ChangeMethodSheet({ cartaoFinal, metodoAtual, totalCentavos, parcelas, onParcelas, onFechar, onConfirmar }: Props) {
  const [sel, setSel] = useState<OpcaoMetodo | null>(metodoAtual);
  const opcoes: { id: OpcaoMetodo; nome: string }[] = [
    ...(cartaoFinal ? [{ id: "cartao" as const, nome: `**** ${cartaoFinal}` }] : []),
    { id: "novo", nome: "Novo cartão de crédito" },
    { id: "pix", nome: "Pix" },
    { id: "apple", nome: "Apple Pay" },
  ];

  return (
    <>
      <Sheet onFechar={onFechar} titulo="Método de pagamento" rodape={<BotaoPrincipal disabled={!sel} onClick={() => sel && onConfirmar(sel)}>Confirmar</BotaoPrincipal>}>
        <div role="radiogroup" aria-label="Método de pagamento" className="flex flex-col divide-y divide-[#dcdcdc] overflow-hidden rounded-xl border border-[#dcdcdc] py-1">
          {opcoes.map((o) => (
            <div key={o.id} className="py-1">
              <button type="button" role="radio" aria-checked={sel === o.id} onClick={() => setSel(o.id)} className="flex h-12 w-full items-center gap-3 px-3 text-left text-base">
                <span className="grid size-10 shrink-0 place-items-center">{iconeMetodo(o.id)}</span>
                <span className="min-w-0 flex-1">{o.nome}</span>
                <Radio on={sel === o.id} />
              </button>
              {o.id === "cartao" && sel === "cartao" && (
                <div className="px-3 pt-2 pb-1">
                  <InstallmentsDropdown totalCentavos={totalCentavos} parcelas={parcelas} onParcelas={onParcelas} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}
