"use client";

import { useEffect, useRef } from "react";
import Icon from "@/components/Icon";
import { PESSOAS } from "@/lib/catalogo";

type Props = {
  selecionada: string;
  onSelecionar: (id: string) => void;
  onFechar: () => void;
  onContinuar: () => void;
};

/** Tela 2 — "Pra quem deseja comprar?" (Figma 24:888). A cor do avatar só diferencia o titular. */
export default function PersonSheet({ selecionada, onSelecionar, onFechar, onContinuar }: Props) {
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechar.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKey);
    };
  }, [onFechar]);

  return (
    <>
      <div className="fixed inset-0 z-20 animate-fade-in bg-black/50" onClick={onFechar} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-titulo"
        className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] animate-sheet-up flex-col gap-8 overflow-hidden rounded-t-3xl bg-white px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] leading-[normal]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button ref={fechar} type="button" onClick={onFechar} aria-label="Fechar" className="-m-2 p-2">
              <Icon name="fechar" size={24} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <h2 id="sheet-titulo" className="text-2xl font-semibold">Pra quem deseja comprar?</h2>
            {/* Texto do Figma mantido; "desja" está com erro de digitação no design. */}
            <p className="text-base text-muted">Selecione a pessoa para quem desja comprar a consulta</p>
          </div>
        </div>

        <div role="radiogroup" aria-labelledby="sheet-titulo" className="flex flex-col gap-8">
          {PESSOAS.map((p) => {
            const on = p.id === selecionada;
            return (
              <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => onSelecionar(p.id)} className="flex items-center gap-3 text-left">
                <span className={`rounded-full p-3 ${p.tipo === "Titular" ? "bg-peach" : "bg-surface"}`}>
                  <Icon name="pessoa" size={24} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 text-base">
                  <b className="font-semibold">{p.nome}</b>
                  <span className="text-muted">{p.tipo}</span>
                </span>
                <span
                  aria-hidden
                  className={`shrink-0 rounded-full border border-muted ${on ? "size-5 p-[3px]" : "size-4"}`}
                >
                  {on && <span className="block size-full rounded-full bg-black" />}
                </span>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={onContinuar} className="flex h-12 items-center justify-center rounded-lg bg-amber px-4 font-semibold text-white">
          Continuar
        </button>
      </div>
    </>
  );
}
