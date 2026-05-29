import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react'
import { LiveDemo } from '@/components/landing/live-demo'
import { SolutionPillars } from '@/components/landing/solution-pillars'

export const metadata: Metadata = {
  title: 'RastroSeguro | Inteligencia antifraude',
  description:
    'RastroSeguro prioriza siniestros con senales de posible fraude y explica por que, para que el equipo humano revise primero donde mas importa.',
}

const problemQuestions = [
  {
    question: '¿Como separo prioridad de ruido?',
    consequence: 'Sin una forma clara de filtrar, los casos urgentes se mezclan con los rutinarios.',
  },
  {
    question: '¿Por que este caso me genera dudas?',
    consequence: 'Las señales estan dispersas. Reunirlas manualmente toma horas que no hay.',
  },
  {
    question: '¿Como sustento mi decision?',
    consequence: 'La intuicion sola no es evidencia. Sin razones claras, la decision queda expuesta.',
  },
]

const solutionPillars = [
  {
    title: 'Ordena los casos por nivel de riesgo',
    detail: 'Los casos con mas senales aparecen primero.',
  },
  {
    title: 'Explica por que un caso genera alerta',
    detail: 'Cada prioridad llega con razones visibles y auditables.',
  },
  {
    title: 'La decision siempre la toma una persona',
    detail: 'La IA orienta; el criterio humano decide.',
  },
]

const closingBenefits = [
  'Los casos de mayor riesgo aparecen primero, con sus razones.',
  'Cada alerta tiene evidencia revisable, no es una caja negra.',
  'El analista mantiene el control y toma la decision final.',
]

export default function LandingPage() {
  return (
    <main id="top" className="min-h-screen bg-background text-foreground">
      <a
        href="#contenido"
        className="focus-ring absolute left-4 top-4 z-50 -translate-y-20 bg-background px-4 py-2 label-mono-md font-bold uppercase text-foreground transition-transform focus:translate-y-0"
      >
        Ir al Contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link href="/" className="min-w-0">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="landing-grid-chip text-primary">RS</span>
              <div className="min-w-0">
                <p translate="no" className="font-display text-lg font-bold tracking-tight text-primary">
                  RastroSeguro
                </p>
                <p className="label-mono text-muted-foreground">Inteligencia antifraude</p>
              </div>
            </div>
          </Link>

          <Link
            href="/platform"
            className="focus-ring inline-flex shrink-0 items-center gap-2 bg-primary px-4 py-2.5 label-mono-md font-bold uppercase text-primary-foreground transition-opacity hover:opacity-95"
          >
            Abrir Plataforma <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div id="contenido">
        <section className="dark-panel landing-hero-shell landing-section-shell relative overflow-hidden border-b border-border">
          <div aria-hidden="true" className="landing-mesh absolute inset-0" />
          <div aria-hidden="true" className="landing-noise absolute inset-0 opacity-[0.14]" />
          <div aria-hidden="true" className="landing-orb landing-orb-primary" />
          <div aria-hidden="true" className="landing-orb landing-orb-secondary" />

          <div className="relative mx-auto grid min-h-[calc(92vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-16">
            <div className="landing-reveal landing-copy-stack space-y-8">
              <div className="max-w-3xl">
                <h1 className="landing-hero-title mt-4 select-none text-balance text-4xl lg:text-6xl xl:text-[4.75rem]">
                  ¿Cuales reclamos hay que revisar primero? RastroSeguro lo dice y explica por que.
                </h1>
                <p className="dark-panel-muted mt-5 max-w-xl text-lg leading-8 lg:text-xl">
                  Carga tu cartera de siniestros y en segundos tienes una bandeja ordenada por nivel de riesgo, con las razones detras de cada alerta y una recomendacion de revision clara para el analista.
                </p>
              </div>
            </div>

            <div className="landing-reveal landing-demo-wrap lg:pl-4" style={{ animationDelay: '140ms' }}>
              <LiveDemo />
            </div>
          </div>
        </section>

        <section id="problema" className="landing-band-ink landing-section-shell scroll-mt-24 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
            <div className="grid gap-4 lg:grid-cols-3">
              {problemQuestions.map(({ question, consequence }, index) => (
                <article key={question} className="landing-problem-card landing-tilt-card landing-stagger-card">
                  <span className="landing-problem-index label-mono-md">0{index + 1}</span>
                  <h3 className="font-display text-lg font-semibold leading-snug text-balance text-white">
                    {question}
                  </h3>
                  <p className="text-sm leading-6 text-[var(--editorial-soft-copy)]">{consequence}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-band-solution landing-section-shell border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
            <div className="grid gap-10 lg:grid-cols-[.92fr_1.08fr] lg:items-start">
              <div className="landing-reveal max-w-2xl">
                <p className="label-mono-md uppercase text-[var(--editorial-soft-kicker)]">La solucion</p>
                <h2 className="landing-section-display-on-dark display-heading mt-4 text-balance text-4xl lg:text-6xl">
                  Un sistema que prioriza antes, explica mejor y escala con la operacion.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--editorial-soft-copy)] lg:text-lg">
                  No es solo un dashboard. Es una forma mas inteligente de decidir que revisar, por que y con que evidencia.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="landing-solution-chip">Priorizacion visible</span>
                  <span className="landing-solution-chip">Razones explicables</span>
                  <span className="landing-solution-chip">Decision humana</span>
                </div>
              </div>

              <div className="landing-solution-frame landing-tilt-card landing-reveal" style={{ animationDelay: '120ms' }}>
                <SolutionPillars pillars={solutionPillars} />
              </div>
            </div>
          </div>
        </section>

        <section className="landing-band-closing landing-section-shell px-4 py-20 lg:px-8 lg:py-28">
          <article className="landing-closing-panel landing-reveal mx-auto max-w-7xl overflow-hidden">
            <div className="section-header">¿Lista para ver como funciona?</div>
            <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_.8fr] lg:p-8">
              <div>
                <h2 className="display-heading max-w-3xl text-balance text-3xl lg:text-4xl">
                  La inteligencia alerta y explica. La decision es tuya.
                </h2>
                <p className="landing-closing-copy mt-4 max-w-3xl text-sm leading-7">
                  RastroSeguro no reemplaza al analista: le da una ventaja operativa. Sabe que revisar primero, por que importa y como sustentarlo ante riesgos, auditoria y gerencia.
                </p>
                <div className="mt-6 space-y-3">
                  {closingBenefits.map((item) => (
                    <div key={item} className="landing-closing-proof landing-proof-card">
                      <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tertiary-fixed-dim)]" />
                      <p className="text-sm leading-6 text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="landing-ethics-card landing-tilt-card p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--tertiary-fixed-dim)]" aria-hidden />
                    <div>
                      <p className="font-display font-semibold">Criterio etico integrado</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        Cada pantalla deja claro que <span translate="no">RastroSeguro</span> genera alertas de revision. No acusa fraude, no rechaza reclamos y no sustituye al analista.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/platform"
                    className="landing-closing-cta focus-ring inline-flex items-center justify-center gap-2 px-4 py-3 label-mono-md font-bold uppercase transition-opacity hover:opacity-95"
                  >
                    Abrir Plataforma <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                  <a
                    href="#top"
                    className="landing-closing-secondary focus-ring inline-flex items-center justify-center gap-2 px-4 py-3 label-mono-md font-bold uppercase transition-colors"
                  >
                    Volver arriba
                  </a>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
