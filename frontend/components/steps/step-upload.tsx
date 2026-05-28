'use client'

import { useCallback, useState } from 'react'
import { useAppState } from '@/lib/app-context'
import { demoCases } from '@/lib/claims-data'
import { CloudUpload, Database, Gavel, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const previewRows = [
  ['E-99201', '2024-01-15', 'Colisión', '6.24, -75.58', '$12,500.00'],
  ['E-99202', '2024-01-10', 'Robo Total', '4.65, -74.09', '$45,000.00'],
  ['E-99203', '2024-01-08', 'Daños Propios', '3.42, -76.52', '$3,200.00'],
]

export function StepUpload() {
  const { setCurrentStep, setSelectedClaimId, setIsDataLoaded, setUploadedFile } = useAppState()
  const [selectedDemo, setSelectedDemo] = useState(demoCases[0].id)
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid'>('idle')
  const [drag, setDrag] = useState(false)
  const [processing, setProcessing] = useState(false)

  const validateDemo = (id: string) => {
    setSelectedDemo(id); setSelectedClaimId(id); setStatus('validating')
    setTimeout(() => setStatus('valid'), 650)
  }

  const handleFileUpload = useCallback((files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setUploadedFile(file); setStatus('validating')
    setTimeout(() => setStatus('valid'), 850)
  }, [setUploadedFile])

  const handleNext = () => {
    if (status !== 'valid') return
    setProcessing(true); setSelectedClaimId(selectedDemo); setIsDataLoaded(true)
    setTimeout(() => { setProcessing(false); setCurrentStep(2) }, 500)
  }

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--on-secondary-container)]">
            <span className="label-mono-md uppercase">Protocolo v4.2</span><span className="text-border">/</span><span className="label-mono-md text-muted-foreground">Recepción</span>
          </div>
          <h1 className="display-heading text-3xl lg:text-4xl">Paso 1: Recepción de Información del Siniestro</h1>
          <p className="max-w-2xl text-base text-muted-foreground">Inicie la auditoría cargando los registros del siniestro o seleccionando un caso de referencia para validar el score.</p>
        </header>

        <div className="grid grid-cols-12 gap-4">
          <label
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFileUpload(e.dataTransfer.files) }}
            className={cn('institutional-card group relative col-span-12 flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 p-8 transition-colors lg:col-span-8', drag ? 'bg-[var(--secondary-container)]' : 'hover:border-primary')}
          >
            <input className="absolute inset-0 opacity-0" type="file" accept=".csv,.xls,.xlsx,.json" onChange={(e) => handleFileUpload(e.target.files)} />
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--surface-container)] group-hover:bg-[var(--primary-container)]">
              <CloudUpload className="h-10 w-10 text-muted-foreground group-hover:text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl font-semibold">Carga de Datos Institucional</h3>
              <p className="text-sm text-muted-foreground">Arrastre archivos CSV/JSON o haga clic para explorar el sistema local.</p>
              <p className="label-mono mt-1 text-muted-foreground">Formatos permitidos: .csv, .xls, .json (Máx 50MB)</p>
            </div>
          </label>

          <div className="col-span-12 flex flex-col justify-between bg-[var(--primary-container)] p-8 text-white lg:col-span-4">
            <Gavel className="h-8 w-8 text-[var(--primary-fixed-dim)]" />
            <div className="space-y-3">
              <p className="label-mono-md uppercase text-[var(--primary-fixed)]">Protocolo de Integridad</p>
              <p className="text-sm italic text-[var(--on-primary-container)]">Validación estructural y preparación de datos para priorización institucional.</p>
            </div>
          </div>

          <div className="institutional-card col-span-12 bg-[var(--surface-low)] p-4">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
              <h4 className="label-mono-md font-bold uppercase">Casos de Referencia para Demo</h4>
              <span className="label-mono text-muted-foreground">{demoCases.length} registros disponibles</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {demoCases.slice(0, 3).map((demo, i) => (
                <button key={demo.id} onClick={() => validateDemo(demo.id)} className={cn('border border-border border-l-4 bg-background p-4 text-left transition-colors hover:bg-[var(--surface-container)]', selectedDemo === demo.id ? 'border-l-primary' : 'border-l-secondary')}>
                  <p className="label-mono text-secondary">REF-2024-00{i + 1}</p>
                  <h5 className="mt-1 font-semibold">{demo.label.replace('Caso demo: ', '')}</h5>
                  <div className="mt-3 flex items-center gap-2 text-muted-foreground"><Database className="h-3.5 w-3.5" /><span className="label-mono">{[1240, 450, 89][i]} Filas</span></div>
                </button>
              ))}
            </div>
          </div>

          <div className="institutional-card col-span-12 overflow-hidden">
            <div className="section-header flex justify-between"><span>Previsualización de Estructura</span><button className="border border-border bg-background px-2 py-1 text-[10px] uppercase">Configurar Mapeo</button></div>
            <div className="overflow-x-auto"><table className="zebra w-full border-collapse text-left"><thead><tr className="border-b border-border bg-[var(--surface-low)]">{['ID_EXPEDIENTE','FECHA_SINIESTRO','TIPO_RIESGO','UBICACION_GPS','MONTO_DECLARADO'].map(h=><th key={h} className="label-mono border-r border-border px-4 py-2 text-muted-foreground last:border-r-0">{h}</th>)}</tr></thead><tbody>{previewRows.map((r)=><tr key={r[0]} className="border-b border-border last:border-b-0">{r.map((c)=><td key={c} className="label-mono-md border-r border-border px-4 py-2 last:border-r-0">{c}</td>)}</tr>)}</tbody></table></div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border pt-6">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--tertiary-fixed-dim)]" /><span className="label-mono text-[var(--on-tertiary-fixed)]">Servidor de Validación Activo</span>{status === 'validating' && <Loader2 className="h-4 w-4 animate-spin" />}</div>
          <div className="flex gap-3"><button className="border border-border bg-[var(--surface-container)] px-8 py-2 label-mono-md">Cancelar</button><button disabled={status !== 'valid' || processing} onClick={handleNext} className="bg-primary px-8 py-2 label-mono-md text-white disabled:cursor-not-allowed disabled:opacity-40">{processing ? 'Procesando...' : 'Procesar y Continuar'}</button></div>
        </footer>
      </div>
    </section>
  )
}
