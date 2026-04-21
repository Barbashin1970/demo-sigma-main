import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { scenarios } from '../../scenarios'
import { createPlaybackStore } from './playbackStore'

describe('createPlaybackStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('resets the scenario timeline on tab switch and auto-plays when requested', () => {
    const store = createPlaybackStore({ scenarios })

    expect(store.getState().selectedScenarioId).toBe('thermal-incident')
    expect(store.getState().currentStepIndex).toBe(0)
    expect(store.getState().timeline).toHaveLength(1)

    store.nextStep()

    expect(store.getState().currentStepIndex).toBe(1)
    expect(store.getState().timeline.at(-1)?.title).toMatch(/рост температуры/i)

    store.selectScenario('heat-inlet-breach')

    expect(store.getState().selectedScenarioId).toBe('heat-inlet-breach')
    expect(store.getState().currentStepIndex).toBe(0)
    expect(store.getState().timeline).toHaveLength(1)
    expect(store.getState().timeline.at(-1)?.title).toMatch(/городской контур/i)

    store.setRunMode('auto')
    store.start()

    expect(store.getState().runMode).toBe('auto')
    expect(store.getState().playbackStatus).toBe('running')
    expect(store.getState().currentStepIndex).toBe(1)

    vi.runAllTimers()

    expect(store.getState().currentStepIndex).toBe(store.getState().scenario.steps.length - 1)
    expect(store.getState().playbackStatus).toBe('completed')
  })

  it('binds smartphone escalation confirmation to the incident timeline and task tracker', () => {
    const store = createPlaybackStore({ scenarios })

    store.selectScenario('heat-inlet-breach')
    store.nextStep()
    store.nextStep()
    store.nextStep()

    expect(store.getState().incident.escalation.status).toMatch(/ожидает/i)
    expect(store.getState().tasks.some((task) => /эскалац/i.test(task.title) && task.status === 'pending')).toBe(true)

    store.confirmEscalation()

    expect(store.getState().incident.escalation.status).toMatch(/подтверждена/i)
    expect(store.getState().tasks.some((task) => /эскалац/i.test(task.title) && task.status === 'done')).toBe(true)
    expect(store.getState().timeline.at(-1)?.title).toMatch(/эскалация подтверждена/i)
    expect(store.getState().activePanel).toBe('tasks')
  })
})
