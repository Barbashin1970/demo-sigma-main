import { describe, expect, it } from 'vitest'

import { scenarios } from '../scenarios'
import { getStoryboardScene, storyboardSceneCopy } from './storyboard'

describe('storyboard helpers', () => {
  it('keeps the signal to forecast progression for each scenario', () => {
    expect(getStoryboardScene(scenarios['thermal-incident'].steps[0])).toBe('baseline')
    expect(getStoryboardScene(scenarios['thermal-incident'].steps[1])).toBe('signal')
    expect(getStoryboardScene(scenarios['thermal-incident'].steps[2])).toBe('decision')
    expect(getStoryboardScene(scenarios['thermal-incident'].steps[3])).toBe('action')
    expect(getStoryboardScene(scenarios['thermal-incident'].steps[4])).toBe('outcome')

    for (const scenario of Object.values(scenarios)) {
      expect(scenario.steps).toHaveLength(5)
      expect(scenario.smartphoneActions).toHaveLength(4)
      expect(scenario.cityContext.objects.length).toBeGreaterThan(2)
      expect(scenario.steps.every((step) => step.tasks.length > 0)).toBe(true)
      expect(stepHasRecommendations(scenario)).toBe(true)
    }
  })

  it('marks the air-quality scenario as virtual/integration driven and keeps storyboard copy leader-facing', () => {
    const airScenario = scenarios['air-quality-co2']

    expect(airScenario.sources.some((source) => source.kind === 'virtual')).toBe(true)
    expect(airScenario.steps[2].timeline.some((event) => event.sourceKind === 'virtual')).toBe(true)

    for (const copy of Object.values(storyboardSceneCopy)) {
      expect(copy.title).not.toMatch(/оператор/i)
      expect(copy.description).not.toMatch(/оператор/i)
    }
  })
})

const stepHasRecommendations = (scenario: (typeof scenarios)[keyof typeof scenarios]) =>
  scenario.steps.every((step) => step.incident.recommendations.length > 0)
