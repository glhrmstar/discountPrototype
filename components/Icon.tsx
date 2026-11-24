import { asset } from "@/lib/asset";

type Props = { name: string; size: number; className?: string };

/** Ícones exportados do Figma (public/assets/*.svg). Decorativos: o texto do botão dá o nome acessível. */
export default function Icon({ name, size, className }: Props) {
  return <img src={asset(`/assets/${name}.svg`)} width={size} height={size} alt="" aria-hidden className={`block shrink-0 ${className ?? ""}`} />;
}
