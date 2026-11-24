"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import CatalogScreen from "@/components/CatalogScreen";
import HomeScreen from "@/components/HomeScreen";
import PersonSheet from "@/components/PersonSheet";
import { PESSOAS, adicionar, remover, type Filtro, type Itens } from "@/lib/catalogo";

type Tela = "home" | "catalogo";

/**
 * Fluxo: Home → Comprar (barra inferior) → "Pra quem deseja comprar?" → Continuar → Comprar consulta.
 * O botão Voltar do celular volta do catálogo para a Home (history.pushState).
 */
export default function Prototype() {
  const [tela, setTela] = useState<Tela>("home");
  const [sheet, setSheet] = useState(false);
  const [pessoa, setPessoa] = useState(PESSOAS[0].id);
  const [itens, setItens] = useState<Itens>({});
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [aviso, setAviso] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onPop = () => setTela("home");
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      clearTimeout(timer.current);
    };
  }, []);

  const fecharSheet = useCallback(() => setSheet(false), []);

  const continuar = () => {
    setSheet(false);
    setItens({});
    setFiltro("todos");
    setTela("catalogo");
    window.history.pushState({ tela: "catalogo" }, "");
    window.scrollTo(0, 0);
  };

  const voltar = () => {
    if (window.history.state?.tela === "catalogo") window.history.back();
    else setTela("home");
  };

  const avisar = (texto: string) => {
    setAviso(texto);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 3200);
  };

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-clip bg-white">
      {tela === "home" ? (
        <>
          <HomeScreen />
          <BottomNav onComprar={() => setSheet(true)} />
          {sheet && <PersonSheet selecionada={pessoa} onSelecionar={setPessoa} onFechar={fecharSheet} onContinuar={continuar} />}
        </>
      ) : (
        <CatalogScreen
          itens={itens}
          filtro={filtro}
          onFiltro={setFiltro}
          onAdicionar={(id) => setItens((i) => adicionar(i, id))}
          onRemover={(id) => setItens((i) => remover(i, id))}
          onVoltar={voltar}
          onCarrinho={() => avisar("A tela do carrinho ainda não foi desenhada no Figma")}
        />
      )}

      {aviso && (
        <div role="status" className="fixed inset-x-4 top-[calc(12px+env(safe-area-inset-top))] z-40 mx-auto max-w-[398px] animate-fade-in rounded-xl bg-white px-3.5 py-3 text-sm font-medium text-gray-800 shadow-[0_12px_24px_rgba(16,24,40,.16)]">
          {aviso}
        </div>
      )}
    </main>
  );
}
