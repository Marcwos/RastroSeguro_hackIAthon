'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAppState } from '@/lib/app-context'
import { CheckCircle2, CloudUpload, Gavel, Loader2, ServerCrash } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function StepUpload() {
  const {
    claims,
    selectedClaimId,
    setCurrentStep,
    setSelectedClaimId,
    setIsDataLoaded,
    uploadedFile,
    setUploadedFile,
    uploadCsvAndRefresh,
    isApiReady,
    isLoadingClaims,
    apiError,
    apiHint,
  } = useAppState()
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid'>('idle')
  const [drag, setDrag] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<string[][]>([])

  useEffect(() => {
    if (uploadedFile && claims.length > 0) setStatus('valid')
  }, [claims.length, uploadedFile])

  const buildCsvPreview = async (file: File) => {
    const text = await file.text()
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 8)
    if (!lines.length) return
    const splitLine = (line: string) => line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''))
    const headers = splitLine(lines[0]).slice(0, 5)
    const rows = lines.slice(1, 4).map((line) => splitLine(line).slice(0, 5))
    if (headers.length) setCsvHeaders(headers)
    if (rows.length) setCsvRows(rows)
  }

  const selectClaim = (id: string) => {
    setSelectedClaimId(id)
    setStatus('valid')
  }

  const handleFileUpload = useCallback((files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setStatus('validating')
    void buildCsvPreview(file)
    void uploadCsvAndRefresh(file).then((ok) => {
      setStatus(ok ? 'valid' : 'idle')
    })
  }, [uploadCsvAndRefresh])

  const handleNext = () => {
    if (status !== 'valid' || !selectedClaimId) return
    setProcessing(true)
    setIsDataLoaded(true)
    setTimeout(() => {
      setProcessing(false)
      setCurrentStep(2)
    }, 500)
  }

  const previewHeaders = csvHeaders.length
    ? csvHeaders
    : ['ID_SINIESTRO', 'RAMO', 'CIUDAD', 'PROVEEDOR', 'SCORE']

  const showPreview = csvRows.length > 0

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--on-secondary-container)]">
            <span className="label-mono-md uppercase">Protocolo v4.2</span>
            <span className="text-border">/</span>
            <span className="label-mono-md text-muted-foreground">Recepción</span>
          </div>
          <h1 className="display-heading text-3xl lg:text-4xl">Paso 1: Recepción de Información del Siniestro</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Cargue un archivo CSV con los registros del siniestro para iniciar la auditoría y priorización.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-4">
          <label
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFileUpload(e.dataTransfer.files) }}
            className={cn(
              'institutional-card group relative col-span-12 flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 p-8 transition-colors lg:col-span-8',
              drag ? 'bg-[var(--secondary-container)]' : 'hover:border-primary',
            )}
          >
            <input
              className="absolute inset-0 opacity-0"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--surface-container)] group-hover:bg-[var(--primary-container)]">
              <CloudUpload className="h-10 w-10 text-muted-foreground group-hover:text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl font-semibold">Carga de Datos Institucional</h3>
              <p className="text-sm text-muted-foreground">Arrastre un archivo CSV o haga clic para explorarlo desde su equipo.</p>
              <p className="label-mono mt-1 text-muted-foreground">Formato permitido: .csv (Máx 50MB)</p>
            </div>
          </label>

          {status === 'valid' && uploadedFile && (
            <div className="institutional-card col-span-12 flex items-center justify-between bg-[var(--surface-container)] p-4 lg:col-span-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="label-mono-md font-bold uppercase">Archivo cargado</p>
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="col-span-12 flex flex-col justify-between bg-[var(--primary-container)] p-8 text-white lg:col-span-4">
            <Gavel className="h-8 w-8 text-[var(--primary-fixed-dim)]" />
            <div className="space-y-3">
              <p className="label-mono-md uppercase text-[var(--primary-fixed)]">Protocolo de Integridad</p>
              <p className="text-sm italic text-[var(--on-primary-container)]">
                Validación estructural y preparación de datos para priorización institucional.
              </p>
            </div>
          </div>

          {apiError && (
            <div className="institutional-card col-span-12 flex gap-3 border border-destructive bg-[var(--error-container)] p-4 text-[var(--on-error-container)]">
              <ServerCrash className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">{apiError}</p>
                {apiHint && <p className="mt-1 text-sm">{apiHint}</p>}
              </div>
            </div>
          )}

          {claims.length > 0 && uploadedFile && (
            <div className="institutional-card col-span-12 bg-[var(--surface-low)] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h4 className="label-mono-md font-bold uppercase">Siniestro a procesar</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {claims.length} registro(s) cargados desde el archivo
                  </p>
                </div>
                <Select value={selectedClaimId || undefined} onValueChange={selectClaim}>
                  <SelectTrigger className="w-full sm:w-[320px]">
                    <SelectValue placeholder="Seleccione un siniestro" />
                  </SelectTrigger>
                  <SelectContent>
                    {claims.map((claim) => (
                      <SelectItem key={claim.id_siniestro} value={claim.id_siniestro}>
                        {claim.id_siniestro} · {claim.ramo || 'Sin ramo'} · Score {Math.round(Number(claim.score_final || 0))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="institutional-card col-span-12 overflow-hidden">
            <div className="section-header flex justify-between">
              <span>Previsualización de Estructura</span>
              <button type="button" className="border border-border bg-background px-2 py-1 text-[10px] uppercase">
                Configurar Mapeo
              </button>
            </div>
            {showPreview ? (
              <div className="overflow-x-auto">
                <table className="zebra w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-[var(--surface-low)]">
                      {previewHeaders.map((h) => (
                        <th key={h} className="label-mono border-r border-border px-4 py-2 text-muted-foreground last:border-r-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((row) => (
                      <tr key={row.join('-')} className="border-b border-border last:border-b-0">
                        {row.map((cell, i) => (
                          <td key={`${row[0]}-${i}`} className="label-mono-md border-r border-border px-4 py-2 last:border-r-0">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-6 text-sm text-muted-foreground">
                {isLoadingClaims
                  ? 'Procesando archivo…'
                  : 'Suba un CSV para ver la previsualización de columnas.'}
              </p>
            )}
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', isApiReady ? 'bg-[var(--tertiary-fixed-dim)]' : 'bg-destructive')} />
            <span className="label-mono text-[var(--on-tertiary-fixed)]">
              {isApiReady ? 'Servidor de Validación Activo' : 'Esperando API de RastroSeguro'}
            </span>
            {(status === 'validating' || isLoadingClaims) && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setCsvHeaders([])
                setCsvRows([])
                setUploadedFile(null)
                setStatus('idle')
                setSelectedClaimId(null)
              }}
              className="border border-border bg-[var(--surface-container)] px-8 py-2 label-mono-md"
            >
              Limpiar
            </button>
            <button
              type="button"
              disabled={status !== 'valid' || processing || !selectedClaimId}
              onClick={handleNext}
              className="bg-primary px-8 py-2 label-mono-md text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? 'Procesando...' : `Procesar ${selectedClaimId || ''}`}
            </button>
          </div>
        </footer>
      </div>
    </section>
  )
}
