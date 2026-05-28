'use client'

import { useEffect, useState } from 'react'
import { useAppState } from '@/lib/app-context'
import { formatCurrency } from '@/lib/claims-data'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, FileText, Image as ImageIcon, Loader2, Map, MapPin, Navigation, ShieldCheck, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type MapPoint = { lat: number; lon: number; label: string }

const CITY_COORDS: Record<string, MapPoint> = {
  quito: { lat: -0.1807, lon: -78.4678, label: 'Quito' },
  guayaquil: { lat: -2.1709, lon: -79.9224, label: 'Guayaquil' },
  cuenca: { lat: -2.9006, lon: -79.0045, label: 'Cuenca' },
  manta: { lat: -0.9677, lon: -80.7089, label: 'Manta' },
  ambato: { lat: -1.2543, lon: -78.6229, label: 'Ambato' },
  loja: { lat: -3.9931, lon: -79.2042, label: 'Loja' },
  machala: { lat: -3.2581, lon: -79.9554, label: 'Machala' },
  esmeraldas: { lat: 0.9682, lon: -79.6517, label: 'Esmeraldas' },
  ibarra: { lat: 0.3517, lon: -78.1223, label: 'Ibarra' },
  riobamba: { lat: -1.6636, lon: -78.6546, label: 'Riobamba' },
  latacunga: { lat: -0.9316, lon: -78.6155, label: 'Latacunga' },
  portoviejo: { lat: -1.0546, lon: -80.4545, label: 'Portoviejo' },
  'santo domingo': { lat: -0.253, lon: -79.1754, label: 'Santo Domingo' },
}

function getMapPoint(city?: string | null): MapPoint {
  const normalized = String(city || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  return CITY_COORDS[normalized] || { lat: -1.8312, lon: -78.1834, label: city || 'Ecuador' }
}


function yes(value: unknown) {
  return ['si', 'sí', 'true', '1', 'yes', 'completo'].includes(String(value ?? '').trim().toLowerCase()) || value === true
}

function no(value: unknown) {
  return ['no', 'false', '0', 'incompleto'].includes(String(value ?? '').trim().toLowerCase()) || value === false
}

function documentBadge(status: 'completo' | 'pendiente' | 'inconsistente') {
  if (status === 'completo') return { Icon: CheckCircle2, label: 'Verified', className: 'bg-[var(--tertiary-fixed)] text-[var(--on-tertiary-fixed)]' }
  if (status === 'inconsistente') return { Icon: XCircle, label: 'Inconsistente', className: 'bg-[var(--error-container)] text-[var(--on-error-container)]' }
  return { Icon: AlertTriangle, label: 'Pendiente', className: 'bg-amber-100 text-amber-900' }
}

function buildOsmEmbedUrl(point: MapPoint) {
  const delta = 0.045
  const bbox = [point.lon - delta, point.lat - delta, point.lon + delta, point.lat + delta].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${point.lat},${point.lon}`
}

export function StepSummary() {
  const { selectedClaim, selectedClaimId, selectedExplanation, isLoadingExplanation, loadClaimExplanation, setCurrentStep } = useAppState()
  const [processing, setProcessing] = useState(false)
  useEffect(() => {
    if (selectedClaim && selectedClaimId && selectedExplanation?.id_siniestro !== selectedClaimId) {
      void loadClaimExplanation(selectedClaimId)
    }
  }, [loadClaimExplanation, selectedClaim, selectedClaimId, selectedExplanation?.id_siniestro])

  if (!selectedClaim) return <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground"><p>No hay caso seleccionado</p><button onClick={() => setCurrentStep(1)} className="bg-primary px-4 py-2 text-sm text-white">Volver al Paso 1</button></div>
  const next = () => { setProcessing(true); setTimeout(() => { setProcessing(false); setCurrentStep(3) }, 600) }
  const docIcon = (tipo: string) => tipo === 'foto' || tipo === 'video' ? ImageIcon : tipo === 'telemetria' ? Navigation : FileText
  const narrativa = selectedClaim.narrativa || selectedClaim.descripcion || selectedExplanation?.explicacion || 'El API entregó un resumen técnico del siniestro. Continúe al análisis para revisar señales explicables y priorización.'
  const mapPoint = getMapPoint(selectedClaim.ciudad)
  const osmUrl = buildOsmEmbedUrl(mapPoint)
  const documentosCompletos = yes(selectedClaim.documentos_completos)
  const documentosIncompletos = no(selectedClaim.documentos_completos)
  const documentosInconsistentes = yes(selectedClaim.documentos_inconsistentes)
  const documentos = [
    { nombre: 'Expediente documental obligatorio', tipo: 'declaracion', estado: documentosIncompletos ? 'pendiente' as const : 'completo' as const, detalle: documentosCompletos ? 'Documentos mínimos marcados como completos por backend' : 'El backend detecta expediente documental incompleto' },
    { nombre: 'Control de inconsistencias', tipo: 'informe', estado: documentosInconsistentes ? 'inconsistente' as const : 'completo' as const, detalle: documentosInconsistentes ? 'Fechas, valores o soportes requieren validación manual' : 'Sin inconsistencias documentales registradas' },
    { nombre: 'Trazabilidad de score IA', tipo: 'telemetria', estado: 'completo' as const, detalle: 'Registro auditable de componentes y explicación del score' },
  ]

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><h1 className="display-heading text-3xl lg:text-4xl">Paso 2: Resumen Técnico del Siniestro</h1><p className="mt-1 text-base text-muted-foreground">Validación clara del caso antes de ejecutar el análisis de riesgo.</p></div>
          <div className="bg-primary px-6 py-3 text-white"><span className="label-mono-md">CASE ID: </span><span className="label-mono-md font-bold tracking-widest">{selectedClaim.id_siniestro}</span></div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            <div className="institutional-card overflow-hidden"><div className="section-header">Metadatos del Siniestro</div><table className="zebra w-full text-left"><thead><tr className="border-b border-border bg-[var(--surface-low)]"><th className="label-mono px-4 py-2 text-muted-foreground">CATEGORÍA</th><th className="label-mono px-4 py-2 text-muted-foreground">DETALLE</th></tr></thead><tbody><tr><td className="px-4 py-2 font-semibold">Ramo</td><td className="px-4 py-2 text-muted-foreground">{selectedClaim.ramo || 'No informado'}</td></tr><tr><td className="px-4 py-2 font-semibold">Monto reclamado</td><td className="px-4 py-2 font-mono">{selectedClaim.monto_reclamado != null ? formatCurrency(selectedClaim.monto_reclamado) : 'No disponible'}</td></tr><tr><td className="px-4 py-2 font-semibold">Cobertura</td><td className="px-4 py-2"><span className="bg-[var(--secondary-container)] px-2 py-1 label-mono font-bold uppercase text-[var(--on-secondary-container)]">{selectedClaim.cobertura || 'Cobertura no informada'}</span></td></tr><tr><td className="px-4 py-2 font-semibold">Ciudad</td><td className="flex items-center gap-2 px-4 py-2"><MapPin className="h-4 w-4" />{selectedClaim.ciudad || 'N/D'}, Ecuador</td></tr><tr><td className="px-4 py-2 font-semibold">Proveedor</td><td className="px-4 py-2 font-mono">{selectedClaim.id_proveedor || 'N/D'}</td></tr></tbody></table></div>

            <div className="institutional-card overflow-hidden"><div className="section-header flex items-center justify-between"><span>Narrativa del Evento</span><FileText className="h-4 w-4 text-muted-foreground" /></div><div className="p-6"><p className="border-l-4 border-border pl-4 text-base italic leading-relaxed">“{narrativa}”</p></div></div>

            <div className="institutional-card overflow-hidden"><div className="section-header flex items-center justify-between"><span>Verificación de Documentación</span><span>{documentosCompletos && !documentosInconsistentes ? 'Sin hallazgos críticos' : 'Requiere revisión'}</span></div><div className="divide-y divide-border">{documentos.map((doc, i) => { const Icon = docIcon(doc.tipo); const Badge = documentBadge(doc.estado); return <div key={i} className="flex items-center justify-between gap-4 p-4 hover:bg-[var(--surface-low)]"><div className="flex items-center gap-4"><Icon className="h-5 w-5 shrink-0" /><div><p className="font-semibold">{doc.nombre}</p><p className="label-mono text-muted-foreground">{doc.detalle}</p></div></div><span className={cn('flex shrink-0 items-center gap-1 px-2 py-1 label-mono-md font-bold uppercase', Badge.className)}><Badge.Icon className="h-4 w-4" />{Badge.label}</span></div>})}</div><div className="grid gap-3 border-t border-border bg-[var(--surface-low)] p-4 sm:grid-cols-2"><div><p className="label-mono text-muted-foreground">Documentos completos</p><p className="font-mono text-sm">{selectedClaim.documentos_completos ?? 'No informado'}</p></div><div><p className="label-mono text-muted-foreground">Inconsistencias</p><p className="font-mono text-sm">{selectedClaim.documentos_inconsistentes ?? 'No informado'}</p></div></div></div>
          </div>

          <aside className="col-span-12 space-y-6 lg:col-span-4">
            <div className="border border-primary bg-[var(--primary-container)] p-6 text-white"><h3 className="label-mono-md font-bold uppercase tracking-widest text-[var(--on-primary-container)]">Analysis Readiness</h3><div className="mt-4"><div className="flex items-end justify-between"><span className="font-display text-3xl font-semibold">{isLoadingExplanation ? 'Syncing' : 'Ready'}</span><span className="label-mono-md text-[var(--tertiary-fixed)]">API Connected</span></div><div className="mt-2 h-2 bg-[var(--on-primary-container)]"><div className="h-full bg-[var(--tertiary-fixed-dim)]" style={{ width: selectedExplanation ? '100%' : '75%' }} /></div></div><p className="mt-4 text-sm text-[var(--on-primary-container)]">La información mínima del caso está completa. La explicación trazable se consulta directamente desde el motor antifraude.</p><button onClick={next} className="mt-6 flex w-full items-center justify-center gap-2 bg-white py-3 label-mono-md font-bold uppercase text-primary hover:bg-[var(--surface-high)]">{processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Proceed to Risk Analysis'}<ArrowRight className="h-4 w-4" /></button></div>
            <div className="institutional-card overflow-hidden">
              <div className="section-header flex items-center gap-2"><Map className="h-4 w-4" />Contexto Geográfico</div>
              <div className="relative aspect-square overflow-hidden bg-[var(--surface-container)]">
                <iframe
                  title={`Mapa del siniestro ${selectedClaim.id_siniestro}`}
                  src={osmUrl}
                  className="h-full w-full border-0 grayscale-[.35]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="pointer-events-none absolute left-3 top-3 border border-border bg-white/95 px-3 py-2 shadow-sm">
                  <p className="label-mono uppercase text-muted-foreground">Zona estimada</p>
                  <p className="label-mono-md font-bold">{mapPoint.label}</p>
                </div>
              </div>
              <div className="bg-[var(--surface-low)] p-4">
                <p className="label-mono uppercase text-muted-foreground">Sector del siniestro</p>
                <p className="label-mono-md font-mono">{mapPoint.label}, Ecuador</p>
                <p className="mt-1 text-xs text-muted-foreground">Mapa referencial basado en la ciudad registrada del caso.</p>
              </div>
            </div>
          </aside>
        </div>
        <footer className="flex justify-between border-t border-border pt-6"><button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-4 py-2 label-mono-md text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Anterior</button><div className="flex items-center gap-2 text-[var(--on-tertiary-fixed)]"><ShieldCheck className="h-4 w-4" /><span className="label-mono">Validación auditable: no decide pagos ni rechazos.</span></div><button onClick={next} className="flex items-center gap-2 bg-primary px-6 py-2 label-mono-md text-white">Siguiente<ArrowRight className="h-4 w-4" /></button></footer>
      </div>
    </section>
  )
}
