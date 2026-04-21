import { describe, expect, it } from 'vitest'

import type { Criticality, ScenarioId } from './types'
import { scenarios } from './index'

type StepExpectation = {
  step: number
  criticality: Criticality
  narrativeMatch: RegExp
  minTasks: number
  canConfirmEscalation: boolean
  affectedZonesCount?: number
}

const expectations: Record<ScenarioId, { tabLabel: RegExp; riskKind: string; steps: StepExpectation[] }> = {
  'thermal-incident': {
    tabLabel: /опасность пожара/i,
    riskKind: 'thermal',
    steps: [
      { step: 0, criticality: 'normal', narrativeMatch: /штатн/i, minTasks: 1, canConfirmEscalation: false, affectedZonesCount: 0 },
      { step: 1, criticality: 'elevated', narrativeMatch: /перегрев/i, minTasks: 2, canConfirmEscalation: false },
      { step: 2, criticality: 'high', narrativeMatch: /дым/i, minTasks: 3, canConfirmEscalation: true },
      { step: 3, criticality: 'critical', narrativeMatch: /эскалац/i, minTasks: 4, canConfirmEscalation: true },
      { step: 4, criticality: 'high', narrativeMatch: /каскад|удерж|сравнени/i, minTasks: 4, canConfirmEscalation: true },
    ],
  },
  'heat-inlet-breach': {
    tabLabel: /прорыв теплового ввода/i,
    riskKind: 'water',
    steps: [
      { step: 0, criticality: 'normal', narrativeMatch: /штатн/i, minTasks: 1, canConfirmEscalation: false, affectedZonesCount: 0 },
      { step: 1, criticality: 'elevated', narrativeMatch: /вне объекта|теплосет|городск/i, minTasks: 2, canConfirmEscalation: false },
      { step: 2, criticality: 'high', narrativeMatch: /подтвер/i, minTasks: 4, canConfirmEscalation: false },
      { step: 3, criticality: 'high', narrativeMatch: /перекр/i, minTasks: 5, canConfirmEscalation: true },
      { step: 4, criticality: 'watch', narrativeMatch: /прогноз/i, minTasks: 5, canConfirmEscalation: true },
    ],
  },
  'air-quality-co2': {
    tabLabel: /качество воздуха/i,
    riskKind: 'air',
    steps: [
      { step: 0, criticality: 'normal', narrativeMatch: /штатн|спокойн/i, minTasks: 1, canConfirmEscalation: false, affectedZonesCount: 0 },
      { step: 1, criticality: 'elevated', narrativeMatch: /дым|pm/i, minTasks: 2, canConfirmEscalation: false },
      { step: 2, criticality: 'high', narrativeMatch: /дым|маршрут/i, minTasks: 3, canConfirmEscalation: true },
      { step: 3, criticality: 'critical', narrativeMatch: /ограничен|вход/i, minTasks: 4, canConfirmEscalation: true },
      { step: 4, criticality: 'high', narrativeMatch: /ограничен|сравнив|вывед|шлейф/i, minTasks: 4, canConfirmEscalation: true },
    ],
  },
  'dormitory-flood': {
    tabLabel: /протечка в общежитии/i,
    riskKind: 'water',
    steps: [
      { step: 0, criticality: 'normal', narrativeMatch: /ночн.*режим|штатн/i, minTasks: 1, canConfirmEscalation: false, affectedZonesCount: 0 },
      { step: 1, criticality: 'watch', narrativeMatch: /датчик протечки|коллектор/i, minTasks: 2, canConfirmEscalation: false },
      { step: 2, criticality: 'elevated', narrativeMatch: /расход|влажност/i, minTasks: 3, canConfirmEscalation: false },
      { step: 3, criticality: 'high', narrativeMatch: /отсекател|стояк/i, minTasks: 4, canConfirmEscalation: true },
      { step: 4, criticality: 'watch', narrativeMatch: /отсекатель закрыт|без эвакуации|коридор сух/i, minTasks: 4, canConfirmEscalation: true },
    ],
  },
  'lab-access-breach': {
    tabLabel: /проникновение в лабораторию/i,
    riskKind: 'security',
    steps: [
      { step: 0, criticality: 'normal', narrativeMatch: /ночн.*режим|штатн/i, minTasks: 1, canConfirmEscalation: false, affectedZonesCount: 0 },
      { step: 1, criticality: 'watch', narrativeMatch: /силуэт|видеодетектор/i, minTasks: 2, canConfirmEscalation: false },
      { step: 2, criticality: 'elevated', narrativeMatch: /rfid|попытк/i, minTasks: 4, canConfirmEscalation: false },
      { step: 3, criticality: 'high', narrativeMatch: /замок|удержан|росгвард/i, minTasks: 4, canConfirmEscalation: true },
      { step: 4, criticality: 'watch', narrativeMatch: /задержани|периметр/i, minTasks: 4, canConfirmEscalation: true },
    ],
  },
  'access-no-pass': {
    tabLabel: /забытый пропуск/i,
    riskKind: 'security',
    steps: [
      { step: 0, criticality: 'normal', narrativeMatch: /штатн|история|passtap/i, minTasks: 1, canConfirmEscalation: false, affectedZonesCount: 0 },
      { step: 1, criticality: 'elevated', narrativeMatch: /без карты|не получил|faceembedding|видеодетектор|распознала лицо/i, minTasks: 2, canConfirmEscalation: false },
      { step: 2, criticality: 'watch', narrativeMatch: /верифик|confidence|passcardid/i, minTasks: 2, canConfirmEscalation: true },
      { step: 3, criticality: 'watch', narrativeMatch: /охранник нажал|турникет открыл|push|accessevent/i, minTasks: 2, canConfirmEscalation: true },
      { step: 4, criticality: 'normal', narrativeMatch: /аудит|штатн|напоминан/i, minTasks: 2, canConfirmEscalation: false },
    ],
  },
  'access-guarantors': {
    tabLabel: /два поручител/i,
    riskKind: 'security',
    steps: [
      { step: 0, criticality: 'normal', narrativeMatch: /штатн|актив/i, minTasks: 1, canConfirmEscalation: false, affectedZonesCount: 0 },
      { step: 1, criticality: 'elevated', narrativeMatch: /нулев|без карты|истор|вернула ноль|0 совпад/i, minTasks: 2, canConfirmEscalation: false },
      { step: 2, criticality: 'watch', narrativeMatch: /поручител|приложили карты|связк/i, minTasks: 2, canConfirmEscalation: true },
      { step: 3, criticality: 'watch', narrativeMatch: /охранник нажал|турникет открыл|guarantor|accessevent/i, minTasks: 2, canConfirmEscalation: true },
      { step: 4, criticality: 'normal', narrativeMatch: /аудит|штатн|деканат/i, minTasks: 2, canConfirmEscalation: false },
    ],
  },
  'edds-mode-change': {
    tabLabel: /смена режима|едд?с/i,
    riskKind: 'operational',
    steps: [
      { step: 0, criticality: 'normal', narrativeMatch: /повседневн|штатн|журнал смены/i, minTasks: 1, canConfirmEscalation: false, affectedZonesCount: 0 },
      { step: 1, criticality: 'watch', narrativeMatch: /адпи|одиночн|дежурный/i, minTasks: 2, canConfirmEscalation: false },
      { step: 2, criticality: 'elevated', narrativeMatch: /паттерн|второй|метео|тренд/i, minTasks: 3, canConfirmEscalation: false },
      { step: 3, criticality: 'high', narrativeMatch: /доклад|глав|оповеще|кчс/i, minTasks: 4, canConfirmEscalation: true },
      { step: 4, criticality: 'high', narrativeMatch: /повышенн.*готовн|табло|перекл|режим/i, minTasks: 4, canConfirmEscalation: true },
    ],
  },
}

describe('scenario expectation tables', () => {
  it('covers every catalog scenario with an expectation table', () => {
    expect(new Set(Object.keys(expectations))).toEqual(new Set(Object.keys(scenarios)))
  })

  describe.each(Object.entries(expectations))('%s', (scenarioId, expected) => {
    const scenario = scenarios[scenarioId as ScenarioId]

    it('matches tab metadata', () => {
      expect(scenario.tabLabel).toMatch(expected.tabLabel)
      expect(scenario.steps.every((step) => step.incident.riskKind === expected.riskKind)).toBe(true)
    })

    it.each(expected.steps.map((s) => [s.step, s] as const))(
      'step %i matches its expected snapshot',
      (_index, exp) => {
        const step = scenario.steps[exp.step]
        expect(step.systemCriticality).toBe(exp.criticality)
        expect(step.narrative).toMatch(exp.narrativeMatch)
        expect(step.tasks.length).toBeGreaterThanOrEqual(exp.minTasks)
        expect(step.incident.escalation.canConfirm).toBe(exp.canConfirmEscalation)
        if (exp.affectedZonesCount !== undefined) {
          expect(step.incident.affectedZones.length).toBe(exp.affectedZonesCount)
        }
      },
    )
  })
})
