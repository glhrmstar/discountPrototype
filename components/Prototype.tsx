"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import CartScreen, { type OpcaoMetodo } from "@/components/CartScreen";
import CatalogScreen from "@/components/CatalogScreen";
import ChangeMethodSheet from "@/components/ChangeMethodSheet";
import HomeScreen from "@/components/HomeScreen";
import NewCardSheet from "@/components/NewCardSheet";
import NoticeSheet from "@/components/NoticeSheet";
import PackageSheet from "@/components/PackageSheet";
import PersonSheet from "@/components/PersonSheet";
import { BotaoPrincipal } from "@/components/ui";
import PixScreen from "@/components/PixScreen";
import ProcessingScreen from "@/components/ProcessingScreen";
import Skeleton from "@/components/Skeletons";
import SuccessScreen, { type Pedido } from "@/components/SuccessScreen";
import { PESSOAS, adicionar, diminuir, pacotePorId, remover, resumo, type Filtro, type Itens } from "@/lib/catalogo";
import { apagarCarrinho, lerCarrinho, salvarCarrinho } from "@/lib/carrinhoSalvo";
import { PIX_FICTICIO, PROCESSANDO_MS, prepararTeclado, type MetodoId } from "@/lib/pagamento";

type Tela = "home" | "catalogo" | "carrinho" | "processando" | "pix" | "concluido";

const CARREGAMENTO_MS = 700;
const PIX_VALIDADE_MS = 30 * 60 * 1000;

/**
 * Fluxo: Home → Comprar → "Pra quem deseja comprar?" → Comprar consulta (+ detalhe do pacote)
 * → Revisar carrinho (método, resumo, Compre também) → Processando → Pix (QR) ou direto → Pagamento concluído.
 * Falha no cartão: abra com ?falha=1 para simular a recusa (gaveta "Falha ao processar o pagamento").
 * Cada avanço mostra um skeleton por ~700 ms (simula a busca de dados). O voltar do celular volta uma tela.
 */
export default function Prototype() {
  const [tela, setTela] = useState<Tela>("home");
  const [carregando, setCarregando] = useState(true);
  const [sheetPessoa, setSheetPessoa] = useState(false);
  const [pessoa, setPessoa] = useState(PESSOAS[0].id);
  const [itens, setItens] = useState<Itens>({});
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [detalhe, setDetalhe] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<MetodoId | null>(null);
  const [cartaoFinal, setCartaoFinal] = useState<string | null>(null);
  const [parcelas, setParcelas] = useState(1);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [sheetCartao, setSheetCartao] = useState(false);
  const [sheetTroca, setSheetTroca] = useState(false);
  const [sheetFalha, setSheetFalha] = useState(false);
  const [sheetSairPix, setSheetSairPix] = useState(false);
  /** Tela atual para o handler do voltar do navegador (registrado uma vez). */
  const telaAtual = useRef<Tela>("home");
  /** true depois de "Sair" no aviso do Pix: o próximo voltar não pergunta de novo. */
  const saindoPix = useRef(false);
  const [alertaN, setAlertaN] = useState(0);
  const [pixExpira, setPixExpira] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const timerAviso = useRef<ReturnType<typeof setTimeout>>(undefined);
  const timerCarga = useRef<ReturnType<typeof setTimeout>>(undefined);
  const timerProcessa = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Pilha própria de telas: o roteador do Next reescreve history.state, então não dá para depender dele. */
  const pilha = useRef<Tela[]>(["home"]);
  /** Só grava depois de ler o carrinho salvo, para não sobrescrevê-lo com o estado inicial vazio. */
  const [salvoLido, setSalvoLido] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    clearTimeout(timerCarga.current);
    timerCarga.current = setTimeout(() => setCarregando(false), CARREGAMENTO_MS);
  }, []);

  /* Carrinho salvo: restaura ao abrir (depois da hidratação) e grava a cada mudança */
  useEffect(() => {
    const salvo = lerCarrinho();
    if (salvo) {
      setItens(salvo.itens);
      setPessoa(salvo.pessoa);
    }
    setSalvoLido(true);
  }, []);
  useEffect(() => {
    if (salvoLido) salvarCarrinho({ itens, pessoa });
  }, [salvoLido, itens, pessoa]);

  useEffect(() => {
    telaAtual.current = tela;
  }, [tela]);

  useEffect(() => {
    carregar();
    const onPop = () => {
      /* Figma 76:7563: sair do Pix pede confirmação, inclusive pelo voltar do navegador */
      if (telaAtual.current === "pix" && !saindoPix.current) {
        window.history.pushState(null, "");
        setSheetSairPix(true);
        return;
      }
      saindoPix.current = false;
      setSheetSairPix(false);
      setSheetTroca(false);
      setSheetFalha(false);
      clearTimeout(timerProcessa.current);
      if (pilha.current.length > 1) pilha.current.pop();
      setTela(pilha.current[pilha.current.length - 1]);
      setDetalhe(null);
      setSheetCartao(false);
      setCarregando(false);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      clearTimeout(timerAviso.current);
      clearTimeout(timerCarga.current);
      clearTimeout(timerProcessa.current);
    };
  }, [carregar]);

  /** comSkeleton=false: telas que não buscam dados (Pix já vem do loading de processamento, Pagamento concluído). */
  const navegar = (t: Tela, comSkeleton = true) => {
    setTela(t);
    setDetalhe(null);
    pilha.current.push(t);
    window.history.pushState(null, "");
    window.scrollTo(0, 0);
    if (comSkeleton) carregar();
    else setCarregando(false);
  };
  const voltar = () => (pilha.current.length > 1 ? window.history.back() : setTela("home"));

  const avisar = (texto: string) => {
    setAviso(texto);
    clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(null), 3200);
  };

  const fecharPessoa = useCallback(() => setSheetPessoa(false), []);
  const fecharDetalhe = useCallback(() => setDetalhe(null), []);
  const fecharCartao = useCallback(() => setSheetCartao(false), []);
  const fecharTroca = useCallback(() => setSheetTroca(false), []);
  const fecharFalha = useCallback(() => setSheetFalha(false), []);
  const ficarNoPix = useCallback(() => setSheetSairPix(false), []);
  const sairDoPix = () => {
    setSheetSairPix(false);
    saindoPix.current = true;
    window.history.back();
  };

  const acoes = {
    onComprar: (id: string) => {
      setItens((i) => adicionar(i, id));
      if (tela === "catalogo") setDetalhe(id);
    },
    onMais: (id: string) => setItens((i) => adicionar(i, id)),
    onMenos: (id: string) => setItens((i) => diminuir(i, id)),
    onRemover: (id: string) => {
      setItens((i) => remover(i, id));
      if (detalhe === id) setDetalhe(null);
    },
  };

  const escolherMetodo = (m: OpcaoMetodo) => {
    if (m === "novo") {
      prepararTeclado();
      return setSheetCartao(true);
    }
    setMetodo(m);
    setAlertaN(0);
  };

  /** Mostra "Processando dados de pagamentos" (fora da pilha do voltar) e depois segue. */
  const processar = (depois: () => void) => {
    setTela("processando");
    setDetalhe(null);
    window.scrollTo(0, 0);
    clearTimeout(timerProcessa.current);
    timerProcessa.current = setTimeout(depois, PROCESSANDO_MS);
  };

  /** Conclui a compra: guarda o pedido para a tela de sucesso e esvazia o carrinho (inclusive o salvo). */
  const concluir = (m: MetodoId) => {
    setPedido({ itens, metodo: m, cartaoFinal, parcelas });
    setItens({});
    apagarCarrinho();
    setMetodo(null);
    pilha.current = ["home"]; /* o voltar a partir daqui leva para a Home, não de volta ao pagamento */
    navegar("concluido", false);
  };

  const checkout = () => {
    if (!metodo) return setAlertaN((n) => n + 1);
    if (metodo === "pix")
      return processar(() => {
        setPixExpira(Date.now() + PIX_VALIDADE_MS);
        navegar("pix", false);
      });
    /* protótipo: ?falha=1 simula a recusa do cartão; o carrinho e o cartão continuam como estavam */
    const falhar = metodo === "cartao" && new URLSearchParams(window.location.search).has("falha");
    processar(() => {
      if (!falhar) return concluir(metodo);
      setTela("carrinho");
      setCarregando(false);
      setSheetFalha(true);
    });
  };

  const pacoteAberto = detalhe ? pacotePorId(detalhe) : undefined;

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-clip bg-white">
      {tela === "processando" ? (
        <ProcessingScreen />
      ) : carregando && (tela === "catalogo" || tela === "carrinho" || tela === "pix") ? (
        <Skeleton tela={tela} />
      ) : carregando ? (
        <Skeleton tela="home" />
      ) : tela === "concluido" && pedido ? (
        <SuccessScreen
          pedido={pedido}
          onVoltar={() => {
            pilha.current = ["home"];
            setTela("home");
            window.scrollTo(0, 0);
          }}
          onAgendar={() => avisar("O agendamento ainda não foi desenhado no Figma")}
        />
      ) : tela === "home" || tela === "concluido" ? (
        <>
          <HomeScreen />
          <BottomNav onComprar={() => setSheetPessoa(true)} itensNoCarrinho={resumo(itens).quantidade} />
          {sheetPessoa && (
            <PersonSheet
              selecionada={pessoa}
              onSelecionar={setPessoa}
              onFechar={fecharPessoa}
              onContinuar={() => {
                setSheetPessoa(false);
                /* mantém o carrinho: sair e voltar ao fluxo de compra não o esvazia */
                setFiltro("todos");
                setMetodo(null);
                setAlertaN(0);
                navegar("catalogo");
              }}
            />
          )}
        </>
      ) : tela === "catalogo" ? (
        <>
          <CatalogScreen
            itens={itens}
            filtro={filtro}
            onFiltro={setFiltro}
            onAbrir={setDetalhe}
            onVoltar={voltar}
            onCarrinho={() => navegar("carrinho")}
            {...acoes}
          />
          {pacoteAberto && (itens[pacoteAberto.id] ?? 0) > 0 && (
            <PackageSheet
              pacote={pacoteAberto}
              itens={itens}
              onMais={() => acoes.onMais(pacoteAberto.id)}
              onMenos={() => acoes.onMenos(pacoteAberto.id)}
              onLimpar={() => acoes.onRemover(pacoteAberto.id)}
              onFechar={fecharDetalhe}
              onCarrinho={() => navegar("carrinho")}
            />
          )}
        </>
      ) : tela === "carrinho" ? (
        <>
          <CartScreen
            itens={itens}
            metodo={metodo}
            cartaoFinal={cartaoFinal}
            parcelas={parcelas}
            alertaN={alertaN}
            onMetodo={escolherMetodo}
            onTrocarMetodo={() => setSheetTroca(true)}
            onVoltar={voltar}
            onCheckout={checkout}
            {...acoes}
          />
          {sheetCartao && (
            <NewCardSheet
              totalCentavos={resumo(itens).totalPorCentavos}
              parcelas={parcelas}
              onParcelas={setParcelas}
              onFechar={fecharCartao}
              onConfirmar={(final4) => {
                setCartaoFinal(final4);
                setMetodo("cartao");
                setAlertaN(0);
                setSheetCartao(false);
              }}
            />
          )}
          {sheetTroca && (
            <ChangeMethodSheet
              cartaoFinal={cartaoFinal}
              metodoAtual={metodo}
              totalCentavos={resumo(itens).totalPorCentavos}
              parcelas={parcelas}
              onParcelas={setParcelas}
              onFechar={fecharTroca}
              onConfirmar={(m) => {
                setSheetTroca(false);
                escolherMetodo(m);
              }}
            />
          )}
          {sheetFalha && (
            <NoticeSheet
              titulo="Falha ao processar o pagamento"
              quebra={"Falha ao processar".length}
              texto="Revise as informações do cartão"
              onFechar={fecharFalha}
              rodape={<BotaoPrincipal onClick={fecharFalha}>Entendi</BotaoPrincipal>}
            />
          )}
        </>
      ) : (
        <>
        <PixScreen
          totalCentavos={resumo(itens).totalPorCentavos}
          expiraEm={pixExpira}
          onVoltar={() => setSheetSairPix(true)}
          onCopiar={() => {
            navigator.clipboard?.writeText(PIX_FICTICIO).catch(() => {});
            avisar("Código copiado. É fictício: este protótipo não gera cobrança.");
          }}
          onSimularPagamento={() => concluir("pix")}
        />
        {sheetSairPix && (
          <NoticeSheet
            titulo="Tem certeza que deseja sair?"
            texto="Se você fechar essa página, seu pagamento não será completado."
            onFechar={ficarNoPix}
            rodape={
              <div className="flex gap-6">
                <button type="button" onClick={sairDoPix} className="h-12 flex-1 rounded-lg border border-muted bg-white text-base font-medium">Sair</button>
                <button type="button" onClick={ficarNoPix} className="h-12 flex-1 rounded-lg bg-cta text-base font-semibold text-white">Continuar</button>
              </div>
            }
          />
        )}
        </>
      )}

      {aviso && (
        <div role="status" className="fixed inset-x-4 top-[calc(12px+env(safe-area-inset-top))] z-40 mx-auto max-w-[398px] animate-fade-in rounded-xl bg-white px-3.5 py-3 text-sm font-medium text-gray-800 shadow-[0_12px_24px_rgba(16,24,40,.16)]">
          {aviso}
        </div>
      )}
    </main>
  );
}
