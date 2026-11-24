import Icon from "@/components/Icon";
import {
  LIMITE_POR_PACOTE,
  PACOTES,
  filtrar,
  formatarBRL,
  percentualDesconto,
  resumo,
  rotuloItens,
  type Filtro,
  type Itens,
  type Pacote,
} from "@/lib/catalogo";

type Props = {
  itens: Itens;
  filtro: Filtro;
  onFiltro: (f: Filtro) => void;
  onAdicionar: (id: string) => void;
  onRemover: (id: string) => void;
  onVoltar: () => void;
  onCarrinho: () => void;
};

const FILTROS: { id: Filtro; rotulo: string; largura: string }[] = [
  { id: "todos", rotulo: "Todos", largura: "w-auto" },
  { id: "descontos", rotulo: "Descontos", largura: "w-[108px]" },
  { id: "individuais", rotulo: "Individuais", largura: "w-[108px]" },
];

/** Telas 3 e 4 — "Comprar consulta" (Figma 29:1827) e item adicionado com carrinho (Figma 31:2622). */
export default function CatalogScreen({ itens, filtro, onFiltro, onAdicionar, onRemover, onVoltar, onCarrinho }: Props) {
  const lista = filtrar(PACOTES, filtro);
  const total = resumo(itens);

  return (
    <div className={`flex flex-col gap-6 px-4 leading-[normal] ${total.quantidade ? "pb-[calc(110px+env(safe-area-inset-bottom))]" : "pb-[calc(24px+env(safe-area-inset-bottom))]"}`}>
      {/* Header fixo ao rolar */}
      <header className="sticky top-0 z-10 -mx-4 -mb-2 flex items-center gap-2 bg-white px-4 pt-[calc(16px+env(safe-area-inset-top))] pb-2">
        <button type="button" onClick={onVoltar} aria-label="Voltar"><Icon name="voltar" size={40} /></button>
        <h1 className="flex-1 text-center text-base leading-6 font-normal text-header">Comprar consulta</h1>
        <span className="size-10 shrink-0" aria-hidden />
      </header>

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
            <PacoteCard pacote={p} qtd={itens[p.id] ?? 0} onAdicionar={() => onAdicionar(p.id)} onRemover={() => onRemover(p.id)} />
          </li>
        ))}
      </ul>
      {lista.length === 0 && <p className="text-center text-sm text-muted">Nenhum pacote neste filtro.</p>}

      {total.quantidade > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-[430px] items-center gap-2.5 border-t border-muted/20 bg-white/90 px-4 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] backdrop-blur-[5px]" style={{ minHeight: "calc(82px + env(safe-area-inset-bottom))" }}>
          <div className="flex min-w-0 flex-1 flex-col gap-1 whitespace-nowrap" aria-live="polite">
            <s className="text-sm text-muted">{formatarBRL(total.totalDeCentavos)}</s>
            <div className="flex items-center gap-1">
              <b className="text-xl font-medium">{formatarBRL(total.totalPorCentavos)}</b>
              <span className="text-sm">/ {rotuloItens(total.quantidade)}</span>
            </div>
          </div>
          <button type="button" onClick={onCarrinho} className="flex h-10 items-center gap-5 rounded-xl bg-cta px-3 py-1 text-sm font-semibold whitespace-nowrap text-white">
            Ver carrinho <Icon name="carrinho" size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

function PacoteCard({ pacote: p, qtd, onAdicionar, onRemover }: { pacote: Pacote; qtd: number; onAdicionar: () => void; onRemover: () => void }) {
  const off = percentualDesconto(p);
  const nome = p.tag ?? p.linhas[0];
  return (
    <article aria-label={nome} className="flex flex-col gap-6 overflow-hidden rounded-xl bg-cream p-3">
      {/* Sem tag, a linha fica invisível para manter o alinhamento entre cards (como no Figma) */}
      <div className={`flex items-center justify-between ${p.tag ? "" : "invisible"}`} aria-hidden={!p.tag}>
        <span className="text-[10px] font-bold whitespace-nowrap text-wine">{p.tag ?? "—"}</span>
        <span className="rounded-full bg-ok px-2 py-1 text-xs font-bold whitespace-nowrap text-white">{off}% OFF</span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-xl text-wine">
          <span>{p.linhas[0]}</span>
          <span className={p.linhas[1] ? "" : "invisible"} aria-hidden={!p.linhas[1]}>{p.linhas[1] ?? p.linhas[0]}</span>
        </div>
        <div className="flex flex-col gap-2 leading-none">
          {off > 0 && <s className="text-xs text-wine/50">{formatarBRL(p.precoDeCentavos)}</s>}
          <span className="text-base font-semibold text-wine">{formatarBRL(p.precoPorCentavos)}</span>
        </div>
      </div>
      {qtd > 0 ? (
        <div className="flex h-10 items-center justify-between rounded-lg bg-white py-1">
          <button type="button" onClick={onRemover} aria-label={`Remover ${nome} do carrinho`} className="grid size-10 place-items-center">
            <Icon name="lixeira" size={24} />
          </button>
          <span className="text-base font-medium text-[#4d4d4d]" aria-label={`Quantidade: ${qtd}`}>{qtd}</span>
          <button type="button" onClick={onAdicionar} disabled={qtd >= LIMITE_POR_PACOTE} aria-label={`Adicionar mais um ${nome}`} className="disabled:opacity-40">
            <Icon name="mais" size={40} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={onAdicionar} className="flex h-10 items-center justify-center rounded-lg bg-cta px-4 text-sm font-medium whitespace-nowrap text-white">
          Comprar agora
        </button>
      )}
    </article>
  );
}
