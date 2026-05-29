'use client'

import { useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppState } from '@/lib/app-context'
import { safeGraphPayload } from '@/components/graph/graph-utils'
import { buildClaimGraph } from '@/components/graph/graph-utils'
import { ClaimNetworkMini } from '@/components/graph/claim-network-mini'
import { ClaimNetworkReactFlow } from '@/components/graph/claim-network-reactflow'
import { RecurringEntitiesList } from '@/components/graph/recurring-entities-list'
import { ProviderRankingChart } from '@/components/graph/provider-ranking-chart'
import { RiskSpiderChart } from '@/components/graph/risk-spider-chart'
import { FraudRingsView } from '@/components/graph/fraud-rings-view'

export function StepIntelligence() {
  const { selectedClaim, selectedClaimId, selectedExplanation, loadClaimExplanation, claims } = useAppState()

  useEffect(() => {
    if (selectedClaimId && selectedExplanation?.id_siniestro !== selectedClaimId) {
      void loadClaimExplanation(selectedClaimId)
    }
  }, [loadClaimExplanation, selectedClaimId, selectedExplanation?.id_siniestro])

  const payload = useMemo(() => {
    const hasCurrentExplanation = selectedExplanation?.id_siniestro === selectedClaimId
    const details = hasCurrentExplanation
      ? (selectedExplanation?.detalles_avanzados as Record<string, unknown> | undefined)?.grafo
      : null

    return safeGraphPayload(
      details
        ? { ...(details as Record<string, unknown>), id_siniestro: selectedClaim?.id_siniestro, score_grafo: selectedClaim?.score_grafo }
        : null,
      selectedClaim?.id_siniestro || 'SIN-NA',
    )
  }, [selectedClaim?.id_siniestro, selectedClaim?.score_grafo, selectedClaimId, selectedExplanation?.detalles_avanzados, selectedExplanation?.id_siniestro])

  const graph = buildClaimGraph(payload)

  return (
    <section className="px-3 py-5 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header>
          <span className="label-mono uppercase tracking-widest text-muted-foreground">Inteligencia antifraude</span>
          <h1 className="display-heading text-3xl lg:text-4xl">Paso 4: Inteligencia de Relaciones</h1>
          <p className="mt-2 text-base text-readable text-muted-foreground">Exploración de red, recurrencias y concentración de entidades.</p>
        </header>

        <Tabs defaultValue="graph" className="w-full">
          <TabsList>
            <TabsTrigger value="graph">Red del caso</TabsTrigger>
            <TabsTrigger value="rings">Redes de fraude</TabsTrigger>
            <TabsTrigger value="entities">Entidades recurrentes</TabsTrigger>
            <TabsTrigger value="ranking">Concentración</TabsTrigger>
            <TabsTrigger value="spider">Patrones (Araña)</TabsTrigger>
          </TabsList>
          <TabsContent value="graph" className="mt-3 institutional-card space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Vista completa de la red del siniestro (zoom y desplazamiento habilitados).</p>
            <ClaimNetworkReactFlow nodes={graph.nodes} edges={graph.edges} />
          </TabsContent>
          <TabsContent value="rings" className="mt-4">
            <FraudRingsView />
          </TabsContent>
          <TabsContent value="entities" className="mt-3 institutional-card p-4">
            <RecurringEntitiesList entities={payload.recurring_entities} limit={12} />
          </TabsContent>
          <TabsContent value="ranking" className="mt-3 institutional-card p-4">
            <ProviderRankingChart entities={payload.recurring_entities} />
          </TabsContent>
          <TabsContent value="spider" className="mt-4">
            <RiskSpiderChart selectedClaim={selectedClaim} claims={claims} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
