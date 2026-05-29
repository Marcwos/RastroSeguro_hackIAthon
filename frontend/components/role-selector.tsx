'use client'

import { BarChart3, ShieldCheck, UploadCloud, UsersRound } from 'lucide-react'
import { useAppState, type UserRole } from '@/lib/app-context'

const roles: Array<{
  id: UserRole
  title: string
  eyebrow: string
  description: string
  bullets: string[]
  cta: string
  icon: typeof ShieldCheck
}> = [
  {
    id: 'analyst',
    title: 'Analista Antifraude',
    eyebrow: 'Perfil operativo',
    description: 'Carga CSV, valida estructura, ejecuta el análisis y revisa expedientes con trazabilidad completa.',
    bullets: ['Subir cartera de siniestros en CSV', 'Validar columnas y previsualizar datos', 'Investigar casos priorizados y explicaciones'],
    cta: 'Entrar como analista',
    icon: UploadCloud,
  },
  {
    id: 'executive',
    title: 'Ejecutivo / Jurado',
    eyebrow: 'Perfil estratégico',
    description: 'Consume resultados consolidados: KPIs, impacto económico, casos críticos y narrativa para decisión.',
    bullets: ['Ver tablero ejecutivo e impacto', 'Revisar top casos y casos estrella', 'Consultar resúmenes para demo o gerencia'],
    cta: 'Entrar como ejecutivo',
    icon: BarChart3,
  },
]

export function RoleSelector() {
  const { selectUserRole } = useAppState()

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center space-y-8">
        <header className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[var(--surface-low)] px-3 py-1 label-mono-md font-bold uppercase text-muted-foreground">
            <UsersRound className="h-4 w-4" aria-hidden /> Segmentación de usuarios
          </div>
          <h1 className="display-heading text-4xl lg:text-6xl">¿Quién usará RastroSeguro?</h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            Selecciona el perfil para adaptar la experiencia. El analista prepara y revisa datos; el ejecutivo consume resultados, impacto y narrativa.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2" aria-label="Seleccionar perfil de usuario">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => selectUserRole(role.id)}
                className="group institutional-card flex min-h-[360px] flex-col items-start justify-between p-6 text-left transition-colors hover:border-primary hover:bg-[var(--surface-low)]"
              >
                <div className="space-y-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--primary-container)] text-white transition-transform group-hover:-translate-y-1">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <div>
                    <p className="label-mono-md font-bold uppercase text-muted-foreground">{role.eyebrow}</p>
                    <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">{role.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground">
                    {role.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tertiary-fixed-dim)]" aria-hidden />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="mt-8 inline-flex items-center justify-center bg-primary px-4 py-3 label-mono-md font-bold uppercase text-primary-foreground group-hover:opacity-90">
                  {role.cta}
                </span>
              </button>
            )
          })}
        </section>

        <p className="max-w-3xl rounded-md border border-border bg-[var(--surface-low)] p-4 text-sm text-muted-foreground">
          Por ahora es una segmentación de experiencia para la demo, no autenticación real. Más adelante se puede conectar a login y permisos.
        </p>
      </div>
    </main>
  )
}
