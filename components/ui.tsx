"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Icon from "@/components/Icon";
import {
  FAIXAS,
  LIMITE_POR_PACOTE,
  formatarBRL,
  proximaFaixa,
  resumo,
  rotuloItens,
  type Itens,
} from "@/lib/catalogo";

/** Selo verde "50% OFF". */
export function Selo({ pct }: { pct: number }) {
  return <span className="rounded-full bg-ok px-2 py-1 text-xs font-bold whitespace-nowrap text-white">{pct}% OFF</span>;
}

type StepperProps = {
  qtd: number;
  nome: string;
  onMais: () => void;
  onMenos: () => void;
  onRemover: () => void;
  /** Ícones laranja (tela Revisar carrinho). */
  laranja?: boolean;
  className?: string;
};

/** Contador: lixeira com 1 unidade, "−" a partir de 2, "+" até o limite. */
export function Stepper({ qtd, nome, onMais, onMenos, onRemover, laranja, className = "" }: StepperProps) {
  const suf = laranja ? "-laranja" : "";
  return (
    <div className={`flex h-10 items-center justify-between rounded-lg bg-white py-1 ${className}`}>
      {qtd > 1 ? (
        <button type="button" onClick={onMenos} aria-label={`Diminuir ${nome}`} className="grid size-10 place-items-center">
          <Icon name={`menos${suf}`} size={24} />
        </button>
      ) : (
        <button type="button" onClick={onRemover} aria-label={`Remover ${nome} do carrinho`} className="grid size-10 place-items-center">
          <Icon name={`lixeira${suf}`} size={24} />
        </button>
      )}
      <span className="text-base font-medium text-[#4d4d4d]" aria-live="polite" aria-label={`Quantidade: ${qtd}`}>{qtd}</span>
      <button type="button" onClick={onMais} disabled={qtd >= LIMITE_POR_PACOTE} aria-label={`Adicionar mais um ${nome}`} className="disabled:opacity-40">
        <Icon name={`mais${suf}`} size={40} />
      </button>
    </div>
  );
}

/** Barra de desconto progressivo das consultas individuais (2/4/6/8 → 15/20/25/30%). */
export function Progresso({ qtd, pequeno }: { qtd: number; pequeno?: boolean }) {
  const prox = proximaFaixa(qtd);
  const maximo = FAIXAS[FAIXAS.length - 1][1];
  let anterior = 0;
  const barras = FAIXAS.map(([min]) => {
    const ok = qtd >= min;
    const largura = ok ? 100 : qtd > anterior ? Math.round(((qtd - anterior) / (min - anterior)) * 100) : 0;
    anterior = min;
    return { min, ok, largura };
  });
  return (
    <div className="flex flex-col gap-3">
      <p className={pequeno ? "text-xs leading-normal" : "text-xl leading-normal"}>
        {prox ? (
          <>
            Adicione mais {prox.faltam} {prox.faltam === 1 ? "consulta" : "consultas"} e <b className="font-bold">ganhe {prox.pct}% de desconto.</b>
          </>
        ) : (
          <>
            Parabéns! Você garantiu o <b className="font-bold">desconto máximo de {maximo}%!</b>
          </>
        )}
      </p>
      <div className="flex flex-col gap-2" aria-hidden>
        <div className={`grid grid-cols-4 ${pequeno ? "gap-1" : "gap-[5px]"}`}>
          {barras.map((b) => (
            <span key={b.min} className="h-1 overflow-hidden rounded-full bg-surface">
              <span className={`block h-full rounded-full transition-[width] duration-300 ${b.ok ? "bg-ok" : "bg-cta"}`} style={{ width: `${b.largura}%` }} />
            </span>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {FAIXAS.map(([min, pct]) => (
            <span key={min} className="flex justify-center text-xs leading-none whitespace-nowrap text-muted">
              {qtd >= min ? <Icon name="check" size={12} /> : `${min} cons. ${pct}%`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Totais do carrinho (riscado, total e quantidade) + ação à direita. Sem posicionamento. */
export function Totais({ itens, acao }: { itens: Itens; acao: ReactNode }) {
  const r = resumo(itens);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1 whitespace-nowrap" aria-live="polite">
        <s className={`text-sm text-muted ${r.totalDeCentavos > r.totalPorCentavos ? "" : "invisible"}`}>{formatarBRL(r.totalDeCentavos)}</s>
        <div className="flex items-center gap-1">
          <b className="text-xl font-medium">{formatarBRL(r.totalPorCentavos)}</b>
          <span className="text-sm">/ {rotuloItens(r.quantidade)}</span>
        </div>
      </div>
      {acao}
    </div>
  );
}

/** Barra fixa no rodapé da tela, acima da área segura do iPhone. */
export function BarraInferior({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex min-h-[calc(82px+env(safe-area-inset-bottom))] w-full max-w-[430px] flex-col justify-center border-t border-muted/20 bg-white/90 px-4 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] backdrop-blur-[5px]">
      {children}
    </div>
  );
}

export function BotaoVerCarrinho({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-10 items-center gap-5 rounded-xl bg-cta px-3 py-1 text-sm font-semibold whitespace-nowrap text-white">
      Ver carrinho <Icon name="carrinho" size={24} />
    </button>
  );
}

type SheetProps = {
  onFechar: () => void;
  titulo?: string;
  rotulo?: string;
  rodape?: ReactNode;
  children: ReactNode;
  /** Espaço entre os blocos do conteúdo (Figma usa 32 ou 48). */
  gap?: "gap-8" | "gap-12";
};

/** Gaveta inferior com fundo escuro; rola por dentro quando o conteúdo passa da tela. Esc e toque fora fecham. */
export function Sheet({ onFechar, titulo, rotulo, rodape, children, gap = "gap-8" }: SheetProps) {
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
        aria-label={rotulo ?? titulo}
        className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-h-[calc(100dvh-56px)] w-full max-w-[430px] animate-sheet-up flex-col overflow-hidden rounded-t-3xl bg-white leading-[normal]"
      >
        <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pt-4 ${rodape ? "pb-6" : "pb-[calc(16px+env(safe-area-inset-bottom))]"} ${gap}`}>
          <div className="-mb-4 flex justify-end">
            <button ref={fechar} type="button" onClick={onFechar} aria-label="Fechar" className="-m-2 p-2">
              <Icon name="fechar" size={24} />
            </button>
          </div>
          {titulo && <h2 className="text-2xl font-semibold">{titulo}</h2>}
          {children}
        </div>
        {rodape && <div className="flex-none border-t border-muted/20 bg-white px-4 pt-2 pb-[calc(16px+env(safe-area-inset-bottom))]">{rodape}</div>}
      </div>
    </>
  );
}

/** Header da tela, fixo no topo ao rolar. */
export function Header({ titulo, onVoltar }: { titulo: string; onVoltar?: () => void }) {
  return (
    <header className="sticky top-0 z-10 -mx-4 -mb-2 flex items-center gap-2 bg-white px-4 pt-[calc(16px+env(safe-area-inset-top))] pb-2">
      {onVoltar ? (
        <button type="button" onClick={onVoltar} aria-label="Voltar"><Icon name="voltar" size={40} /></button>
      ) : (
        <span className="size-10" aria-hidden />
      )}
      <h1 className="flex-1 text-center text-base leading-6 font-normal text-header">{titulo}</h1>
      <span className="size-10 shrink-0" aria-hidden />
    </header>
  );
}
