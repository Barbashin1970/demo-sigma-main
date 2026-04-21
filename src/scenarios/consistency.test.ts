import { describe, expect, it } from 'vitest'

import { resolveScenarioId, scenarioIds, scenarios } from './index'

describe('scenario catalog consistency', () => {
  it('keeps route aliases compatible with legacy entrypoints', () => {
    expect(resolveScenarioId('hospital-fire')).toBe('thermal-incident')
    expect(resolveScenarioId('hospital-breach')).toBe('heat-inlet-breach')
    expect(resolveScenarioId('lab-overheat')).toBe('air-quality-co2')
  })

  it('exposes every catalog scenario through scenarioIds', () => {
    expect(scenarioIds).toEqual(expect.arrayContaining(Object.keys(scenarios) as typeof scenarioIds))
    expect(new Set(scenarioIds).size).toBe(scenarioIds.length)
    expect(scenarioIds.length).toBe(Object.keys(scenarios).length)
  })

  it('keeps cross-references between sources, zones and steps valid', () => {
    for (const scenario of Object.values(scenarios)) {
      const sourceIds = new Set(scenario.sources.map((source) => source.id))

      expect(scenario.steps.length).toBe(5)
      expect(scenario.smartphoneActions.length).toBe(4)

      for (const step of scenario.steps) {
        const zoneIds = new Set(step.zones.map((zone) => zone.id))

        expect(step.timeline.length).toBeGreaterThan(0)
        expect(step.tasks.length).toBeGreaterThan(0)
        expect(step.incident.recommendations.length).toBeGreaterThan(0)

        for (const sourceId of step.activeSourceIds) {
          expect(sourceIds.has(sourceId)).toBe(true)
        }

        for (const zone of step.zones) {
          for (const sourceId of zone.sourceIds) {
            expect(sourceIds.has(sourceId)).toBe(true)
          }
        }

        for (const zoneId of step.incident.affectedZones) {
          expect(zoneIds.has(zoneId)).toBe(true)
        }
      }
    }
  })

  it('keeps generic zone labels out of scenario copy', () => {
    for (const scenario of Object.values(scenarios)) {
      for (const step of scenario.steps) {
        for (const zone of step.zones) {
          expect(zone.label).not.toMatch(/^Зона [ABC]$/i)
        }
      }
    }
  })
})
