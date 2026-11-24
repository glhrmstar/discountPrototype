"use client";

import { useEffect, useRef } from "react";
import { PacoteCard, type AcoesItem } from "@/components/CatalogScreen";
import { BarraInferior, Header, Progresso, Selo, Stepper } from "@/components/ui";
import { asset } from "@/lib/asset";
import { PACOTES, ehIndividual, formatarBRL, pacotePorId, percentualDesconto, precoItem, resumo, type Itens } from "@/lib/catalogo";
import type { MetodoId } from "@/lib/pagamento";

export type OpcaoMetodo = MetodoId | "novo";

type Props = AcoesItem & {
  itens: Itens;
  metodo: MetodoId | null;
  /** 4 últimos dígitos do cartão adicionado nesta sessão. */
  cartaoFinal: string | null;
  /** Incrementa a cada "Continuar" sem método: mostra o alerta e rola até a seção. */
  alertaN: number;
  onMetodo: (m: OpcaoMetodo) => void;
  onVoltar: () => void;
  onCheckout: () => void;
};

const iconeMetodo = (m: OpcaoMetodo) =>
  m === "pix" ? <img src={asset("/assets/pix.png")} width={16} height={16} alt="" />
  : m === "apple" ? <img src={asset("/assets/applepay.png")} width={24} height={24} alt="" />
  : <img src={asset("/assets/cartao.svg")} width={16} height={16} alt="" />;

/** Telas 6 a 9 — Revisar carrinho (Figma 57:5917): itens, método de pagamento, resumo, "Compre também". */
export default function CartScreen({ itens, metodo, cartaoFinal, alertaN, onMetodo, onVoltar, onCheckout, ...acoes }: Props) {
  const r = resumo(itens);
  const ids = Object.keys(itens).filter((id) => pacotePorId(id));
  const sugestoes = PACOTES.filter((p) => !itens[p.id]);
  const secao = useRef<HTMLElement>(null);
  const alerta = alertaN > 0 && !metodo;

  useEffect(() => {
    if (alertaN === 0) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    secao.current?.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
  }, [alertaN]);

  const opcoes: { id: OpcaoMetodo; nome: string }[] = [
    ...(cartaoFinal ? [{ id: "cartao" as const, nome: `**** ${cartaoFinal}` }] : []),
    { id: "novo", nome: "Novo cartão de crédito" },
    { id: "pix", nome: "Pix" },
    { id: "apple", nome: "Apple Pay" },
  ];

  return (
    <div className="flex flex-col gap-8 px-4 pb-[calc(120px+env(safe-area-inset-bottom))] leading-[normal]">
      <Header titulo="Revisar carrinho" onVoltar={onVoltar} />

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Consultas adicionadas</h2>
        {ids.length === 0 && <p className="rounded-xl border border-dashed border-[#dcdcdc] p-6 text-center text-sm text-muted">Seu carrinho está vazio.</p>}
        {ids.map((id) => {
          const p = pacotePorId(id)!;
          const qtd = itens[id];
          const v = precoItem(p, qtd);
          const pct = percentualDesconto(p, qtd);
          const nome = p.tag ?? p.linhas[0];
          return (
            <article key={id} aria-label={nome} className="flex flex-col gap-4 overflow-hidden rounded-xl border border-[#dcdcdc] p-3">
              {(p.tag || pct > 0) && (
                <div className={`flex items-center ${p.tag ? "justify-between" : "justify-end"}`}>
                  {p.tag && <span className="text-[10px] font-bold whitespace-nowrap">{p.tag}</span>}
                  <Selo pct={pct} />
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex min-h-[54px] min-w-0 flex-1 flex-col justify-center gap-1 text-xl">
                  {p.linhas.map((l) => <span key={l}>{l}</span>)}
                </div>
                <div className="flex flex-col gap-2 text-right leading-none whitespace-nowrap">
                  <s className={`text-xs text-black/50 ${v.deCentavos > v.porCentavos ? "" : "invisible"}`}>{formatarBRL(v.deCentavos)}</s>
                  <span className="text-base font-semibold">{formatarBRL(v.porCentavos)}</span>
                </div>
              </div>
              {ehIndividual(p) && <Progresso qtd={qtd} pequeno />}
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => acoes.onRemover(id)} className="text-base font-semibold underline">Limpar</button>
                <Stepper laranja qtd={qtd} nome={nome} onMais={() => acoes.onMais(id)} onMenos={() => acoes.onMenos(id)} onRemover={() => acoes.onRemover(id)} className="w-[138px] border border-[#dcdcdc]" />
              </div>
            </article>
          );
        })}
      </section>

      {r.quantidade > 0 && (
        <>
          <section ref={secao} className="flex scroll-mt-[120px] flex-col gap-4" aria-labelledby="pag-titulo">
            <h2 id="pag-titulo" className="text-base font-semibold">Método de pagamento</h2>
            <div
              key={alertaN}
              role="radiogroup"
              aria-labelledby="pag-titulo"
              aria-invalid={alerta || undefined}
              aria-describedby={alerta ? "pag-erro" : undefined}
              className={`flex flex-col overflow-hidden rounded-xl border bg-white ${alerta ? "animate-shake border-cta shadow-[0_0_0_3px_rgba(255,81,0,0.18)]" : "border-[#dcdcdc]"}`}
            >
              {opcoes.map((o, i) => {
                const on = metodo === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onMetodo(o.id)}
                    className={`flex h-12 items-center gap-3 px-3 text-left text-base ${i ? "border-t border-[#dcdcdc]" : ""}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center">{iconeMetodo(o.id)}</span>
                    <span className="min-w-0 flex-1">{o.nome}</span>
                    <span aria-hidden className={`size-5 shrink-0 rounded-full border border-muted ${on ? "p-[3px]" : ""}`}>
                      {on && <span className="block size-full rounded-full bg-black" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {alerta && <p id="pag-erro" role="alert" className="-mt-1 text-sm text-[#d92d20]">Selecione um método de pagamento para continuar.</p>}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold">Resumo dos valores</h2>
            <dl className="flex flex-col overflow-hidden rounded-xl border border-[#dcdcdc] text-base">
              <div className="flex h-12 items-center justify-between px-3"><dt>Subtotal</dt><dd>{formatarBRL(r.totalDeCentavos)}</dd></div>
              {r.totalDeCentavos > r.totalPorCentavos && (
                <div className="flex h-12 items-center justify-between px-3"><dt>Desconto</dt><dd className="text-ok">- {formatarBRL(r.totalDeCentavos - r.totalPorCentavos)}</dd></div>
              )}
              <div className="flex h-12 items-center justify-between border-t border-[#dcdcdc] bg-surface px-3 font-semibold"><dt>Total</dt><dd>{formatarBRL(r.totalPorCentavos)}</dd></div>
            </dl>
          </section>
        </>
      )}

      {sugestoes.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Compre também</h2>
          <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
            {sugestoes.map((p) => (
              <PacoteCard key={p.id} pacote={p} qtd={0} className="w-[175px] flex-none snap-start" {...acoes} />
            ))}
          </div>
        </section>
      )}

      {r.quantidade > 0 && (
        <BarraInferior>
          {/* Figma 57:5140: checkout com um botão só; sem método, destaca a seção de pagamento */}
          <button type="button" onClick={onCheckout} className="h-12 w-full rounded-lg bg-cta text-base font-semibold text-white">Confirmar e pagar</button>
        </BarraInferior>
      )}
    </div>
  );
}
