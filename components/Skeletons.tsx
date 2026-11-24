import type { CSSProperties } from "react";
import { Header } from "@/components/ui";

/** Bloco de skeleton com brilho (animação desligada em prefers-reduced-motion). */
function K({ w, h, r = 8, className = "" }: { w: string; h: number; r?: number; className?: string }) {
  const style: CSSProperties = { width: w, height: h, borderRadius: r };
  return <div className={`skl max-w-full flex-none ${className}`} style={style} />;
}

const Col = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
  <div className={`flex flex-col gap-2 ${center ? "items-center" : ""}`}>{children}</div>
);
const Row = ({ children }: { children: React.ReactNode }) => <div className="flex items-center justify-between gap-3">{children}</div>;

export type TelaComSkeleton = "home" | "catalogo" | "carrinho" | "pix";

/** Skeleton de cada tela enquanto o protótipo simula a busca de dados (~700 ms). */
export default function Skeleton({ tela }: { tela: TelaComSkeleton }) {
  if (tela === "home")
    return (
      <div aria-busy="true" aria-label="Carregando" className="flex flex-col gap-6 px-4 pt-[calc(16px+env(safe-area-inset-top))]">
        <Row><Col><K w="110px" h={22} /><K w="150px" h={22} /></Col><K w="112px" h={34} /></Row>
        <K w="100%" h={108} r={16} />
        <Col><K w="170px" h={18} /><K w="100%" h={172} r={16} /></Col>
        <K w="100%" h={162} r={12} />
        <K w="100%" h={150} r={12} />
      </div>
    );
  if (tela === "catalogo")
    return (
      <div aria-busy="true" aria-label="Carregando" className="flex flex-col gap-6 px-4">
        <Header titulo="Comprar consulta" />
        <Col><K w="88%" h={26} /><K w="62%" h={26} /></Col>
        <div className="flex gap-2"><K w="57px" h={37} r={999} /><K w="108px" h={37} r={999} /><K w="108px" h={37} r={999} /></div>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-6 rounded-xl bg-[#f7f8fa] p-3">
              <Row><K w="45%" h={12} /><K w="56px" h={22} r={999} /></Row>
              <Col><K w="85%" h={22} /><K w="55%" h={22} /></Col>
              <Col><K w="40%" h={10} /><K w="50%" h={16} /></Col>
              <K w="100%" h={40} />
            </div>
          ))}
        </div>
      </div>
    );
  if (tela === "carrinho")
    return (
      <div aria-busy="true" aria-label="Carregando" className="flex flex-col gap-8 px-4">
        <Header titulo="Revisar carrinho" />
        <div className="flex flex-col gap-4">
          <K w="170px" h={18} />
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-4 rounded-xl border border-[#dcdcdc] p-3">
              <Row><K w="30%" h={12} /><K w="64px" h={22} r={999} /></Row>
              <Row><K w="55%" h={22} /><K w="70px" h={30} /></Row>
              <Row><K w="60px" h={18} /><K w="138px" h={40} /></Row>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <K w="190px" h={18} />
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#dcdcdc]">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex h-12 items-center gap-3 px-3 ${i ? "border-t border-[#dcdcdc]" : ""}`}>
                <K w="24px" h={24} r={999} /><K w="45%" h={16} /><span className="flex-1" /><K w="20px" h={20} r={999} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  return (
    <div aria-busy="true" aria-label="Carregando" className="flex flex-col px-4">
      <Header titulo="Aguardando pagamento" />
      <div className="mt-12 flex flex-col items-center gap-8">
        <K w="248px" h={248} r={12} />
        <Col center><K w="140px" h={20} /><K w="190px" h={40} /></Col>
        <Col center><K w="320px" h={20} /><K w="280px" h={20} /><K w="200px" h={20} /></Col>
        <K w="170px" h={20} />
      </div>
    </div>
  );
}
