'use client'

import { useMemo } from 'react'
import type { AgentResponse } from '@/lib/api'
import { formatCurrency, getRiskBadgeClasses, getRiskLabel, normalizeRiskLevel } from '@/lib/claims-data'
import { cn } from '@/lib/utils'
import { UI_COPY } from '@/lib/human-labels'
import { ArrowUpRight, Database, FileText, Sparkles } from 'lucide-react'
import { renderMarkdownBlocks } from '@/lib/markdown'

const CURRENCY_HINTS = ['monto', 'ahorro', 'suma', 'prima', 'valor', 'expuesto', 'reclamado', 'pagado', 'estimado']
const SCORE_HINTS = ['score', 'puntos', 'porcentaje', 'pct', 'promedio', 'ratio']
const RISK_KEYS = ['nivel_riesgo', 'nivel', 'riesgo']
const ID_KEYS = ['id_siniestro', 'siniestro', 'id_anillo']

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\bpct\b/gi, '%')
    .replace(/\b(\w)/g, (m) => m.toUpperCase())
}

function looksLikeCurrency(key: string): boolean {
  const k = key.toLowerCase()
  return CURRENCY_HINTS.some((hint) => k.includes(hint))
}

function looksLikeScore(key: string): boolean {
  const k = key.toLowerCase()
  return SCORE_HINTS.some((hint) => k.includes(hint))
}

function formatValue(key: string, value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'number') {
    if (looksLikeCurrency(key)) return formatCurrency(value)
    if (looksLikeScore(key)) return Number.isInteger(value) ? String(value) : value.toFixed(2)
    return String(value)
  }
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return `${value.length} elementos`
  if (isPlainObject(value)) return Object.keys(value).length ? '{…}' : '—'
  return String(value)
}

/** Recursively collect claim ids found anywhere in the agent payload. */
function extractClaimIds(data: unknown, acc = new Set<string>(), depth = 0): Set<string> {
  if (depth > 4 || acc.size > 12) return acc
  if (Array.isArray(data)) {
    data.forEach((item) => extractClaimIds(item, acc, depth + 1))
  } else if (isPlainObject(data)) {
    for (const [key, value] of Object.entries(data)) {
      if (ID_KEYS.includes(key.toLowerCase()) && typeof value === 'string' && /^[A-Z]+-?\d+/i.test(value)) {
        acc.add(value)
      } else {
        extractClaimIds(value, acc, depth + 1)
      }
    }
  } else if (typeof data === 'string') {
    const matches = data.match(/\bSIN-?\d{2,}/gi)
    matches?.forEach((m) => acc.add(m.toUpperCase()))
  }
  return acc
}

function RiskCell({ value }: { value: string }) {
  if (normalizeRiskLevel(value) === 'neutral') return <span className="text-sm">{value}</span>
  return (
    <span className={cn('inline-block px-2 py-0.5 text-[11px] font-bold uppercase', getRiskBadgeClasses(value))}>
      {getRiskLabel(value)}
    </span>
  )
}

function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = useMemo(() => {
    const seen: string[] = []
    for (const row of rows.slice(0, 12)) {
      for (const key of Object.keys(row)) {
        if (!seen.includes(key) && !isPlainObject(row[key]) && !Array.isArray(row[key])) seen.push(key)
      }
    }
    return seen.slice(0, 6)
  }, [rows])

  if (!columns.length) {
    return <p className="text-sm text-muted-foreground">Sin columnas tabulables en la respuesta.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="zebra w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-[var(--surface-container)]">
            {columns.map((col) => (
              <th key={col} className="label-mono px-3 py-2 text-left text-xs text-muted-foreground">
                {humanizeKey(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 12).map((row, idx) => (
            <tr key={idx} className="border-b border-border/60 last:border-0">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 align-top">
                  {RISK_KEYS.includes(col.toLowerCase()) && typeof row[col] === 'string' ? (
                    <RiskCell value={row[col] as string} />
                  ) : ID_KEYS.includes(col.toLowerCase()) ? (
                    <span className="label-mono text-foreground">{formatValue(col, row[col])}</span>
                  ) : (
                    <span className="text-foreground/90">{formatValue(col, row[col])}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 12 && (
        <p className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
          +{rows.length - 12} filas adicionales disponibles en el detalle completo.
        </p>
      )}
    </div>
  )
}

function KeyValueCards({ obj }: { obj: Record<string, unknown> }) {
  const scalarEntries = Object.entries(obj).filter(([, v]) => !isPlainObject(v) && !Array.isArray(v))
  const arrayEntries = Object.entries(obj).filter(([, v]) => Array.isArray(v) && (v as unknown[]).length > 0)

  return (
    <div className="space-y-3">
      {scalarEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {scalarEntries.slice(0, 9).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-border bg-[var(--surface-low)] p-3">
              <p className="label-mono text-[10px] uppercase text-muted-foreground">{humanizeKey(key)}</p>
              {RISK_KEYS.includes(key.toLowerCase()) && typeof value === 'string' ? (
                <div className="mt-1"><RiskCell value={value} /></div>
              ) : (
                <p className="mt-1 text-sm font-semibold text-foreground">{formatValue(key, value)}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {arrayEntries.map(([key, value]) => {
        const arr = value as unknown[]
        if (arr.every(isPlainObject)) {
          return (
            <div key={key} className="space-y-1.5">
              <p className="label-mono text-[10px] uppercase text-muted-foreground">{humanizeKey(key)}</p>
              <DataTable rows={arr as Record<string, unknown>[]} />
            </div>
          )
        }
        return (
          <div key={key} className="space-y-1.5">
            <p className="label-mono text-[10px] uppercase text-muted-foreground">{humanizeKey(key)}</p>
            <ul className="space-y-1">
              {arr.slice(0, 8).map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/90">
                  <span className="text-muted-foreground">•</span>
                  <span>{String(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function SourceBadge({ source }: { source?: string }) {
  if (!source) return null
  const config: Record<string, { label: string; Icon: typeof Database }> = {
    tools: { label: 'Datos del motor', Icon: Database },
    rag: { label: 'Base documental', Icon: FileText },
    llm: { label: UI_COPY.assistantSynthesis, Icon: Sparkles },
  }
  const { label, Icon } = config[source] ?? { label: source, Icon: Database }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[var(--surface-low)] px-2.5 py-1 text-[11px] text-muted-foreground">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

interface AgentResultProps {
  response: AgentResponse
  onOpenClaim?: (id: string) => void
}

export function AgentResult({ response, onOpenClaim }: AgentResultProps) {
  const { data, message, source } = response
  const claimIds = useMemo(() => Array.from(extractClaimIds(data ?? message)), [data, message])

  const body = useMemo(() => {
    if (Array.isArray(data) && data.length > 0 && data.every(isPlainObject)) {
      return <DataTable rows={data as Record<string, unknown>[]} />
    }
    if (Array.isArray(data) && data.length > 0) {
      return (
        <ul className="space-y-1">
          {(data as unknown[]).slice(0, 12).map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className="text-muted-foreground">•</span>
              <span>{String(item)}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (isPlainObject(data) && Object.keys(data).length > 0) {
      return <KeyValueCards obj={data} />
    }
    return null
  }, [data])

  return (
    <div className="space-y-3">
      {message && renderMarkdownBlocks(message)}

      {body}

      {onOpenClaim && claimIds.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {claimIds.slice(0, 6).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onOpenClaim(id)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-[var(--surface-low)] px-3 py-1.5 label-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Abrir {id}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2">
        <SourceBadge source={source} />
        <span className="text-[11px] italic text-muted-foreground">Alerta para revisión humana, no acusa fraude.</span>
      </div>
    </div>
  )
}
