'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatRecurrenceLabel, UI_COPY } from '@/lib/human-labels'
import { RecurringEntity } from './graph-types'

const gridStroke = 'color-mix(in oklch, var(--chart-grid) 45%, transparent)'
const axisStyle = { fill: 'var(--muted-foreground)', fontSize: 11 }

function shortLabel(text: string, max = 22): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

export function RecurrenceTopChart({ entities }: { entities: RecurringEntity[] }) {
  const rows = [...entities]
    .sort((a, b) => b.total_siniestros - a.total_siniestros)
    .slice(0, 8)
    .map((e) => ({
      name: shortLabel(formatRecurrenceLabel(e)),
      fullName: formatRecurrenceLabel(e),
      total: e.total_siniestros,
    }))

  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay elementos que se repitan en otros siniestros para mostrar.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{UI_COPY.topRecurrenceSubtitle}</p>
      <ChartContainer
        config={{ total: { label: UI_COPY.recurrenceCount, color: 'var(--chart-1)' } }}
        className="h-[280px] w-full"
      >
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid horizontal={false} stroke={gridStroke} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={axisStyle} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tickLine={false}
            axisLine={false}
            tick={axisStyle}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload as { fullName?: string } | undefined
                  return item?.fullName || ''
                }}
              />
            }
          />
          <Bar dataKey="total" radius={4} fill="var(--chart-1)" />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
