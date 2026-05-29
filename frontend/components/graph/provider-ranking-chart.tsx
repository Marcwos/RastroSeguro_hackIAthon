'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { RecurringEntity } from './graph-types'

const gridStroke = 'color-mix(in oklch, var(--chart-grid) 45%, transparent)'
const axisStyle = { fill: 'var(--muted-foreground)', fontSize: 12 }

export function ProviderRankingChart({ entities }: { entities: RecurringEntity[] }) {
  const rows = [...entities]
    .filter((e) => e.type === 'proveedor' || e.field === 'id_proveedor')
    .sort((a, b) => b.total_siniestros - a.total_siniestros)
    .slice(0, 6)
    .map((e) => ({ name: e.value, total: e.total_siniestros }))

  if (!rows.length) return <p className="text-sm text-muted-foreground">No hay recurrencias de proveedor para graficar.</p>

  return (
    <ChartContainer config={{ total: { label: 'Siniestros', color: 'var(--chart-1)' } }} className="h-[260px] w-full">
      <BarChart data={rows} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axisStyle} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="total" radius={4} fill="var(--chart-1)" />
      </BarChart>
    </ChartContainer>
  )
}
