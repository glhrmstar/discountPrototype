import type { CSSProperties } from "react";
import { iconeMetodo } from "@/components/CartScreen";
import { BarraInferior } from "@/components/ui";
import { consultasPorEspecialidade, consultasPorTipo, formatarBRL, resumo, rotuloConsultas, type Itens } from "@/lib/catalogo";
import { CARTA, montarLeque } from "@/lib/leque";
import { valorParcela, type MetodoId } from "@/lib/pagamento";

/** O que foi pago: guardado no checkout porque o carrinho é esvaziado ao concluir. */
export type Pedido = { itens: Itens; metodo: MetodoId; cartaoFinal: string | null; parcelas: number };

type Props = { pedido: Pedido; onVoltar: () => void; onAgendar: () => void };

const NOME_METODO: Record<MetodoId, string> = { pix: "Pix", apple: "Apple Pay", cartao: "Cartão de crédito" };

/** Tela 12 — Pagamento concluído (Figma 76:7609). */
export default function SuccessScreen({ pedido, onVoltar, onAgendar }: Props) {
  const r = resumo(pedido.itens);
  const consultas = consultasPorEspecialidade(pedido.itens);
  const nomeMetodo = pedido.metodo === "cartao" && pedido.cartaoFinal ? `**** ${pedido.cartaoFinal}` : NOME_METODO[pedido.metodo];
  const linha = "flex h-12 items-center justify-between gap-3 px-3";
  /* cor de cada carta pelo que foi comprado: avulsa laranja, pacote roxa, compra mista as duas */
  const porTipo = consultasPorTipo(pedido.itens);
  const leque = montarLeque(porTipo.pacote + porTipo.avulsa, porTipo.pacote);
  /* entrada gradual: cada bloco entra depois do anterior, quando o leque termina de abrir */
  const entra = (ordem: number) => ({ style: { "--ordem": ordem, "--depois": `${leque.textoAposMs}ms` } as CSSProperties });

  return (
    <div className="flex flex-col gap-8 px-4 pt-[calc(48px+env(safe-area-inset-top))] pb-[calc(120px+env(safe-area-inset-bottom))] leading-[normal]">
      <div className="flex flex-col gap-3">
        {/* Uma carta por consulta comprada (até 6), em leque. Formas do Figma, sem imagem */}
        <div className="relative" style={{ height: leque.alturaPx }} aria-hidden>
          {leque.cartas.map((c, i) => (
            <span
              key={i}
              className={`leque-carta absolute rounded-xl ${c.roxa ? "bg-[linear-gradient(145.98deg,#f7f1fe_33.39%,#d1b4f6_150.93%)] shadow-[0_1px_4px_rgba(90,64,181,.16)]" : "bg-[linear-gradient(145.98deg,#fff5e7_33.39%,#ffc992_150.93%)] shadow-[0_1px_4px_rgba(255,140,60,.16)]"}`}
              style={{ top: CARTA.topo, left: `calc(50% - ${CARTA.largura / 2}px)`, width: CARTA.largura, height: CARTA.altura, "--a": `${c.anguloGraus}deg`, "--d": `${c.atrasoMs}ms` } as CSSProperties}
            />
          ))}
        </div>
        <h1 role="status" {...entra(0)} className="entra text-center text-2xl leading-[1.2] font-semibold">
          Pagamento concluído
          <br />
          com sucesso
        </h1>
      </div>

      <section {...entra(1)} className="entra flex flex-col gap-4">
        <h2 id="consultas-titulo" className="text-base font-semibold">Consultas</h2>
        <ul aria-labelledby="consultas-titulo" className="flex flex-col divide-y divide-[#dcdcdc] overflow-hidden rounded-xl border border-[#dcdcdc] text-base">
          {consultas.map(([nome, n]) => (
            <li key={nome} className={linha}><span className="min-w-0 flex-1">{nome}</span><span className="whitespace-nowrap">{rotuloConsultas(n)}</span></li>
          ))}
        </ul>
      </section>

      <section {...entra(2)} className="entra flex flex-col gap-4">
        <h2 className="text-base font-semibold">Método de pagamento</h2>
        {/* Método numa linha só; no cartão, as parcelas ficam à direita em cinza (sem "sem juros" aqui) */}
        <div className="flex h-14 items-center gap-3 rounded-xl border border-[#dcdcdc] px-3">
          <span className="grid size-10 shrink-0 place-items-center">{iconeMetodo(pedido.metodo)}</span>
          <span className="min-w-0 flex-1 truncate text-base">{nomeMetodo}</span>
          {pedido.metodo === "cartao" && <span className="shrink-0 text-base whitespace-nowrap text-muted">{pedido.parcelas}x de {formatarBRL(valorParcela(r.totalPorCentavos, pedido.parcelas))}</span>}
        </div>
      </section>

      <section {...entra(3)} className="entra flex flex-col gap-4">
        <h2 className="text-base font-semibold">Resumo dos valores</h2>
        <dl className="flex flex-col overflow-hidden rounded-xl border border-[#dcdcdc] text-base">
          <div className={linha}><dt>Subtotal</dt><dd>{formatarBRL(r.totalDeCentavos)}</dd></div>
          {r.totalDeCentavos > r.totalPorCentavos && (
            <div className={linha}><dt>Desconto</dt><dd className="text-ok">- {formatarBRL(r.totalDeCentavos - r.totalPorCentavos)}</dd></div>
          )}
          <div className={`${linha} border-t border-[#dcdcdc] bg-surface font-semibold`}><dt>Total</dt><dd>{formatarBRL(r.totalPorCentavos)}</dd></div>
        </dl>
      </section>

      <BarraInferior>
        <div {...entra(4)} className="entra flex gap-6">
          <button type="button" onClick={onVoltar} className="h-12 flex-1 rounded-lg border border-muted bg-white text-base font-medium">Voltar</button>
          <button type="button" onClick={onAgendar} className="h-12 flex-1 rounded-lg bg-cta text-base font-semibold text-white">Agendar consulta</button>
        </div>
      </BarraInferior>
    </div>
  );
}
