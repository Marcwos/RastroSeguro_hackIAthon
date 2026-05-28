'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Bot, CheckCircle2, FileSearch, GitBranch, Loader2, Scale, ShieldCheck } from 'lucide-react'
import { useAppState } from '@/lib/app-context'
import { ClaimDossier, getClaimDossier } from '@/lib/api'
import { formatCurrency, getRiskColor, getRiskLabel } from '@/lib/claims-data'

const num = (value: unknown) => Number(value ?? 0)

function normalizeRisk(level?: string | null) {
  const value = String(level || '').toLowerCase()
  if (['critico', 'crítico', 'rojo'].includes(value)) return 'critico'
  if (['alto', 'high'].includes(value)) return 'alto'
  if (['medio', 'amarillo', 'medium'].includes(value)) return 'medio'
  if (['bajo', 'verde', 'low'].includes(value)) return 'bajo'
  return 'medio'
}

export function StepDossier() {
  const { selectedClaimId, selectedClaim, setCurrentStep, setShowChat, claims, setSelectedClaimId, setIsDataLoaded } = useAppState()
  const [dossier, setDossier] = useState<ClaimDossier | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchCode, setSearchCode] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedClaimId) return
    setLoading(true)
    setError(null)
    getClaimDossier(selectedClaimId)
      .then(setDossier)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el expediente antifraude.'))
      .finally(() => setLoading(false))
  }, [selectedClaimId])


  const searchInDossier = () => {
    const query = searchCode.trim().toUpperCase().replace('_', '-')
    if (!query) return
    const found = claims.find((c) => String(c.id_siniestro || '').toUpperCase() === query)
    if (!found) {
      setSearchError(`No se encontró ${query}`)
      return
    }
    setSearchError(null)
    setSelectedClaimId(found.id_siniestro)
    setIsDataLoaded(true)
    setCurrentStep(5)
  }

  const components = useMemo(() => Object.entries(dossier?.score_components || {}).sort((a, b) => num(b[1]) - num(a[1])), [dossier])

  if (!selectedClaimId) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center text-muted-foreground">
        <FileSearch className="h-12 w-12" />
        <p>No hay siniestro seleccionado para generar expediente.</p>
        <button onClick={() => setCurrentStep(0)} className="bg-primary px-4 py-2 label-mono-md text-white">Ir al Command Center</button>
      </section>
    )
  }

  const risk = normalizeRisk(dossier?.risk?.nivel_riesgo || selectedClaim?.nivel_riesgo)
  const score = num(dossier?.risk?.score_final ?? selectedClaim?.score_final)

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="label-mono uppercase tracking-widest text-muted-foreground">Investigation Dossier</span>
            <h1 className="display-heading text-3xl lg:text-4xl">Expediente antifraude explicable</h1>
            <p className="mt-1 text-muted-foreground">Ficha auditable del caso, con evidencias y próximos pasos para revisión humana.</p>
            <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
              <input
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchInDossier()}
                placeholder="Buscar en expediente por código (SIN-046)"
                className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary md:max-w-sm"
              />
              <button onClick={searchInDossier} className="border border-border px-3 py-2 label-mono-md text-muted-foreground hover:text-primary">Buscar</button>
            </div>
            {searchError && <p className="mt-2 text-xs text-destructive">{searchError}</p>}
          </div>
          <button onClick={() => setCurrentStep(3)} className="self-start border border-border px-4 py-2 label-mono-md text-muted-foreground hover:text-primary md:self-auto">
            <ArrowLeft className="mr-2 inline h-4 w-4" />Volver al riesgo
          </button>
        </header>

        {loading && <div className="institutional-card flex items-center gap-2 p-5 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Generando expediente desde FastAPI...</div>}
        {error && <div className="border border-destructive bg-[var(--error-container)] p-4 text-[var(--on-error-container)]">{error}</div>}

        {dossier && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="institutional-card p-5">
                <p className="label-mono-md text-muted-foreground">SCORE</p>
                <p className="font-display text-4xl font-semibold">{Math.round(score)}</p>
              </div>
              <div className="institutional-card p-5">
                <p className="label-mono-md text-muted-foreground">NIVEL</p>
                <span className="mt-3 inline-block px-3 py-2 label-mono-md font-bold uppercase text-white" style={{ backgroundColor: getRiskColor(risk) }}>{getRiskLabel(risk)}</span>
              </div>
              <div className="institutional-card p-5">
                <p className="label-mono-md text-muted-foreground">MONTO</p>
                <p className="font-display text-2xl font-semibold">{formatCurrency(dossier.claim.monto_reclamado)}</p>
              </div>
              <div className="institutional-card p-5">
                <p className="label-mono-md text-muted-foreground">DECISIÓN AUTOMÁTICA</p>
                <p className="mt-2 font-display text-2xl font-semibold">{dossier.risk.decision_automatica || 'No'}</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <section className="institutional-card col-span-12 overflow-hidden lg:col-span-7">
                <div className="section-header flex items-center gap-2"><FileSearch className="h-4 w-4" />Evidencia trazable</div>
                <div className="space-y-3 p-5">
                  <h2 className="font-display text-2xl font-semibold">{dossier.headline}</h2>
                  <p className="border-l-4 border-primary pl-3 text-sm italic text-muted-foreground">{dossier.ethical_guardrail}</p>
                  {(dossier.evidence.length ? dossier.evidence : [{ senal: 'Sin alertas principales', mensaje: 'Revisar componentes ML/NLP/grafo para completar el expediente.', puntos: 0 }]).slice(0, 6).map((item, index) => (
                    <div key={`${item.codigo || item.senal}-${index}`} className="border border-border bg-[var(--surface-low)] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="label-mono-md font-bold uppercase">{index + 1}. {item.senal || item.codigo || 'Señal detectada'}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.mensaje || 'Evidencia pendiente de validación humana.'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-semibold text-destructive">+{Math.round(num(item.puntos))}</p>
                          <p className="label-mono text-muted-foreground">{item.severidad || 'media'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="col-span-12 space-y-4 lg:col-span-5">
                <div className="institutional-card overflow-hidden">
                  <div className="section-header flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Próximos pasos</div>
                  <div className="space-y-2 p-5">
                    {dossier.recommended_review.map((step) => (
                      <div key={step} className="flex items-start gap-2 border border-border bg-[var(--surface-low)] p-3 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />{step}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="institutional-card overflow-hidden">
                  <div className="section-header flex items-center gap-2"><Scale className="h-4 w-4" />Componentes del score</div>
                  <div className="space-y-2 p-5">
                    {components.map(([label, value]) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between label-mono-md"><span>{label}</span><span>{Math.round(num(value))}</span></div>
                        <div className="h-2 bg-[var(--surface-low)]"><div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, num(value)))}%` }} /></div>
                      </div>
                    ))}
                    <p className="pt-2 text-xs text-muted-foreground">Driver principal: {dossier.main_driver?.componente || 'N/D'} ({Math.round(num(dossier.main_driver?.valor))})</p>
                  </div>
                </div>
              </aside>

              <section className="institutional-card col-span-12 p-5">
                <div className="mb-3 flex items-center gap-2 label-mono-md font-bold uppercase"><GitBranch className="h-4 w-4" />Relaciones y narrativas</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border border-border bg-[var(--surface-low)] p-4">
                    <p className="label-mono text-muted-foreground">GRAFO</p>
                    <p className="mt-2 text-sm">{dossier.advanced_evidence?.grafo?.explicacion || 'Sin explicación de grafo disponible para este caso.'}</p>
                  </div>
                  <div className="border border-border bg-[var(--surface-low)] p-4">
                    <p className="label-mono text-muted-foreground">NLP</p>
                    <p className="mt-2 text-sm">{dossier.advanced_evidence?.nlp?.explicacion || 'Sin alerta NLP disponible para este caso.'}</p>
                  </div>
                </div>
              </section>
            </div>

            <footer className="flex items-center justify-between border-t border-border pt-6">
              <button onClick={() => setCurrentStep(4)} className="px-4 py-2 label-mono-md text-muted-foreground hover:text-primary">Ver red completa</button>
              <button onClick={() => setShowChat(true)} className="flex items-center gap-2 bg-primary px-6 py-2 label-mono-md text-white"><Bot className="h-4 w-4" />Preguntar al agente</button>
            </footer>
          </>
        )}
      </div>
    </section>
  )
}
