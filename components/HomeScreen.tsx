import Icon from "@/components/Icon";
import { asset } from "@/lib/asset";

/** Tela 1 — Home do paciente (Figma 14:41). Conteúdo estático com dados fictícios. */
export default function HomeScreen() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-[calc(16px+env(safe-area-inset-top))] pb-[calc(140px+env(safe-area-inset-bottom))] leading-[normal]">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1 text-xl">
          <b className="font-bold">Boa tarde,</b>
          <span>
            Guilherme <span className="text-2xl leading-none" aria-hidden>👋</span>
          </span>
        </div>
        <span className="rounded-lg bg-surface px-4 py-2 text-sm whitespace-nowrap">Star Empresa</span>
      </header>

      <section className="flex flex-col gap-2.5 rounded-2xl bg-gradient-to-r from-[#d1edf5] to-[#ffe8f5] p-4 text-base">
        <p>Receba apoio emocional 24h com a Stela</p>
        <div className="flex items-center gap-2.5 rounded-xl bg-surface p-4 text-placeholder">
          <span className="size-6 shrink-0 rounded-full bg-[#ff734e]" aria-hidden />
          Como você está?
        </div>
      </section>

      <section className="flex flex-col gap-4 text-base" aria-labelledby="agendamentos">
        <h2 id="agendamentos" className="font-normal">Últimos agendamentos</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-[#ff6900]">
              <img src={asset("/assets/avatar.jpg")} alt="" className="absolute top-[-11.5%] left-[-19.27%] h-[184.6%] w-[138.54%] max-w-none" />
            </div>
            <div className="flex flex-col gap-1">
              <b className="font-medium">Larissa Dias</b>
              <span>Nutricionista</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="calendario" size={24} />
            <span>Próxima agenda 24/11/2026</span>
          </div>
          <button type="button" disabled className="flex h-12 items-center justify-center rounded-lg bg-amber px-4 font-semibold text-white">
            Agendar consulta
          </button>
        </div>
      </section>

      <section className="relative flex h-[162px] shrink-0 flex-col items-end justify-center gap-4 overflow-hidden rounded-xl bg-promo px-4 py-0.5">
        <img src={asset("/assets/medica.png")} alt="" className="absolute top-0 left-0 h-[162px] w-[107px] object-cover" />
        <div className="flex w-[243px] max-w-[calc(100%-100px)] flex-col gap-2 text-right text-sm text-white">
          <p>Precisa de uma consulta?</p>
          <p>Marque seu atendimento online com nosso time de saúde</p>
        </div>
        <button type="button" disabled className="relative flex h-12 w-[211px] max-w-[calc(100%-100px)] items-center justify-center rounded-lg bg-amber px-4 font-semibold text-white">
          Agendar consulta
        </button>
      </section>

      <section className="flex flex-col gap-4 rounded-xl bg-plum p-4 text-white">
        <div className="flex gap-2">
          <span className="grid size-10 place-items-center rounded-full bg-plum-2"><Icon name="calendario-sm" size={16} /></span>
          <span className="flex h-10 items-center rounded-full bg-plum-2 px-4 text-sm font-semibold">Pesquisa</span>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <b className="text-xl font-medium">Queremos te ouvir</b>
            <span className="text-sm">Responda nossa breve pesquisa e ajude-nos a melhorar seu atendimento.</span>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white"><Icon name="seta" size={16} /></span>
        </div>
      </section>
    </div>
  );
}
