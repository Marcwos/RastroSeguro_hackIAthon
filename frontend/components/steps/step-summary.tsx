'use client'

import { useState } from 'react'
import { useAppState } from '@/lib/app-context'
import { formatCurrency } from '@/lib/claims-data'
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Image as ImageIcon, Loader2, Map, MapPin, Navigation, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StepSummary() {
  const { selectedClaim, setCurrentStep } = useAppState()
  const [processing, setProcessing] = useState(false)
  if (!selectedClaim) return <div className="flex h-full items-center justify-center text-muted-foreground">No hay caso seleccionado</div>
  const next = () => { setProcessing(true); setTimeout(() => { setProcessing(false); setCurrentStep(3) }, 600) }
  const docIcon = (tipo: string) => tipo === 'foto' || tipo === 'video' ? ImageIcon : tipo === 'telemetria' ? Navigation : FileText

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><h1 className="display-heading text-3xl lg:text-4xl">Paso 2: Resumen Técnico del Siniestro</h1><p className="mt-1 text-base text-muted-foreground">Validación clara del caso antes de ejecutar el análisis de riesgo.</p></div>
          <div className="bg-primary px-6 py-3 text-white"><span className="label-mono-md">CASE ID: </span><span className="label-mono-md font-bold tracking-widest">{selectedClaim.id_siniestro}</span></div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            <div className="institutional-card overflow-hidden"><div className="section-header">Metadatos del Siniestro</div><table className="zebra w-full text-left"><thead><tr className="border-b border-border bg-[var(--surface-low)]"><th className="label-mono px-4 py-2 text-muted-foreground">CATEGORÍA</th><th className="label-mono px-4 py-2 text-muted-foreground">DETALLE</th></tr></thead><tbody><tr><td className="px-4 py-2 font-semibold">Ramo</td><td className="px-4 py-2 text-muted-foreground">{selectedClaim.ramo}</td></tr><tr><td className="px-4 py-2 font-semibold">Monto reclamado</td><td className="px-4 py-2 font-mono">{formatCurrency(selectedClaim.monto_reclamado)}</td></tr><tr><td className="px-4 py-2 font-semibold">Cobertura</td><td className="px-4 py-2"><span className="bg-[var(--secondary-container)] px-2 py-1 label-mono font-bold uppercase text-[var(--on-secondary-container)]">{selectedClaim.cobertura}</span></td></tr><tr><td className="px-4 py-2 font-semibold">Ciudad</td><td className="flex items-center gap-2 px-4 py-2"><MapPin className="h-4 w-4" />{selectedClaim.ciudad}, Colombia</td></tr><tr><td className="px-4 py-2 font-semibold">Proveedor</td><td className="px-4 py-2 font-mono">{selectedClaim.id_proveedor}</td></tr></tbody></table></div>

            <div className="institutional-card overflow-hidden"><div className="section-header flex items-center justify-between"><span>Narrativa del Evento</span><FileText className="h-4 w-4 text-muted-foreground" /></div><div className="p-6"><p className="border-l-4 border-border pl-4 text-base italic leading-relaxed">“{selectedClaim.narrativa}”</p></div></div>

            <div className="institutional-card overflow-hidden"><div className="section-header">Verificación de Documentación</div><div className="divide-y divide-border">{selectedClaim.documentos.map((doc, i) => { const Icon = docIcon(doc.tipo); return <div key={i} className="flex items-center justify-between p-4 hover:bg-[var(--surface-low)]"><div className="flex items-center gap-4"><Icon className="h-5 w-5" /><div><p className="font-semibold">{doc.nombre}</p><p className="label-mono text-muted-foreground">{doc.tipo === 'foto' ? 'Evidencia visual' : doc.tipo === 'telemetria' ? 'Registro de ubicación' : 'Soporte documental'}</p></div></div><span className={cn('flex items-center gap-1 px-2 py-1 label-mono-md font-bold uppercase', doc.estado === 'completo' ? 'bg-[var(--tertiary-fixed)] text-[var(--on-tertiary-fixed)]' : 'bg-[var(--error-container)] text-[var(--on-error-container)]')}><CheckCircle2 className="h-4 w-4" />{doc.estado === 'completo' ? 'Verified' : doc.estado}</span></div>})}</div></div>
          </div>

          <aside className="col-span-12 space-y-6 lg:col-span-4">
            <div className="border border-primary bg-[var(--primary-container)] p-6 text-white"><h3 className="label-mono-md font-bold uppercase tracking-widest text-[var(--on-primary-container)]">Analysis Readiness</h3><div className="mt-4"><div className="flex items-end justify-between"><span className="font-display text-3xl font-semibold">Ready</span><span className="label-mono-md text-[var(--tertiary-fixed)]">95% Complete</span></div><div className="mt-2 h-2 bg-[var(--on-primary-container)]"><div className="h-full bg-[var(--tertiary-fixed-dim)]" style={{ width: '95%' }} /></div></div><p className="mt-4 text-sm text-[var(--on-primary-container)]">La información mínima del caso está completa. La validación documental y geográfica permite continuar con priorización de riesgo.</p><button onClick={next} className="mt-6 flex w-full items-center justify-center gap-2 bg-white py-3 label-mono-md font-bold uppercase text-primary hover:bg-[var(--surface-high)]">{processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Proceed to Risk Analysis'}<ArrowRight className="h-4 w-4" /></button></div>
            <div className="institutional-card overflow-hidden"><div className="section-header flex items-center gap-2"><Map className="h-4 w-4" />Contexto Geográfico</div><div className="relative aspect-square bg-[var(--surface-container)] grayscale"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4b5563_1px,transparent_1px)] [background-size:18px_18px] opacity-40" /><svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 300"><path d="M20 210 C75 170 85 90 150 120 S225 90 280 40" fill="none" stroke="#191c1e" strokeWidth="1" opacity=".5"/><path d="M60 280 C105 220 150 210 245 250" fill="none" stroke="#191c1e" strokeWidth="1" opacity=".4"/></svg><div className="absolute inset-0 flex items-center justify-center"><span className="h-8 w-8 rounded-full border-4 border-white bg-destructive" /></div></div><div className="bg-[var(--surface-low)] p-4"><p className="label-mono uppercase text-muted-foreground">Sector</p><p className="label-mono-md font-mono">{selectedClaim.ubicacion?.sector || selectedClaim.ciudad}</p></div></div>
          </aside>
        </div>
        <footer className="flex justify-between border-t border-border pt-6"><button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-4 py-2 label-mono-md text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Anterior</button><div className="flex items-center gap-2 text-[var(--on-tertiary-fixed)]"><ShieldCheck className="h-4 w-4" /><span className="label-mono">Validación auditable: no decide pagos ni rechazos.</span></div><button onClick={next} className="flex items-center gap-2 bg-primary px-6 py-2 label-mono-md text-white">Siguiente<ArrowRight className="h-4 w-4" /></button></footer>
      </div>
    </section>
  )
}
