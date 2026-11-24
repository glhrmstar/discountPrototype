"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InstallmentsSheet from "@/components/InstallmentsSheet";
import { BotaoPrincipal, Sheet } from "@/components/ui";
import { formatarBRL } from "@/lib/catalogo";
import { CARTAO_EXEMPLO, SECOES, formValido, mascarar, textoParcela, ultimos4, type Campo, type FormCartao } from "@/lib/pagamento";

type Props = {
  totalCentavos: number;
  parcelas: number;
  onParcelas: (n: number) => void;
  onFechar: () => void;
  onConfirmar: (final4: string) => void;
};

/** Tela 7 — gaveta "Novo cartão". Protótipo: os dados ficam só neste componente e são descartados ao fechar. */
export default function NewCardSheet({ totalCentavos, parcelas, onParcelas, onFechar, onConfirmar }: Props) {
  const [form, setForm] = useState<FormCartao>(CARTAO_EXEMPLO);
  const [parcelasAberta, setParcelasAberta] = useState(false);
  const fecharParcelas = useCallback(() => setParcelasAberta(false), []);
  const parcelaTexto = textoParcela(totalCentavos, parcelas, formatarBRL);
  const ok = formValido(form);
  const primeiro = useRef<HTMLInputElement>(null);

  /* Foco no primeiro campo ao abrir: o teclado do celular sobe junto com a gaveta */
  useEffect(() => {
    const el = primeiro.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const campo = (c: Campo) => (
    <label key={c.id} className={`flex h-14 min-w-0 flex-col justify-center rounded-2xl border border-[#b6b6b6] bg-[#f7f7f7] px-4 py-2 shadow-[0_1px_2px_rgba(12,17,29,0.1)] focus-within:border-cta ${c.largo ? "flex-[0_0_calc(100%-92px)]" : "flex-1"}`}>
      <span className="text-xs leading-4 whitespace-nowrap text-[#9c9c9c]">{c.rotulo}</span>
      <input
        ref={c.id === "nome" ? primeiro : undefined}
        name={c.id}
        value={form[c.id] ?? ""}
        placeholder={c.placeholder}
        inputMode={c.inputMode}
        autoComplete={c.autoComplete}
        onChange={(e) => setForm((f) => ({ ...f, [c.id]: mascarar(c.id, e.target.value) }))}
        className="w-full min-w-0 bg-transparent text-base leading-6 outline-none placeholder:text-[#808080]"
      />
    </label>
  );

  /* Campo "Parcelas": abre a gaveta de parcelas por cima desta */
  const campoParcelas = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Parcelas: ${parcelaTexto}`}
      onClick={() => {
        (document.activeElement as HTMLElement | null)?.blur(); /* fecha o teclado */
        setParcelasAberta(true);
      }}
      className="flex h-14 w-full flex-wrap content-center items-center gap-x-2 rounded-2xl border border-[#b6b6b6] bg-[#f7f7f7] px-4 py-2 text-left shadow-[0_1px_2px_rgba(12,17,29,0.1)]"
    >
      <span className="basis-full text-xs leading-4 text-[#9c9c9c]">Parcelas</span>
      <span className="flex-1 text-base leading-6">{parcelaTexto}</span>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="flex-none">
        <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="#808080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <>
      <Sheet
        onFechar={onFechar}
        titulo="Novo cartão"
        rodape={<BotaoPrincipal disabled={!ok} onClick={() => onConfirmar(ultimos4(form.cartao ?? ""))}>Confirmar</BotaoPrincipal>}
      >
        {SECOES.map((s, si) => (
          <fieldset key={s.titulo} className="flex flex-col gap-6">
            <legend className="mb-6 text-base font-semibold">{s.titulo}</legend>
            {s.linhas.map((l, i) => (l.length > 1 ? <div key={i} className={`flex ${l.some((c) => c.largo) ? "gap-3" : "gap-4"}`}>{l.map(campo)}</div> : campo(l[0])))}
            {si === 0 && campoParcelas}
          </fieldset>
        ))}
        <p className="text-xs text-muted">Dados de exemplo (fictícios) já preenchidos. Nada é enviado nem salvo.</p>
      </Sheet>
      {parcelasAberta && (
        <InstallmentsSheet
          totalCentavos={totalCentavos}
          selecionada={parcelas}
          onFechar={fecharParcelas}
          onConfirmar={(n) => {
            onParcelas(n);
            setParcelasAberta(false);
          }}
        />
      )}
    </>
  );
}
