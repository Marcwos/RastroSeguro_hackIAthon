'use client'

import { ClaimSummary } from '@/lib/api'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const AXES = [
  { key: 'score_reglas', label: 'Reglas' },
  { key: 'score_modelo', label: 'Modelo' },
  { key: 'score_anomalia', label: 'Anomalía' },
  { key: 'score_nlp', label: 'NLP' },
  { key: 'score_grafo', label: 'Relaciones' },
  { key: 'score_categorico', label: 'Categórico' },
] as const

const gridStroke = 'hsl(var(--chart-grid) / 0.35)'

const num = (v: unknown) => Number(v ?? 0)

export function RiskSpiderChart({ selectedClaim, claims }: { selectedClaim: ClaimSummary | null; claims: ClaimSummary[] }) {
  if (!selectedClaim) return null

  const data = AXES.map((axis) => {
    const avg = claims.length
      ? claims.reduce((acc, c) => acc + num(c[axis.key]), 0) / claims.length
      : 0

    return {
      dimension: axis.label,
      Caso: Math.round(num(selectedClaim[axis.key]) * 100) / 100,
      Promedio: Math.round(avg * 100) / 100,
      diff: Math.round((num(selectedClaim[axis.key]) - avg) * 100) / 100,
    }
  })

  const topDrivers = [...data]
    .sort((a, b) => b.diff - a.diff)
    .filter((d) => d.diff > 0)
    .slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="institutional-card p-4 lg:col-span-2">
          <p className="label-mono mb-2 text-muted-foreground">Patrón de aumento de riesgo (caso vs promedio dataset)</p>
          <ChartContainer
            config={{
              Caso: { label: 'Caso', color: 'hsl(var(--chart-1))' },
              Promedio: { label: 'Promedio', color: 'hsl(var(--chart-2))' },
            }}
            className="h-[360px] w-full"
          >
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke={gridStroke} />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <PolarRadiusAxis angle={30} domain={[0, 40]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} stroke={gridStroke} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Radar name="Promedio" dataKey="Promedio" fill="var(--color-Promedio)" fillOpacity={0.15} stroke="var(--color-Promedio)" strokeWidth={2} />
              <Radar name="Caso" dataKey="Caso" fill="var(--color-Caso)" fillOpacity={0.3} stroke="var(--color-Caso)" strokeWidth={2.5} />
            </RadarChart>
          </ChartContainer>
        </div>

        <div className="institutional-card p-4">
          <h4 className="label-mono-md mb-3 font-bold uppercase">Drivers principales</h4>
          {topDrivers.length ? (
            <div className="space-y-2">
              {topDrivers.map((d) => (
                <div key={d.dimension} className="border border-border bg-[var(--surface-low)] p-3">
                  <p className="font-semibold">{d.dimension}</p>
                  <p className="text-sm text-muted-foreground">+{d.diff} vs promedio</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Este caso no supera el promedio en componentes clave.</p>
          )}
        </div>
      </div>
    </div>
  )
}
