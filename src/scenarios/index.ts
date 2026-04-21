import type { ScenarioDefinition, ScenarioId } from './types'

import { scenarios } from './catalog'

export * from './types'

export const scenarioIds: ScenarioId[] = [
  'thermal-incident',
  'heat-inlet-breach',
  'air-quality-co2',
  'dormitory-flood',
  'lab-access-breach',
]

const routeAliases: Record<string, ScenarioId> = {
  'hospital-fire': 'thermal-incident',
  'hospital-breach': 'heat-inlet-breach',
  'lab-overheat': 'air-quality-co2',
}

export const resolveScenarioId = (scenarioId: string | undefined): ScenarioId | null => {
  if (!scenarioId) {
    return null
  }

  if (scenarioIds.includes(scenarioId as ScenarioId)) {
    return scenarioId as ScenarioId
  }

  return routeAliases[scenarioId] ?? null
}

export const isScenarioId = (scenarioId: string | undefined): scenarioId is ScenarioId =>
  scenarioIds.includes(scenarioId as ScenarioId)

export { scenarios }
export type { ScenarioDefinition }
