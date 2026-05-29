import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react'
import { LiveDemo } from '@/components/landing/live-demo'
import { SolutionPillars } from '@/components/landing/solution-pillars'

export const metadata: Metadata = {
  title: 'RastroSeguro | Inteligencia antifraude',
  description:
    'RastroSeguro prioriza siniestros con señales de posible fraude y explica por qué, para que el equipo humano revise primero donde más importa.',
}

const problemQuestions = [
  {
    question: '¿Cuáles reclamos debo revisar hoy?',
    consequence: 'Sin una guía, el tiempo se reparte igual entre casos de bajo y alto riesgo.',
  },
  {
    question: '¿Por qué este caso me genera dudas?',
    consequence: 'Las señales están dispersas. Reunirlas manualmente toma horas que no hay.',
  },
  {
    question: '¿Cómo sustento mi decisión?',
    consequence: 'La intuición sola no es evidencia. Sin razones claras, la decisión queda expuesta.',
  },
]

const solutionPillars = [
  {
    title: 'Ordena los casos por nivel de riesgo',
    detail:
      'RastroSeguro analiza cada expediente y lo ubica en una bandeja priorizada: los casos con más señales de alerta aparecen primero.',
  },
  {
    title: 'Explica por qué un caso genera alerta',
    detail:
      'Cada prioridad llega con sus razones: proveedor recurrente, narrativa similar a otros casos, monto fuera de lo esperado, documentos inconsistentes.',
  },
  {
    title: 'La decisión siempre la toma una persona',
    detail:
      'RastroSeguro no acusa fraude ni rechaza reclamos. Genera alertas con evidencia para que el analista decida con más contexto y menos ruido.',
  },
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

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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

        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <section className="dark-panel landing-hero-shell relative overflow-hidden border-b border-border">
          <div aria-hidden="true" className="landing-mesh absolute inset-0" />
          <div aria-hidden="true" className="landing-noise absolute inset-0 opacity-[0.14]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-16">
            <div className="landing-reveal space-y-8">
              <div className="flex flex-wrap gap-3">
                <span className="landing-tag">Prioridad operativa</span>
                <span className="landing-tag">Razones visibles</span>
                <span className="landing-tag">Revisión humana</span>
              </div>

              <div className="max-w-3xl">
                <p className="dark-panel-kicker label-mono-md uppercase">
                  Para equipos de análisis de siniestros
                </p>
                <h1 className="landing-hero-title mt-4 select-none text-balance text-4xl lg:text-5xl xl:text-6xl">
                  ¿Cuáles reclamos hay que revisar primero? RastroSeguro lo dice y explica por qué.
                </h1>
                <p className="dark-panel-muted mt-5 max-w-2xl text-lg leading-8">
                  Carga tu cartera de siniestros y en segundos tienes una bandeja ordenada por nivel de riesgo, con las razones detrás de cada alerta y una recomendación de revisión clara para el analista.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/platform"
                  className="dark-panel-cta focus-ring inline-flex items-center justify-center gap-2 px-5 py-3 label-mono-md font-bold uppercase transition-colors"
                >
                  Ver la plataforma <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a
                  href="#problema"
                  className="focus-ring inline-flex items-center justify-center gap-2 border border-[var(--primary-fixed-dim)] px-5 py-3 label-mono-md font-bold uppercase text-white transition-colors hover:bg-white/10"
                >
                  ¿Cuál es el problema?
                </a>
              </div>
            </div>

            {/* Demo animado */}
            <div className="landing-reveal lg:pl-4" style={{ animationDelay: '140ms' }}>
              <LiveDemo />
            </div>
          </div>
        </section>

        {/* ── Problema ─────────────────────────────────────────────────────── */}
        <section id="problema" className="scroll-mt-24 border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <h2 className="display-heading max-w-2xl text-balance text-3xl lg:text-4xl">
              El fraude no siempre es obvio. El costo de no priorizar bien, sí.
            </h2>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {problemQuestions.map(({ question, consequence }) => (
                <article
                  key={question}
                  className="institutional-card flex flex-col gap-4 border border-border bg-[var(--surface-low)] p-6"
                >
                  <h3 className="font-display text-lg font-semibold leading-snug text-balance">
                    {question}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">{consequence}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Solución ─────────────────────────────────────────────────────── */}
        <section className="border-b border-border bg-[var(--surface-low)]">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="display-heading text-balance text-3xl lg:text-4xl">
                Una herramienta que ordena, explica y deja decidir.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                RastroSeguro toma la cartera de siniestros, detecta las señales de alerta en cada expediente y entrega una bandeja priorizada con las razones detrás de cada caso.
              </p>
            </div>

            <SolutionPillars pillars={solutionPillars} />
          </div>
        </section>

        {/* ── Cierre ───────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <article className="institutional-card overflow-hidden">
            <div className="section-header">¿Lista para ver cómo funciona?</div>
            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_.8fr] lg:p-8">
              <div>
                <h2 className="display-heading text-balance text-3xl lg:text-4xl">
                  La inteligencia alerta y explica. La decisión es tuya.
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                  RastroSeguro no reemplaza al analista: le da una ventaja operativa. Sabe qué revisar primero, por qué importa y cómo sustentarlo ante riesgos, auditoría y gerencia.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    'Los casos de mayor riesgo aparecen primero, con sus razones.',
                    'Cada alerta tiene evidencia revisable, no es una caja negra.',
                    'El analista mantiene el control y toma la decisión final.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 border border-border bg-[var(--surface-low)] p-3">
                      <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tertiary-fixed-dim)]" />
                      <p className="text-sm leading-6 text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="border border-border bg-[var(--surface-low)] p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--tertiary-fixed-dim)]" aria-hidden />
                    <div>
                      <p className="font-display font-semibold">Criterio ético integrado</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        Cada pantalla deja claro que <span translate="no">RastroSeguro</span> genera alertas de revisión. No acusa fraude, no rechaza reclamos y no sustituye al analista.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/platform"
                    className="focus-ring inline-flex items-center justify-center gap-2 bg-primary px-4 py-3 label-mono-md font-bold uppercase text-primary-foreground transition-opacity hover:opacity-95"
                  >
                    Abrir Plataforma <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                  <a
                    href="#top"
                    className="focus-ring inline-flex items-center justify-center gap-2 border border-border px-4 py-3 label-mono-md font-bold uppercase transition-colors hover:bg-[var(--surface-container)]"
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
