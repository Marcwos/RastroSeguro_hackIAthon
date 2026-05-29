import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Building2,
  FileSearch,
  GitBranch,
  Radar,
  ScanSearch,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Waypoints,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'RastroSeguro | Inteligencia antifraude',
  description:
    'RastroSeguro prioriza siniestros con senales de posible fraude mediante score explicable, analisis de documentos, narrativa y relaciones operativas.',
}

const navigation = [
  { href: '#problema', label: 'Problema' },
  { href: '#solucion', label: 'Solucion' },
  { href: '#diferenciales', label: 'Diferenciales' },
  { href: '#producto', label: 'Producto' },
]

const painPoints = [
  {
    title: 'Revision Lenta y Costosa',
    description:
      'Las senales de posible fraude no siempre son evidentes en una lectura individual. Aparecen al cruzar fechas, montos, proveedores, documentos y narrativa.',
    Icon: AlertTriangle,
  },
  {
    title: 'Reglas y Evidencia Dispersas',
    description:
      'Los analistas necesitan unir informacion de polizas, siniestros, documentos y relaciones operativas antes de decidir donde intervenir primero.',
    Icon: Building2,
  },
  {
    title: 'Mucho Riesgo, Poco Contexto',
    description:
      'Un score por si solo no resuelve el problema. Se necesita explicabilidad, trazabilidad y una recomendacion accionable para revision humana.',
    Icon: Scale,
  },
]

const businessPillars = [
  {
    title: 'Priorizacion Inmediata',
    description: 'Ordena siniestros por nivel de riesgo para que el equipo revise primero donde la exposicion es mayor.',
    Icon: ShieldAlert,
  },
  {
    title: 'Explicabilidad Trazable',
    description: 'Cada alerta se acompana de razones legibles, senales activadas y contexto util para sustentar la revision.',
    Icon: ScanSearch,
  },
  {
    title: 'Impacto Operativo',
    description: 'Reduce ruido, acelera el triage y crea una base escalable para riesgos, auditoria y gerencia.',
    Icon: Target,
  },
]

const workflow = [
  {
    step: '01',
    title: 'Carga y Normalizacion',
    description: 'Recibe siniestros, polizas, beneficiarios, proveedores y documentos para preparar el caso antes del scoring.',
    Icon: FileSearch,
  },
  {
    step: '02',
    title: 'Motor Hibrido de Riesgo',
    description: 'Cruza reglas, modelo ML, anomalias, NLP y grafo para detectar patrones sospechosos no evidentes.',
    Icon: BrainCircuit,
  },
  {
    step: '03',
    title: 'Decision con Explicacion',
    description: 'Entrega semaforo de riesgo, razones principales y accion sugerida para revision humana especializada.',
    Icon: Target,
  },
]

const differentiators = [
  'Alertas explicables que muestran el motivo de cada prioridad.',
  'Enfoque hibrido: reglas, ML, NLP, grafo y agente de consulta.',
  'Vista ejecutiva para jefatura, riesgos, auditoria y gerencia.',
  'Base integrable para API, reportes y flujos futuros de revision.',
]

const technicalSignals = [
  { label: 'Reglas', value: 'Borde de vigencia, reportes tardios, documentos inconsistentes y proveedores recurrentes' },
  { label: 'Modelo', value: 'Scoring de posible fraude sobre variables sinteticas y comportamiento esperado' },
  { label: 'NLP', value: 'Similitud narrativa, senales textuales y apoyo explicativo para el analista' },
  { label: 'Grafo', value: 'Relaciones entre casos, proveedores, asegurados, ciudades y recurrencia operativa' },
]

const proofMetrics = [
  { value: 'Rojo', label: 'revision especializada', note: 'casos con mayor prioridad operativa' },
  { value: 'NLP', label: 'lectura de narrativas', note: 'similitud, ambiguedad y entidades clave' },
  { value: 'Grafo', label: 'relaciones recurrentes', note: 'proveedores, ciudades y beneficiarios' },
]

const commandStats = [
  ['Siniestros', '124'],
  ['Casos Rojos', '18'],
  ['Score Prom.', '64'],
  ['Monto Expuesto', '$1.8M'],
]

const caseReasons = [
  'Proveedor recurrente en casos observados.',
  'Narrativa con similitud y baja especificidad.',
  'Monto alto frente a poliza y patron atipico por ciudad.',
]

const evidenceStrip = [
  'Narrativa similar',
  'Proveedor recurrente',
  'Monto sensible',
  'Relacion atipica',
]

const beneficiaryRows = [
  ['Analista de siniestros', 'Prioriza casos y entiende por que revisar primero.'],
  ['Unidad antifraude', 'Detecta patrones sospechosos de forma temprana.'],
  ['Jefatura y riesgos', 'Visualiza exposicion operativa y concentracion de alertas.'],
  ['Auditoria y gerencia', 'Recibe evidencia, trazabilidad e impacto potencial del prototipo.'],
]

const judgeFit = [
  'Priorizacion visible por semaforo y score de riesgo.',
  'Explicacion textual del motivo de cada alerta.',
  'Consultas sobre proveedores, ciudades, documentos y patrones.',
  'Guardrails eticos visibles en cada capa del producto.',
]

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body?: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="label-mono-md uppercase text-muted-foreground">{eyebrow}</p>
      <h2 className="display-heading mt-3 text-balance text-3xl lg:text-4xl">{title}</h2>
      {body ? <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{body}</p> : null}
    </div>
  )
}

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

          <nav className="hidden items-center gap-6 md:flex" aria-label="Navegacion de la landing">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="focus-ring label-mono-md text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            href="/platform"
            className="focus-ring inline-flex shrink-0 items-center gap-2 bg-primary px-4 py-2.5 label-mono-md font-bold uppercase text-primary-foreground transition-opacity hover:opacity-95"
          >
            Abrir Plataforma <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div id="contenido">
        <section className="landing-hero-shell relative overflow-hidden border-b border-border bg-[var(--primary-container)] text-white">
          <div aria-hidden="true" className="landing-mesh absolute inset-0" />
          <div aria-hidden="true" className="landing-noise absolute inset-0 opacity-[0.14]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-14">
            <div className="landing-reveal space-y-8">
              <div className="flex flex-wrap gap-3">
                <span className="landing-tag">Score Explicable</span>
                <span className="landing-tag">Prioridad Operativa</span>
                <span className="landing-tag">Revision Humana</span>
              </div>

              <div className="max-w-3xl">
                <p className="label-mono-md uppercase text-[#bfd6ff]">
                  Inteligencia aplicada a siniestros, documentos y relaciones
                </p>
                <h1 className="landing-hero-title mt-4 select-none text-balance text-4xl lg:text-6xl xl:text-7xl">
                  Prioriza siniestros sospechosos con explicaciones que un analista puede defender.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#e2ebff]">
                  <span translate="no">RastroSeguro</span> cruza montos, fechas, documentos, proveedores, narrativa y redes de relacion para ordenar casos por riesgo. El resultado es una alerta accionable, no una acusacion automatica.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/platform"
                  className="focus-ring inline-flex items-center justify-center gap-2 bg-white px-5 py-3 label-mono-md font-bold uppercase text-primary transition-colors hover:bg-[var(--surface-high)]"
                >
                  Abrir Plataforma <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a
                  href="#solucion"
                  className="focus-ring inline-flex items-center justify-center gap-2 border border-[var(--primary-fixed-dim)] px-5 py-3 label-mono-md font-bold uppercase text-white transition-colors hover:bg-white/10"
                >
                  Ver Propuesta de Valor
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {proofMetrics.map((metric, index) => (
                  <article
                    key={metric.label}
                    className="landing-metric-card landing-reveal border border-white/10 bg-white/6 p-4 backdrop-blur-sm"
                    style={{ animationDelay: `${120 + index * 110}ms` }}
                  >
                    <p className="landing-metric-value text-white">{metric.value}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{metric.label}</p>
                    <p className="mt-1 text-xs leading-6 text-[var(--primary-fixed-dim)]">{metric.note}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="landing-reveal lg:pl-4" style={{ animationDelay: '140ms' }}>
              <div className="landing-spotlight institutional-card relative overflow-hidden border-white/10 bg-[#eef3fb] text-slate-900">
                <div className="section-header flex items-center justify-between bg-slate-200 text-slate-900">
                  <span className="flex items-center gap-2">
                    <Radar aria-hidden="true" className="h-4 w-4" />
                    Snapshot Ejecutivo
                  </span>
                  <span className="label-mono">SIN-045</span>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="bg-white p-3">
                      <p className="label-mono text-muted-foreground">Score Final</p>
                      <p className="landing-metric-value text-slate-900">87</p>
                    </div>
                    <div className="bg-white p-3">
                      <p className="label-mono text-muted-foreground">Nivel</p>
                      <p className="font-display text-3xl font-semibold text-red-600">Rojo</p>
                    </div>
                    <div className="bg-white p-3">
                      <p className="label-mono text-muted-foreground">Accion</p>
                      <p className="font-display text-lg font-semibold">Revision Especializada</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      ['Reglas', '92'],
                      ['Modelo ML', '81'],
                      ['NLP', '76'],
                      ['Grafo', '88'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="label-mono-md text-slate-600">{label}</span>
                          <span className="label-mono-md landing-tabular text-slate-900">{value}</span>
                        </div>
                        <div className="h-2 overflow-hidden bg-slate-200">
                          <div className="h-full bg-slate-900 transition-[width] duration-700 ease-out" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="landing-evidence-grid grid gap-2 sm:grid-cols-2">
                    {evidenceStrip.map((item) => (
                      <div key={item} className="border border-slate-200 bg-white px-3 py-2 label-mono-md text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="border-l-4 border-slate-900 bg-white p-4 text-sm leading-6 text-slate-700">
                    El sistema recomienda escalar este caso por recurrencia de proveedor, narrativa similar, monto sensible frente a la poliza y patron atipico en el grafo. La salida es una alerta de revision, no una acusacion.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_auto] lg:px-8">
            <div className="flex min-w-0 items-start gap-3">
              <ScanSearch aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[var(--on-secondary-container)]" />
              <p className="min-w-0 text-sm leading-7 text-muted-foreground">
                La propuesta no vende una caja negra. Vende criterio operativo: ordenar casos, justificar alertas y ayudar a que un analista humano actue con mayor velocidad y contexto.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="landing-inline-chip">Semaforo de Riesgo</span>
              <span className="landing-inline-chip">Explicabilidad</span>
              <span className="landing-inline-chip">NLP</span>
              <span className="landing-inline-chip">Grafo</span>
            </div>
          </div>
        </section>

        <section id="problema" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <SectionHeading
            eyebrow="Problema"
            title="El fraude no siempre se ve obvio. El costo de no priorizar bien si."
            body="Las senales aparecen al cruzar polizas, asegurados, proveedores, documentos, fechas, montos e historial de reclamos. RastroSeguro convierte ese cruce en una lectura operativa clara."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {painPoints.map(({ title, description, Icon }, index) => (
              <article
                key={title}
                className="landing-panel institutional-card p-6"
                style={{ animationDelay: `${80 + index * 80}ms` }}
              >
                <Icon aria-hidden="true" className="h-6 w-6 text-[var(--on-secondary-container)]" />
                <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
                <p className="mt-3 text-readable text-sm">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="solucion" className="scroll-mt-24 border-y border-border bg-[var(--surface-low)]">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <SectionHeading
              eyebrow="Solucion"
              title="Una capa de inteligencia para decidir que revisar primero."
              body="RastroSeguro ayuda a separar casos normales, casos que requieren revision documental y casos que ameritan revision especializada, siempre con razones visibles."
            />

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {businessPillars.map(({ title, description, Icon }, index) => (
                <article
                  key={title}
                  className="landing-panel institutional-card p-6"
                  style={{ animationDelay: `${100 + index * 80}ms` }}
                >
                  <Icon aria-hidden="true" className="h-6 w-6 text-[var(--on-secondary-container)]" />
                  <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 text-readable text-sm">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <SectionHeading
              eyebrow="Flujo"
              title="Un recorrido pensado para analistas y equipos de riesgo."
              body="La experiencia permite cargar datos, revisar score, entender alertas, consultar patrones y exportar evidencia para auditoria o seguimiento interno."
            />

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {workflow.map(({ step, title, description, Icon }, index) => (
                <article
                  key={step}
                  className="institutional-card landing-workflow-card overflow-hidden"
                  style={{ animationDelay: `${100 + index * 90}ms` }}
                >
                  <div className="section-header flex items-center justify-between">
                    <span>{step}</span>
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-2xl font-semibold">{title}</h3>
                    <p className="mt-3 text-readable text-sm">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="diferenciales" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div className="institutional-card landing-panel p-6">
              <SectionHeading
                eyebrow="Diferenciales"
                title="Lo que hace util a RastroSeguro en operacion."
                body="El valor esta en transformar informacion dispersa en una bandeja priorizada, explicable y preparada para revision humana."
              />
              <div className="mt-6 space-y-3">
                {differentiators.map((item) => (
                  <div key={item} className="flex items-start gap-3 border border-border bg-[var(--surface-low)] p-3">
                    <BadgeCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tertiary-fixed-dim)]" />
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="institutional-card overflow-hidden">
              <div className="section-header flex items-center gap-2">
                <GitBranch aria-hidden="true" className="h-4 w-4" />
                Capa Tecnica Resumida
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-2">
                {technicalSignals.map((signal) => (
                  <article key={signal.label} className="landing-signal-card bg-card p-6">
                    <p className="label-mono-md uppercase text-muted-foreground">{signal.label}</p>
                    <p className="mt-3 font-display text-xl font-semibold text-balance">{signal.value}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
            <div className="institutional-card p-6">
              <p className="label-mono-md uppercase text-muted-foreground">Alineacion con Evaluacion</p>
              <div className="mt-4 space-y-3">
                {judgeFit.map((item) => (
                  <div key={item} className="flex items-start gap-3 border border-border bg-[var(--surface-low)] p-3">
                    <BadgeCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tertiary-fixed-dim)]" />
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="institutional-card overflow-hidden">
              <div className="section-header">Usuarios Beneficiarios</div>
              <div className="divide-y divide-border">
                {beneficiaryRows.map(([role, benefit]) => (
                  <div key={role} className="grid gap-2 p-4 md:grid-cols-[.82fr_1.18fr]">
                    <p className="font-display text-lg font-semibold">{role}</p>
                    <p className="text-sm leading-7 text-muted-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="producto" className="scroll-mt-24 border-y border-border bg-[var(--surface-low)]">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Producto"
                title="Del portafolio al caso en foco, sin perder trazabilidad."
                body="La interfaz combina panorama ejecutivo, ranking de casos, red de relaciones, explicacion de score y recomendaciones para revision especializada."
              />
              <Link
                href="/platform"
                className="focus-ring inline-flex items-center gap-2 self-start border border-border bg-background px-4 py-3 label-mono-md font-bold uppercase transition-colors hover:bg-[var(--surface-container)]"
              >
                Abrir Plataforma <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
              <article className="institutional-card overflow-hidden">
                <div className="section-header flex items-center gap-2">
                  <BarChart3 aria-hidden="true" className="h-4 w-4" />
                  Command Center
                </div>
                <div className="bg-[var(--primary-container)] p-6 text-white">
                  <div className="grid gap-4 sm:grid-cols-4">
                    {commandStats.map(([label, value]) => (
                      <div key={label} className="border border-white/10 bg-white/5 p-4">
                        <p className="label-mono text-[var(--primary-fixed-dim)]">{label}</p>
                        <p className="mt-2 font-display landing-tabular text-2xl font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
                    <div className="border border-white/10 bg-[#121a2a] p-4">
                      <p className="label-mono-md uppercase text-[var(--primary-fixed-dim)]">Mapa de Relaciones</p>
                      <div className="mt-4 grid grid-cols-4 gap-3">
                        {['88', '72', '91', '65', '57', '83', '76', '69'].map((value, index) => (
                          <div
                            key={`${value}-${index}`}
                            className={`landing-node flex aspect-square items-center justify-center rounded-full text-sm font-bold ${
                              Number(value) >= 80
                                ? 'bg-red-600 text-white'
                                : Number(value) >= 70
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-white/10 bg-[#121a2a] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="label-mono-md uppercase text-[var(--primary-fixed-dim)]">Caso Prioritario</p>
                        <Waypoints aria-hidden="true" className="h-4 w-4 text-[var(--primary-fixed-dim)]" />
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-[var(--primary-fixed)]">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-semibold">SIN-045</span>
                          <span className="bg-red-600 px-2 py-1 label-mono text-white">ROJO</span>
                        </div>
                        {caseReasons.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <div className="space-y-4">
                <article className="institutional-card landing-panel p-6">
                  <Sparkles aria-hidden="true" className="h-5 w-5 text-[var(--on-secondary-container)]" />
                  <h3 className="mt-3 font-display text-2xl font-semibold">Informacion Util Desde el Primer Vistazo</h3>
                  <p className="mt-3 text-readable text-sm">
                    Casos ordenados por prioridad, razones principales, proveedores recurrentes, ciudades con concentracion de alertas y documentos pendientes.
                  </p>
                </article>
                <article className="institutional-card landing-panel p-6">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[var(--tertiary-fixed-dim)]" />
                  <h3 className="mt-3 font-display text-2xl font-semibold">Guardrail Etico Integrado</h3>
                  <p className="mt-3 text-readable text-sm">
                    Cada pantalla deja claro que <span translate="no">RastroSeguro</span> genera alertas de revision. No acusa fraude, no rechaza siniestros y no sustituye al analista.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <article className="institutional-card overflow-hidden">
            <div className="section-header">Cierre Operativo</div>
            <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_.85fr] lg:p-8">
              <div>
                <h2 className="display-heading text-balance text-3xl lg:text-4xl">
                  La IA alerta, prioriza y explica. La decision sigue siendo humana.
                </h2>
                <p className="mt-4 max-w-3xl text-readable text-base">
                  Ese principio responde a una necesidad real del negocio asegurador. La propuesta de valor no es reemplazar al analista, sino darle una ventaja operacional para decidir mas rapido y con mejor contexto.
                </p>
              </div>

              <div className="border border-border bg-[var(--surface-low)] p-6">
                <p className="label-mono-md uppercase text-muted-foreground">Valor para la aseguradora</p>
                <p className="mt-3 font-display text-2xl font-semibold text-balance">
                  Menos ruido operativo. Mas trazabilidad. Mejor deteccion temprana de posibles fraudes.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/platform"
                    className="focus-ring inline-flex items-center gap-2 bg-primary px-4 py-3 label-mono-md font-bold uppercase text-primary-foreground transition-opacity hover:opacity-95"
                  >
                    Abrir Plataforma <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  <a
                    href="#top"
                    className="focus-ring inline-flex items-center gap-2 border border-border px-4 py-3 label-mono-md font-bold uppercase transition-colors hover:bg-[var(--surface-container)]"
                  >
                    Volver Arriba
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
