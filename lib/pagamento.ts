/**
 * Métodos de pagamento, máscaras e validação do formulário "Novo cartão".
 * Protótipo: nada é enviado nem persistido; do cartão só os 4 últimos dígitos ficam em memória.
 */

export type MetodoId = "cartao" | "pix" | "apple";

export type CampoId =
  | "nome" | "cartao" | "cpf" | "venc" | "cvv"
  | "cep" | "end" | "num" | "bairro" | "cidade" | "uf" | "compl" | "pais";

export type Campo = {
  id: CampoId;
  rotulo: string;
  placeholder: string;
  inputMode: "text" | "numeric";
  autoComplete: string;
  /** Ocupa a coluna larga numa linha de dois campos. */
  largo?: boolean;
};

/** Figma: as duas seções se chamavam "Método de pagamento" e o 2º "Endereço" era a cidade; renomeados. */
export const SECOES: { titulo: string; linhas: Campo[][] }[] = [
  {
    titulo: "Dados do cartão",
    linhas: [
      [{ id: "nome", rotulo: "Nome do titular", placeholder: "", inputMode: "text", autoComplete: "cc-name" }],
      [{ id: "cartao", rotulo: "Número do cartão", placeholder: "0000 0000 0000 0000", inputMode: "numeric", autoComplete: "cc-number" }],
      [{ id: "cpf", rotulo: "CPF do titular", placeholder: "000.000.000-00", inputMode: "numeric", autoComplete: "off" }],
      [
        { id: "venc", rotulo: "Data de vencimento", placeholder: "MM/AA", inputMode: "numeric", autoComplete: "cc-exp" },
        { id: "cvv", rotulo: "CVV", placeholder: "000", inputMode: "numeric", autoComplete: "cc-csc" },
      ],
    ],
  },
  {
    titulo: "Endereço de cobrança",
    linhas: [
      [{ id: "cep", rotulo: "CEP", placeholder: "00000-000", inputMode: "numeric", autoComplete: "postal-code" }],
      [
        { id: "end", rotulo: "Endereço", placeholder: "Rua, avenida…", inputMode: "text", autoComplete: "address-line1", largo: true },
        { id: "num", rotulo: "Número", placeholder: "00", inputMode: "numeric", autoComplete: "off" },
      ],
      [{ id: "bairro", rotulo: "Bairro", placeholder: "", inputMode: "text", autoComplete: "address-level3" }],
      [
        { id: "cidade", rotulo: "Cidade", placeholder: "", inputMode: "text", autoComplete: "address-level2", largo: true },
        { id: "uf", rotulo: "Estado", placeholder: "SP", inputMode: "text", autoComplete: "address-level1" },
      ],
      [
        { id: "compl", rotulo: "Complemento", placeholder: "Opcional", inputMode: "text", autoComplete: "address-line2", largo: true },
        { id: "pais", rotulo: "País", placeholder: "BR", inputMode: "text", autoComplete: "country" },
      ],
    ],
  },
];

export type FormCartao = Partial<Record<CampoId, string>>;

const OPCIONAIS: CampoId[] = ["compl"];
const so = (v: string, n: number) => v.replace(/\D/g, "").slice(0, n);
const letras = (v: string) => v.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase();

export const MASCARAS: Partial<Record<CampoId, (v: string) => string>> = {
  cartao: (v) => so(v, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
  cpf: (v) =>
    so(v, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2"),
  venc: (v) => {
    const d = so(v, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },
  cvv: (v) => so(v, 4),
  cep: (v) => {
    const d = so(v, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  },
  num: (v) => so(v, 6),
  uf: letras,
  pais: letras,
};

export function mascarar(id: CampoId, valor: string): string {
  const m = MASCARAS[id];
  return m ? m(valor) : valor.slice(0, 80);
}

/** Obrigatórios preenchidos e número do cartão com pelo menos 13 dígitos. */
export function formValido(f: FormCartao): boolean {
  const campos = SECOES.flatMap((s) => s.linhas.flat());
  const preenchidos = campos.every((c) => OPCIONAIS.includes(c.id) || (f[c.id] ?? "").trim().length > 0);
  return preenchidos && (f.cartao ?? "").replace(/\D/g, "").length >= 13;
}

export const ultimos4 = (numero: string) => numero.replace(/\D/g, "").slice(-4);

/** "mm:ss" de um tempo restante em ms (nunca negativo). */
export function mmss(ms: number): string {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** Código copiado no Pix do protótipo: fictício, não gera cobrança. */
export const PIX_FICTICIO = "PIX-PROTOTIPO-STARBEM-SEM-VALOR";
