"use client";

import type { ReactNode } from "react";
import { Sheet } from "@/components/ui";

type Props = {
  titulo: string;
  /** Onde quebrar o título, como no Figma (ex.: "Falha ao processar|o pagamento"). */
  quebra?: number;
  texto: string;
  onFechar: () => void;
  rodape: ReactNode;
  /** Abre por cima de outra gaveta. */
  topo?: boolean;
};

/**
 * Gaveta curta de aviso (título + texto + botões), usada em:
 * - "Cartão recusado" (Figma 79:8281)
 * - "Falha ao adicionar o cartão" (Figma 90:9185), por cima do Novo cartão
 * - "Tem certeza que deseja sair?" no Pix (Figma 76:7563)
 */
export default function NoticeSheet({ titulo, quebra, texto, onFechar, rodape, topo }: Props) {
  const exibido = quebra ? <>{titulo.slice(0, quebra).trim()}<br />{titulo.slice(quebra).trim()}</> : titulo;
  return (
    <Sheet onFechar={onFechar} titulo={exibido} rotulo={titulo} rodape={rodape} topo={topo}>
      <p className="-mt-4 text-xl">{texto}</p>
    </Sheet>
  );
}
