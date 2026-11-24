/** Tela 10 — "Processando dados de pagamentos" (Figma 79:8295), entre "Confirmar e pagar" e o resultado. */
export default function ProcessingScreen() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex min-h-dvh items-center justify-center bg-white p-4">
      <div className="flex w-full flex-col items-center gap-6">
        {/* Figma: três círculos de 24px; aqui piscam em sequência (parados com prefers-reduced-motion) */}
        <div className="flex h-6 gap-2" aria-hidden>
          {[0, 160, 320].map((atraso) => (
            <span key={atraso} className="size-6 animate-dot rounded-full bg-black" style={{ animationDelay: `${atraso}ms` }} />
          ))}
        </div>
        <p className="text-center text-2xl leading-[1.5]">
          Processando dados
          <br />
          de pagamentos
        </p>
      </div>
    </div>
  );
}
