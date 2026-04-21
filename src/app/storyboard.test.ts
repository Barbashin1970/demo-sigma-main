import { describe, expect, it } from 'vitest'

import { scenarios } from '../scenarios'
import { getStoryboardScene, storyboardSceneCopy } from './storyboard'

describe('storyboard helpers', () => {
  it('derives the signal-to-forecast progression for every scenario', () => {
    for (const scenario of Object.values(scenarios)) {
      expect(getStoryboardScene(scenario.steps[0])).toBe('baseline')
      expect(getStoryboardScene(scenario.steps[1])).toBe('signal')
      expect(getStoryboardScene(scenario.steps[2])).toBe('decision')
      expect(getStoryboardScene(scenario.steps[3])).toBe('action')
      expect(getStoryboardScene(scenario.steps[4])).toBe('outcome')
    }
  })

  it('keeps structural guarantees for every scenario', () => {
    for (const scenario of Object.values(scenarios)) {
      expect(scenario.steps).toHaveLength(5)
      expect(scenario.smartphoneActions).toHaveLength(4)
      expect(scenario.cityContext.objects.length).toBeGreaterThan(2)
      expect(scenario.steps.every((step) => step.tasks.length > 0)).toBe(true)
      expect(scenario.steps.every((step) => step.incident.recommendations.length > 0)).toBe(true)
    }
  })

  it('uses a virtual source in the air-quality scenario inventory', () => {
    const airScenario = scenarios['air-quality-co2']
    expect(airScenario.sources.some((source) => source.kind === 'virtual')).toBe(true)
  })

  it('keeps storyboard copy leader-facing, not operator-facing', () => {
    for (const copy of Object.values(storyboardSceneCopy)) {
      expect(copy.title).not.toMatch(/оператор/i)
      expect(copy.description).not.toMatch(/оператор/i)
    }
  })
})
