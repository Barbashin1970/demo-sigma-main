import { describe, expect, it } from 'vitest'

import {
  criticalityIcon,
  scenarioTabIcon,
  sourceKindIcon,
  taskStatusIcon,
  timelineEventIcon,
  zoneIcon,
} from '../app/components/icons'
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

    it('raises criticality monotonically from baseline to action', () => {
      const path = scenario.steps.slice(0, 4).map((step) => criticalityRank[step.systemCriticality])
      for (let i = 1; i < path.length; i += 1) {
        expect(path[i]).toBeGreaterThanOrEqual(path[i - 1])
      }
    })

    it('allows the outcome step to stay flat or de-escalate vs the action step', () => {
      const action = criticalityRank[scenario.steps[3].systemCriticality]
      const outcome = criticalityRank[scenario.steps[4].systemCriticality]
      expect(outcome).toBeLessThanOrEqual(action)
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

    it('carries a pending escalation task at the action step', () => {
      const actionStep: ScenarioStep = scenario.steps[3]
      const pendingEscalation = actionStep.tasks.some(
        (t) => t.status === 'pending' && /эскалац/i.test(t.title),
      )
      expect(pendingEscalation).toBe(true)
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
