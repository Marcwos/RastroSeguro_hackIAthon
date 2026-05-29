'use client'

import { RecurringEntity } from './graph-types'
import { humanizeEntityType } from '@/lib/human-labels'

export function RecurringEntitiesList({ entities, limit = 5 }: { entities: RecurringEntity[]; limit?: number }) {
  const top = [...entities].sort((a, b) => b.total_siniestros - a.total_siniestros).slice(0, limit)
  if (!top.length) {
    return <p className="text-sm text-muted-foreground">No hay elementos que se repitan en otros siniestros.</p>
  }

  return (
    <div className="space-y-2">
      {top.map((item) => (
        <div key={item.key} className="border border-border bg-[var(--surface-low)] p-3">
          <p className="label-mono text-muted-foreground">{humanizeEntityType(item.type)}</p>
          <p className="font-semibold">{item.value}</p>
          <p className="text-xs text-muted-foreground">Aparece en {item.total_siniestros} siniestros</p>
        </div>
      ))}
    </div>
  )
}
