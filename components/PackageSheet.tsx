"use client";

import { BotaoVerCarrinho, Progresso, Selo, Sheet, Stepper, Totais } from "@/components/ui";
import { ehIndividual, formatarBRL, linhasItem, percentualDesconto, precoItem, type Itens, type Pacote } from "@/lib/catalogo";

type Props = {
  pacote: Pacote;
  itens: Itens;
  onMais: () => void;
  onMenos: () => void;
  onLimpar: () => void;
  onFechar: () => void;
  onCarrinho: () => void;
};

/** Tela 4 — gaveta de detalhe do pacote (Figma 34:4601 individual · 34:4602 com desconto). */
export default function PackageSheet({ pacote: p, itens, onMais, onMenos, onLimpar, onFechar, onCarrinho }: Props) {
  const qtd = itens[p.id] ?? 0;
  const v = precoItem(p, qtd);
  const nome = p.tag ?? p.linhas[0];

  return (
    <Sheet onFechar={onFechar} rotulo={nome} gap="gap-12" rodape={<Totais itens={itens} acao={<BotaoVerCarrinho onClick={onCarrinho} />} />}>
      <div className="flex flex-col gap-12">
        <div className="flex h-[180px] flex-col justify-end gap-6 overflow-hidden rounded-xl p-6 text-wine" style={{ background: "linear-gradient(167.9deg,#fff5e7 33.39%,#ffc992 150.93%),#fff5e7" }}>
          {p.tag && (
            /* mb-auto: tag no topo; as consultas ficam embaixo mesmo com uma linha só */
            <div className="mb-auto flex items-center justify-between">
              <span className="text-base font-bold whitespace-nowrap">{p.tag}</span>
              <Selo pct={percentualDesconto(p)} />
            </div>
          )}
          <div className="flex flex-col gap-1 text-[32px]">
            {linhasItem(p, qtd).map((l) => <span key={l}>{l}</span>)}
          </div>
        </div>
        {ehIndividual(p) && <Progresso qtd={qtd} />}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 leading-none">
          <s className={`text-xl text-muted ${v.deCentavos > v.porCentavos ? "" : "invisible"}`}>{formatarBRL(v.deCentavos)}</s>
          <span className="text-[32px] font-semibold">{formatarBRL(v.porCentavos)}</span>
        </div>
        <div className="flex items-center justify-between">
          <button type="button" onClick={onLimpar} className="text-base font-semibold underline">Limpar</button>
          <Stepper qtd={qtd} nome={nome} onMais={onMais} onMenos={onMenos} onRemover={onLimpar} className="w-[151px] border border-[#dcdcdc]" />
        </div>
      </div>
    </Sheet>
  );
}
