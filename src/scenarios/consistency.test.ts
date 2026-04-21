import { describe, expect, it } from 'vitest'

import { resolveScenarioId, scenarioIds, scenarios } from './index'

describe('scenario definitions', () => {
  it('keeps route aliases compatible with the current demo entrypoints', () => {
    expect(resolveScenarioId('hospital-fire')).toBe('thermal-incident')
    expect(resolveScenarioId('hospital-breach')).toBe('heat-inlet-breach')
    expect(resolveScenarioId('lab-overheat')).toBe('air-quality-co2')
  })

  it('keeps scenario bindings internally consistent', () => {
    expect(scenarioIds).toEqual(['thermal-incident', 'heat-inlet-breach', 'air-quality-co2'])

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

  it('uses dedicated object names for air and thermal scenarios only', () => {
    const airScenario = scenarios['air-quality-co2']
    const thermalScenario = scenarios['thermal-incident']
    const waterScenario = scenarios['heat-inlet-breach']

    expect(airScenario.cityContext.objects[0]?.name).toBe('Лес академгородка')
    expect(airScenario.steps.every((step) => step.objectCard.name === 'Лес академгородка')).toBe(true)
    expect(thermalScenario.cityContext.objects[0]?.name).toBe('Серверная НГУ')
    expect(thermalScenario.steps.every((step) => step.objectCard.name === 'Серверная НГУ')).toBe(true)
    expect(waterScenario.cityContext.objects[0]?.name).toBe('Клиника Мешалкина')
    expect(waterScenario.steps.every((step) => step.objectCard.name === 'Клиника Мешалкина')).toBe(true)
  })

  it('aligns scenario titles and zone labels with their venues', () => {
    expect(scenarios['thermal-incident'].title).toMatch(/серверн/i)
    expect(scenarios['heat-inlet-breach'].title).toMatch(/больниц/i)
    expect(scenarios['air-quality-co2'].title).toMatch(/лес/i)

    for (const scenario of Object.values(scenarios)) {
      expect(
        scenario.steps.every((step) => step.zones.every((zone) => !/^Зона [ABC]$/i.test(zone.label))),
      ).toBe(true)
    }
  })
})
