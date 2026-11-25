"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatarBRL } from "@/lib/catalogo";
import { PARCELAS_MAX, textoParcela, valorParcela } from "@/lib/pagamento";

type Props = { totalCentavos: number; parcelas: number; onParcelas: (n: number) => void };

/**
 * Campo "Parcelas" em dropdown (Novo cartão e Trocar método): a lista abre logo abaixo do campo,
 * sem abrir outra gaveta. Toque fora ou Esc fecham a lista (o Esc não fecha a gaveta por trás).
 */
export default function InstallmentsDropdown({ totalCentavos, parcelas, onParcelas }: Props) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const idLista = useId();
  const opcoes = Array.from({ length: PARCELAS_MAX }, (_, i) => i + 1);
  const texto = textoParcela(totalCentavos, parcelas, formatarBRL);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto]);

  return (
    <div
      ref={raiz}
      className="flex flex-col gap-2"
      onKeyDown={(e) => {
        if (e.key === "Escape" && aberto) {
          e.preventDefault(); /* a gaveta ignora Esc já tratado */
          e.stopPropagation();
          setAberto(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={idLista}
        aria-label={`Parcelas: ${texto}`}
        onClick={(e) => {
          e.currentTarget.focus(); /* tira o foco do campo de texto: o teclado do celular fecha */
          setAberto((a) => !a);
        }}
        className={`flex h-14 w-full flex-wrap content-center items-center gap-x-2 rounded-2xl border bg-[#f7f7f7] px-4 py-2 text-left shadow-[0_1px_2px_rgba(12,17,29,0.1)] ${aberto ? "border-cta" : "border-[#b6b6b6]"}`}
      >
        <span className="basis-full text-xs leading-4 text-muted">Parcelas</span>
        <span className="flex-1 text-base leading-6">{texto}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className={`flex-none transition-transform ${aberto ? "rotate-180" : ""}`}>
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="#696969" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {aberto && (
        <ul id={idLista} role="listbox" aria-label="Quantidade de parcelas" className="flex flex-col divide-y divide-[#dcdcdc] overflow-hidden rounded-xl border border-[#dcdcdc] bg-white shadow-[0_8px_24px_rgba(16,24,40,.08)]">
          {opcoes.map((n) => (
            <li key={n} role="option" aria-selected={n === parcelas}>
              <button
                type="button"
                onClick={() => {
                  onParcelas(n);
                  setAberto(false);
                }}
                className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left ${n === parcelas ? "bg-[#fff5ef] font-semibold" : ""}`}
              >
                <span className="text-base">{n}x de {formatarBRL(valorParcela(totalCentavos, n))}{n > 1 ? " sem juros" : ""}</span>
                <span className="text-sm font-normal text-muted">Total {formatarBRL(totalCentavos)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
