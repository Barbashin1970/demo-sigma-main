import { describe, expect, it } from 'vitest'

import { scenarios } from './index'
import type { ScenarioActionDefinition, ScenarioId } from './types'

/**
 * Инварианты Phase 4.c.
 *
 * Всё, что фиксируем здесь, — это контракт, на который опираются Phase 4.d
 * (scoring) и Phase 4.e (аттестационный отчёт). Нарушение любого инварианта
 * означает, что тренажёр выведет пользователю недостижимые варианты или
 * посчитает балл неправильно.
 */
describe('Interactive step metadata (Phase 4.c)', () => {
  const scenariosWithMeta: ScenarioId[] = Object.values(scenarios)
    .filter((scenario) => scenario.steps.some((step) => step.interactiveMeta))
    .map((scenario) => scenario.id)

  it('has at least one scenario with interactiveMeta (exemplar coverage)', () => {
    expect(scenariosWithMeta).toContain('thermal-incident')
    expect(scenariosWithMeta).toContain('edds-mode-change')
  })

  describe.each(scenariosWithMeta)('scenario %s', (scenarioId) => {
    const scenario = scenarios[scenarioId]

    it('has an action dictionary whenever interactiveMeta is used', () => {
      expect(scenario.actions).toBeDefined()
      expect(scenario.actions!.length).toBeGreaterThan(0)
    })

    it('has unique action ids', () => {
      const ids = scenario.actions!.map((a) => a.id)
      expect(ids).toEqual([...new Set(ids)])
    })

    it('provides a label for every action', () => {
      scenario.actions!.forEach((action: ScenarioActionDefinition) => {
        expect(action.label.length).toBeGreaterThan(0)
      })
    })

    const stepsWithMeta = scenario.steps.filter((step) => step.interactiveMeta)

    it('skips baseline steps (no decision is made)', () => {
      const baselineWithMeta = scenario.steps.filter(
        (step) => step.scene === 'baseline' && step.interactiveMeta,
      )
      expect(baselineWithMeta).toHaveLength(0)
    })

    it('fills meta for every non-baseline step', () => {
      const nonBaseline = scenario.steps.filter((step) => step.scene !== 'baseline')
      expect(stepsWithMeta).toHaveLength(nonBaseline.length)
    })

    describe.each(stepsWithMeta)('step $id', (step) => {
      const meta = step.interactiveMeta!
      const actionIds = new Set(scenario.actions!.map((a) => a.id))

      it('expectedActions is a subset of allowedActions', () => {
        const allowed = new Set(meta.allowedActions)
        for (const expected of meta.expectedActions) {
          expect(allowed.has(expected)).toBe(true)
        }
      })

      it('every allowedActions id exists in the scenario action dictionary', () => {
        for (const id of meta.allowedActions) {
          expect(actionIds.has(id)).toBe(true)
        }
      })

      it('has a positive maxDecisionTimeSec', () => {
        expect(meta.maxDecisionTimeSec).toBeGreaterThan(0)
      })

      it('has a non-negative weight', () => {
        expect(meta.weight).toBeGreaterThanOrEqual(0)
      })

      it('has at least one expected action', () => {
        expect(meta.expectedActions.length).toBeGreaterThan(0)
      })

      it('does not mark an expected action as prohibited', () => {
        const prohibitedIds = new Set(
          scenario.actions!.filter((a) => a.prohibited).map((a) => a.id),
        )
        for (const expected of meta.expectedActions) {
          expect(prohibitedIds.has(expected)).toBe(false)
        }
      })

      it('has a rationale for at least one expected action — ensures the hint is meaningful', () => {
        const hasRationale = meta.expectedActions.some((id) => {
          const action = scenario.actions!.find((a) => a.id === id)
          return Boolean(action?.rationale && action.rationale.trim().length > 0)
        })
        expect(hasRationale).toBe(true)
      })

      it('offers at least two allowed actions — a meaningful choice, not a single button', () => {
        expect(meta.allowedActions.length).toBeGreaterThanOrEqual(2)
      })

      it('has at least one non-expected action for contrast (distractor)', () => {
        const expectedSet = new Set(meta.expectedActions)
        const distractors = meta.allowedActions.filter((id) => !expectedSet.has(id))
        expect(distractors.length).toBeGreaterThanOrEqual(1)
      })
    })
  })
})
