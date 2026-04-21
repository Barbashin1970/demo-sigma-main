import { describe, expect, it } from 'vitest'

import type {
  ScenarioActionDefinition,
  ScenarioStep,
  ScenarioStepInteractiveMeta,
} from '../../scenarios/types'

import {
  findNextInteractiveStep,
  maxPointsForScenario,
  passThreshold,
  scoreAction,
} from './trainerSession'

const makeMeta = (
  overrides: Partial<ScenarioStepInteractiveMeta> = {},
): ScenarioStepInteractiveMeta => ({
  expectedActions: ['good'],
  allowedActions: ['good', 'neutral', 'bad'],
  maxDecisionTimeSec: 60,
  weight: 10,
  ...overrides,
})

const actions: ScenarioActionDefinition[] = [
  { id: 'good', label: 'Верное действие' },
  { id: 'neutral', label: 'Нейтральное действие' },
  { id: 'bad', label: 'Противорегламентное действие', prohibited: true },
]

describe('scoreAction (Phase 4.d)', () => {
  it('awards full weight for an expected action within time', () => {
    const { points, verdict } = scoreAction(makeMeta(), 'good', actions, 20)
    expect(verdict).toBe('correct')
    expect(points).toBe(10)
  })

  it('returns 0 for a neutral allowed action', () => {
    const { points, verdict } = scoreAction(makeMeta(), 'neutral', actions, 20)
    expect(verdict).toBe('neutral')
    expect(points).toBe(0)
  })

  it('penalises a prohibited action by half weight', () => {
    const { points, verdict } = scoreAction(makeMeta(), 'bad', actions, 20)
    expect(verdict).toBe('prohibited')
    expect(points).toBe(-5)
  })

  it('applies linear penalty for time overrun but not more than full weight', () => {
    // Overrun by 30 sec on a 60-sec budget → penalty = 30/60 * 10 = 5
    const { points } = scoreAction(makeMeta(), 'good', actions, 90)
    expect(points).toBe(5)
  })

  it('clamps overrun penalty at weight so a correct late action can hit 0', () => {
    const { points } = scoreAction(makeMeta(), 'good', actions, 600)
    expect(points).toBe(0)
  })

  it('stacks prohibited penalty and overrun penalty', () => {
    // Base -5, overrun by 60 sec on 60-sec budget → penalty capped at 10
    // -5 - 10 = -15
    const { points } = scoreAction(makeMeta(), 'bad', actions, 120)
    expect(points).toBe(-15)
  })
})

describe('maxPointsForScenario / passThreshold', () => {
  const makeStep = (
    id: string,
    meta?: ScenarioStepInteractiveMeta,
  ): ScenarioStep => {
    // Только нужные поля; приведение через unknown, чтобы не городить фейковый snapshot
    return {
      id,
      phase: '',
      label: '',
      scene: 'decision',
      narrative: '',
      systemCriticality: 'normal',
      cityContext: { statusLine: '', objects: [], infrastructureIncidents: [] },
      objectCard: {
        id: '',
        name: '',
        type: '',
        address: '',
        cityRole: '',
        summary: '',
        externalDependency: '',
        localizationStatus: '',
        services: [],
        tasksCreated: 0,
      },
      zones: [],
      activeSourceIds: [],
      timeline: [],
      incident: {
        badge: '',
        title: '',
        summary: '',
        criticality: 'normal',
        riskKind: 'operational',
        origin: 'internal',
        affectedZones: [],
        localizationStatus: '',
        services: [],
        escalation: {
          destination: '',
          canConfirm: false,
          pendingStatus: '',
          confirmedStatus: '',
          status: '',
        },
        recommendations: [],
      },
      explainability: {
        criticality: '',
        decisionBasis: '',
        causeEffectSummary: '',
        ruleReference: '',
      },
      tasks: [],
      forecast: {
        title: '',
        timeToWorsen: '',
        withSigma: '',
        withoutSigma: '',
        preventedDamage: '',
        outlook: [],
        impacts: [],
      },
      actuators: {
        integrationStatus: '',
        autoActionStatus: '',
        valves: [],
        lights: [],
        serviceLamp: '',
      },
      sigmaEffect: '',
      interactiveMeta: meta,
    }
  }

  it('sums weights across interactive steps and skips baseline', () => {
    const steps: ScenarioStep[] = [
      makeStep('s0'),
      makeStep('s1', makeMeta({ weight: 5 })),
      makeStep('s2', makeMeta({ weight: 15 })),
      makeStep('s3'),
    ]
    expect(maxPointsForScenario(steps)).toBe(20)
  })

  it('derives pass threshold at 70% of max', () => {
    expect(passThreshold(20)).toBe(14)
    expect(passThreshold(100)).toBe(70)
  })
})

describe('findNextInteractiveStep', () => {
  const steps: ScenarioStep[] = [
    { interactiveMeta: undefined } as unknown as ScenarioStep,
    { interactiveMeta: makeMeta() } as unknown as ScenarioStep,
    { interactiveMeta: undefined } as unknown as ScenarioStep,
    { interactiveMeta: makeMeta() } as unknown as ScenarioStep,
  ]

  it('returns the first index with interactiveMeta starting from given position', () => {
    expect(findNextInteractiveStep(steps, 0)).toBe(1)
    expect(findNextInteractiveStep(steps, 2)).toBe(3)
  })

  it('returns null if no more interactive steps exist', () => {
    expect(findNextInteractiveStep(steps, 4)).toBeNull()
  })
})
