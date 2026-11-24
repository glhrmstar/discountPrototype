import Icon from "@/components/Icon";

type Props = { onComprar: () => void; itensNoCarrinho?: number };

/** Barra inferior da Home. Só "Comprar" tem ação no protótipo; os demais itens ficam desabilitados. */
export default function BottomNav({ onComprar, itensNoCarrinho = 0 }: Props) {
  const item = "relative flex min-w-[46px] flex-col items-center gap-2 text-xs whitespace-nowrap";
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-[430px] items-center justify-between bg-nav px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
      <span className={`${item} text-nav-on`} aria-current="page"><Icon name="home" size={24} />Home</span>
      <button
        type="button"
        onClick={onComprar}
        aria-label={itensNoCarrinho ? `Comprar, ${itensNoCarrinho} ${itensNoCarrinho === 1 ? "item" : "itens"} no carrinho` : undefined}
        className={`${item} text-muted`}
      >
        <Icon name="comprar" size={24} />Comprar
        {itensNoCarrinho > 0 && (
          <b aria-hidden className="absolute -top-1.5 left-[calc(50%+4px)] h-[18px] min-w-[18px] rounded-full bg-cta px-[5px] text-center text-[11px] leading-[18px] font-bold text-white shadow-[0_0_0_2px_#f7f7f7]">
            {itensNoCarrinho}
          </b>
        )}
      </button>
      <button type="button" disabled className={`${item} h-[47px] justify-end text-muted`}>
        <Icon name="stela" size={56} className="absolute -top-7 left-1/2 -translate-x-1/2" />Stela
      </button>
      <button type="button" disabled className={`${item} text-muted`}><Icon name="busca" size={24} />Especialidade</button>
      <button type="button" disabled className={`${item} text-muted`}><Icon name="menu" size={24} />Menu</button>
    </nav>
  );
}
