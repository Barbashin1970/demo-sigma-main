import { describe, expect, it } from 'vitest'

import {
  criticalityIcon,
  scenarioTabIcon,
  sourceKindIcon,
  taskStatusIcon,
  timelineEventIcon,
  zoneIcon,
} from '../app/components/icons'
import { venues } from '../app/venues'
import type { Criticality, ScenarioDefinition, ScenarioStep, StoryboardSceneKind } from './types'
import { scenarios } from './index'

const sceneOrder: StoryboardSceneKind[] = ['baseline', 'signal', 'decision', 'action', 'outcome']

const criticalityRank: Record<Criticality, number> = {
  normal: 0,
  watch: 1,
  elevated: 2,
  high: 3,
  critical: 4,
}

const scenarioList = Object.values(scenarios) as ScenarioDefinition[]

describe.each(scenarioList.map((scenario) => [scenario.id, scenario] as const))(
  'scenario invariants — %s',
  (_id, scenario) => {
    it('walks the storyboard kinds in canonical order', () => {
      expect(scenario.steps.map((step) => step.scene)).toEqual(sceneOrder)
    })

    it('keeps one riskKind across every step', () => {
      const kinds = new Set(scenario.steps.map((step) => step.incident.riskKind))
      expect(kinds.size).toBe(1)
    })

    it('follows its invariant profile — escalating rises to action, resolving peaks at signal', () => {
      const ranks = scenario.steps.map((step) => criticalityRank[step.systemCriticality])
      if (scenario.invariantProfile === 'escalating') {
        // baseline → action must be non-decreasing
        for (let i = 1; i < 4; i += 1) {
          expect(ranks[i]).toBeGreaterThanOrEqual(ranks[i - 1])
        }
        // outcome can stay flat or de-escalate vs action
        expect(ranks[4]).toBeLessThanOrEqual(ranks[3])
      } else {
        // resolving: step 1 (signal) is the peak; from signal onward must be non-increasing
        expect(ranks[1]).toBeGreaterThanOrEqual(ranks[0])
        for (let i = 2; i < ranks.length; i += 1) {
          expect(ranks[i]).toBeLessThanOrEqual(ranks[i - 1])
        }
      }
    })

    it('keeps a non-empty sourceLabel for every timeline event', () => {
      for (const step of scenario.steps) {
        for (const event of step.timeline) {
          expect(event.sourceLabel.trim().length).toBeGreaterThan(0)
        }
      }
    })

    it('fills every explainability field on every step', () => {
      for (const step of scenario.steps) {
        const { criticality, decisionBasis, causeEffectSummary, ruleReference } = step.explainability
        expect(criticality.trim().length).toBeGreaterThan(0)
        expect(decisionBasis.trim().length).toBeGreaterThan(0)
        expect(causeEffectSummary.trim().length).toBeGreaterThan(0)
        expect(ruleReference.trim().length).toBeGreaterThan(0)
      }
    })

    it('forecasts with and without Sigma in non-empty comparable fields', () => {
      for (const step of scenario.steps) {
        const { withSigma, withoutSigma } = step.forecast
        expect(withSigma.trim().length).toBeGreaterThan(0)
        expect(withoutSigma.trim().length).toBeGreaterThan(0)
      }
    })

    it('exposes at least one confirmable escalation after the signal step', () => {
      const confirmable = scenario.steps.some((step) => step.incident.escalation.canConfirm)
      expect(confirmable).toBe(true)
    })

    it('exposes a confirmable action with a pending task title at the step where canConfirm first flips on', () => {
      const firstConfirmableIdx = scenario.steps.findIndex((s) => s.incident.escalation.canConfirm)
      expect(firstConfirmableIdx).toBeGreaterThan(0)
      const step: ScenarioStep = scenario.steps[firstConfirmableIdx]
      const titleMatcher = scenario.invariantProfile === 'escalating'
        ? /эскалац/i
        : /кнопк|подтверд|разрешить/i
      const pendingAction = step.tasks.some(
        (t) => t.status === 'pending' && titleMatcher.test(t.title),
      )
      expect(pendingAction).toBe(true)
    })

    it('keeps activeSourceIds a subset of declared sources on every step', () => {
      const sourceIds = new Set(scenario.sources.map((source) => source.id))
      for (const step of scenario.steps) {
        for (const activeId of step.activeSourceIds) {
          expect(sourceIds.has(activeId)).toBe(true)
        }
      }
    })

    it('has a registered scenario tab icon', () => {
      expect(scenarioTabIcon[scenario.id]).toBeDefined()
    })

    it('registers an icon for every zone on every step', () => {
      for (const step of scenario.steps) {
        for (const zoneItem of step.zones) {
          expect(zoneItem.icon).toBeTruthy()
          expect(zoneIcon[zoneItem.icon]).toBeDefined()
        }
      }
    })

    it('maps every source kind to a registered icon', () => {
      for (const source of scenario.sources) {
        expect(sourceKindIcon[source.kind]).toBeDefined()
      }
    })

    it('maps every timeline event type to a registered icon', () => {
      for (const step of scenario.steps) {
        for (const event of step.timeline) {
          expect(timelineEventIcon[event.type]).toBeDefined()
        }
      }
    })

    it('maps every task status to a registered icon', () => {
      for (const step of scenario.steps) {
        for (const task of step.tasks) {
          expect(taskStatusIcon[task.status]).toBeDefined()
        }
      }
    })

    it('references a venue that exists in the venue registry', () => {
      expect(scenario.venueId).toBeTruthy()
      expect(venues[scenario.venueId as string]).toBeDefined()
    })

    it('maps every criticality used in the scenario to a registered icon', () => {
      const usedCriticalities = new Set<Criticality>()
      for (const step of scenario.steps) {
        usedCriticalities.add(step.systemCriticality)
        usedCriticalities.add(step.incident.criticality)
        for (const zoneItem of step.zones) {
          usedCriticalities.add(zoneItem.state)
        }
      }
      for (const c of usedCriticalities) {
        expect(criticalityIcon[c]).toBeDefined()
      }
    })
  },
)
