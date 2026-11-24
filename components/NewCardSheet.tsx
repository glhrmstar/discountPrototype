"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui";
import { SECOES, formValido, mascarar, ultimos4, type Campo, type FormCartao } from "@/lib/pagamento";

type Props = { onFechar: () => void; onConfirmar: (final4: string) => void };

/** Tela 7 — gaveta "Novo cartão". Protótipo: os dados ficam só neste componente e são descartados ao fechar. */
export default function NewCardSheet({ onFechar, onConfirmar }: Props) {
  const [form, setForm] = useState<FormCartao>({});
  const ok = formValido(form);

  const campo = (c: Campo) => (
    <label key={c.id} className={`flex h-14 min-w-0 flex-col justify-center rounded-2xl border border-[#b6b6b6] bg-[#f7f7f7] px-4 py-2 shadow-[0_1px_2px_rgba(12,17,29,0.1)] focus-within:border-cta ${c.largo ? "flex-[0_0_calc(100%-92px)]" : "flex-1"}`}>
      <span className="text-xs leading-4 whitespace-nowrap text-[#9c9c9c]">{c.rotulo}</span>
      <input
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

  return (
    <Sheet
      onFechar={onFechar}
      titulo="Novo cartão"
      rodape={
        <button
          type="button"
          disabled={!ok}
          onClick={() => onConfirmar(ultimos4(form.cartao ?? ""))}
          className="h-10 w-full rounded-lg bg-cta text-sm font-semibold text-white disabled:rounded disabled:bg-[#e9e9e9] disabled:font-medium disabled:text-[#696969]"
        >
          Confirmar
        </button>
      }
    >
      {SECOES.map((s) => (
        <fieldset key={s.titulo} className="flex flex-col gap-6">
          <legend className="mb-6 text-base font-semibold">{s.titulo}</legend>
          {s.linhas.map((l, i) => (l.length > 1 ? <div key={i} className={`flex ${l.some((c) => c.largo) ? "gap-3" : "gap-4"}`}>{l.map(campo)}</div> : campo(l[0])))}
        </fieldset>
      ))}
      <p className="text-xs text-muted">Protótipo: use dados fictícios. Nada é enviado nem salvo.</p>
    </Sheet>
  );
}
