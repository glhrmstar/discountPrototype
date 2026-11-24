import { iconeMetodo } from "@/components/CartScreen";
import { BarraInferior } from "@/components/ui";
import { consultasPorEspecialidade, formatarBRL, resumo, rotuloConsultas, type Itens } from "@/lib/catalogo";
import { textoParcela, type MetodoId } from "@/lib/pagamento";

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

  return (
    <div className="flex flex-col gap-8 px-4 pt-[calc(48px+env(safe-area-inset-top))] pb-[calc(120px+env(safe-area-inset-bottom))] leading-[normal]">
      <div className="flex flex-col gap-3">
        {/* Ilustração do Figma: dois cartões inclinados (formas, sem imagem) */}
        <div className="relative h-[92px]" aria-hidden>
          <span className="absolute top-[7.4px] left-[calc(50%-21.47px)] h-[79.471px] w-[50.192px] -translate-x-1/2 -rotate-15 rounded-xl bg-[linear-gradient(145.98deg,#fff5e7_33.39%,#ffc992_150.93%)]" />
          <span className="absolute top-[7.4px] left-[calc(50%+21.4px)] h-[79.471px] w-[50.192px] -translate-x-1/2 rotate-15 rounded-xl bg-[linear-gradient(145.98deg,#fff5e7_33.39%,#ffc992_150.93%)]" />
        </div>
        <h1 role="status" className="text-center text-2xl leading-[1.2] font-semibold">
          Pagamento concluído
          <br />
          com sucesso
        </h1>
      </div>

      <ul aria-label="Consultas compradas" className="flex flex-col divide-y divide-[#dcdcdc] overflow-hidden rounded-xl border border-[#dcdcdc] text-base">
        {consultas.map(([nome, n]) => (
          <li key={nome} className={linha}><span className="min-w-0 flex-1">{nome}</span><span className="whitespace-nowrap">{rotuloConsultas(n)}</span></li>
        ))}
      </ul>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Método de pagamento</h2>
        <div className="flex min-h-14 items-center gap-3 rounded-xl border border-[#dcdcdc] px-3 py-1.5">
          <span className="grid size-10 shrink-0 place-items-center">{iconeMetodo(pedido.metodo)}</span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-base">{nomeMetodo}</span>
            {pedido.metodo === "cartao" && <span className="text-sm text-[#808080]">{textoParcela(r.totalPorCentavos, pedido.parcelas, formatarBRL)}</span>}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
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
        <div className="flex gap-6">
          <button type="button" onClick={onVoltar} className="h-12 flex-1 rounded-lg border border-muted bg-white text-base font-medium">Voltar</button>
          <button type="button" onClick={onAgendar} className="h-12 flex-1 rounded-lg bg-cta text-base font-semibold text-white">Agendar consulta</button>
        </div>
      </BarraInferior>
    </div>
  );
}
