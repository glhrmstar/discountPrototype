"use client";

import { BarraInferior, BotaoVerCarrinho, Header, Selo, Stepper, Totais } from "@/components/ui";
import {
  PACOTES,
  filtrar,
  formatarBRL,
  percentualDesconto,
  precoItem,
  resumo,
  type Filtro,
  type Itens,
  type Pacote,
} from "@/lib/catalogo";

export type AcoesItem = {
  onComprar: (id: string) => void;
  onMais: (id: string) => void;
  onMenos: (id: string) => void;
  onRemover: (id: string) => void;
};

type Props = AcoesItem & {
  itens: Itens;
  filtro: Filtro;
  onFiltro: (f: Filtro) => void;
  onAbrir: (id: string) => void;
  onVoltar: () => void;
  onCarrinho: () => void;
};

const FILTROS: { id: Filtro; rotulo: string; largura: string }[] = [
  { id: "todos", rotulo: "Todos", largura: "w-auto" },
  { id: "descontos", rotulo: "Descontos", largura: "w-[108px]" },
  { id: "individuais", rotulo: "Individuais", largura: "w-[108px]" },
];

export const GRADIENTE_CARD = "linear-gradient(162.86deg,#fff5e7 33.39%,#ffc992 150.93%)";

/** Telas 3 e 5 — "Comprar consulta" (catálogo) e item adicionado com barra do carrinho. */
export default function CatalogScreen({ itens, filtro, onFiltro, onAbrir, onVoltar, onCarrinho, ...acoes }: Props) {
  const lista = filtrar(PACOTES, filtro);
  const total = resumo(itens);

  return (
    <div className={`flex flex-col gap-6 px-4 leading-[normal] ${total.quantidade ? "pb-[calc(110px+env(safe-area-inset-bottom))]" : "pb-[calc(24px+env(safe-area-inset-bottom))]"}`}>
      <Header titulo="Comprar consulta" onVoltar={onVoltar} />
      <h2 className="text-2xl font-semibold">Selecione as consultas que deseja comprar</h2>

      <div className="flex gap-2" role="group" aria-label="Filtrar pacotes">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => onFiltro(f.id)}
            className={`flex justify-center rounded-full border p-2.5 text-xs whitespace-nowrap ${f.largura} ${filtro === f.id ? "border-black" : "border-[#dcdcdc]"}`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-2">
        {lista.map((p) => (
          <li key={p.id} className="self-start">
            <PacoteCard pacote={p} qtd={itens[p.id] ?? 0} onAbrir={() => onAbrir(p.id)} {...acoes} />
          </li>
        ))}
      </ul>
      {lista.length === 0 && <p className="text-center text-sm text-muted">Nenhum pacote neste filtro.</p>}

      {total.quantidade > 0 && (
        <BarraInferior>
          <Totais itens={itens} acao={<BotaoVerCarrinho onClick={onCarrinho} />} />
        </BarraInferior>
      )}
    </div>
  );
}

type CardProps = AcoesItem & { pacote: Pacote; qtd: number; onAbrir?: () => void; className?: string };

/** Card do catálogo (também usado em "Compre também"). Com o item no carrinho, tocar no card abre o detalhe. */
export function PacoteCard({ pacote: p, qtd, onComprar, onMais, onMenos, onRemover, onAbrir, className = "" }: CardProps) {
  const un = precoItem(p, 1);
  const nome = p.tag ?? p.linhas[0];
  const linhas = p.linhas; /* consultas fixas do pacote (ex.: "2 Psicologias"); não mudam com a quantidade */
  const abrivel = qtd > 0 && onAbrir;
  return (
    <article
      aria-label={nome}
      onClick={(e) => {
        if (abrivel && !(e.target as HTMLElement).closest("button")) onAbrir();
      }}
      className={`flex flex-col gap-4 overflow-hidden rounded-2xl border border-[#dcdcdc] bg-white ${abrivel ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Figma 97:137: topo em degradê com tag e consultas; preço e ação no fundo branco */}
      <div className="flex flex-col gap-[35px] p-3" style={{ background: GRADIENTE_CARD }}>
        {/* Sem tag, a linha fica invisível para manter o alinhamento entre cards */}
        <div className={`flex h-[23px] items-center justify-between ${p.tag ? "" : "invisible"}`} aria-hidden={!p.tag}>
          <span className="text-[10px] font-bold whitespace-nowrap text-wine">{p.tag ?? "—"}</span>
          <Selo pct={percentualDesconto(p)} />
        </div>
        {/* Com uma linha só, a consulta fica embaixo; a linha de cima é reservada e invisível */}
        <div className="flex flex-col gap-1 text-xl leading-[normal] text-wine">
          {linhas[1] ? (
            <>
              <span>{linhas[0]}</span>
              <span>{linhas[1]}</span>
            </>
          ) : (
            <>
              <span className="invisible" aria-hidden>{linhas[0]}</span>
              <span>{linhas[0]}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 px-3 leading-none">
        <s className={`text-xs leading-none text-[#808080] ${un.deCentavos > un.porCentavos ? "" : "invisible"}`}>{formatarBRL(un.deCentavos)}</s>
        <span className="text-base leading-none font-semibold text-black">{formatarBRL(un.porCentavos)}</span>
      </div>
      <div className="px-3 pb-3">
        {qtd > 0 ? (
          <Stepper qtd={qtd} nome={nome} onMais={() => onMais(p.id)} onMenos={() => onMenos(p.id)} onRemover={() => onRemover(p.id)} className="border border-[#dcdcdc]" />
        ) : (
          <button type="button" onClick={() => onComprar(p.id)} className="flex h-10 w-full items-center justify-center rounded-lg bg-cta px-4 text-sm font-medium whitespace-nowrap text-white">
            Comprar agora
          </button>
        )}
      </div>
    </article>
  );
}
