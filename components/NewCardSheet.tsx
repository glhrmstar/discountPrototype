"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InstallmentsDropdown from "@/components/InstallmentsDropdown";
import NoticeSheet from "@/components/NoticeSheet";
import { BotaoPrincipal, Sheet } from "@/components/ui";
import { CARTAO_EXEMPLO, SECOES, formValido, mascarar, ultimos4, type Campo, type FormCartao } from "@/lib/pagamento";

type Props = {
  totalCentavos: number;
  parcelas: number;
  onParcelas: (n: number) => void;
  onFechar: () => void;
  /** salvar: a pessoa marcou "Salvar cartão para compras futuras" (opt-in, começa desmarcado). */
  onConfirmar: (final4: string, salvar: boolean) => void;
};

/** Tela 7 — gaveta "Novo cartão". Protótipo: os dados ficam só neste componente e são descartados ao fechar. */
export default function NewCardSheet({ totalCentavos, parcelas, onParcelas, onFechar, onConfirmar }: Props) {
  const [form, setForm] = useState<FormCartao>(CARTAO_EXEMPLO);
  const [salvar, setSalvar] = useState(false);
  /** Falha ao salvar o cartão (protótipo: ?falhaSalvar=1). "Entendi" volta ao formulário com os dados. */
  const [falhaSalvar, setFalhaSalvar] = useState(false);
  const fecharFalhaSalvar = useCallback(() => setFalhaSalvar(false), []);
  const confirmar = () => {
    if (salvar && new URLSearchParams(window.location.search).has("falhaSalvar")) {
      (document.activeElement as HTMLElement | null)?.blur(); /* fecha o teclado */
      return setFalhaSalvar(true);
    }
    onConfirmar(ultimos4(form.cartao ?? ""), salvar);
  };
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
      <span className="text-xs leading-4 whitespace-nowrap text-muted">{c.rotulo}</span>
      <input
        ref={c.id === "nome" ? primeiro : undefined}
        name={c.id}
        value={form[c.id] ?? ""}
        placeholder={c.placeholder}
        inputMode={c.inputMode}
        autoComplete={c.autoComplete}
        onChange={(e) => setForm((f) => ({ ...f, [c.id]: mascarar(c.id, e.target.value) }))}
        className="w-full min-w-0 bg-transparent text-base leading-6 outline-none placeholder:text-muted"
      />
    </label>
  );

  return (
    <>
      <Sheet
        onFechar={onFechar}
        titulo="Novo cartão"
        rodape={<BotaoPrincipal disabled={!ok} onClick={confirmar}>Confirmar</BotaoPrincipal>}
      >
        {SECOES.map((s, si) => (
          <fieldset key={s.titulo} className="flex flex-col gap-6">
            <legend className="mb-6 text-base font-semibold">{s.titulo}</legend>
            {s.linhas.map((l, i) => (l.length > 1 ? <div key={i} className={`flex ${l.some((c) => c.largo) ? "gap-3" : "gap-4"}`}>{l.map(campo)}</div> : campo(l[0])))}
            {si === 0 && <InstallmentsDropdown totalCentavos={totalCentavos} parcelas={parcelas} onParcelas={onParcelas} />}
          </fieldset>
        ))}
        <label className="flex cursor-pointer items-center gap-3 text-base select-none">
          <input type="checkbox" checked={salvar} onChange={(e) => setSalvar(e.target.checked)} className="size-5 shrink-0 accent-cta" />
          Salvar cartão para compras futuras
        </label>
      </Sheet>
      {falhaSalvar && (
        <NoticeSheet
          topo
          titulo="Falha ao adicionar o cartão"
          texto="Revise as informações do cartão e tente novamente."
          onFechar={fecharFalhaSalvar}
          rodape={<BotaoPrincipal onClick={fecharFalhaSalvar}>Entendi</BotaoPrincipal>}
        />
      )}
    </>
  );
}
