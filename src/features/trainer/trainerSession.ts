/**
 * Phase 4.d — сессионный стор тренажёра.
 *
 * Живёт как локальный useState внутри TrainerScreen; сюда вынесены чистые
 * функции scoring, чтобы их можно было покрыть юнит-тестами без React.
 *
 * Балл:
 * - Корректное действие (ид есть в `expectedActions`) → +weight
 * - Противорегламентное действие (`prohibited=true` в словаре actions) → −weight/2
 * - Нейтральное действие (в `allowedActions`, но не expected и не prohibited) → 0
 * - Просрочка (`reactionTimeSec > maxDecisionTimeSec`) → штраф пропорционально превышению, но не более weight
 *
 * Возвращаемые `points` — число с плавающей точкой, округляется только на выдаче.
 */

import type {
  ScenarioActionDefinition,
  ScenarioStep,
  ScenarioStepInteractiveMeta,
} from '../../scenarios/types'

export interface TrainerStepResult {
  stepId: string
  chosenActionId: string
  reactionTimeSec: number
  points: number
  verdict: 'correct' | 'neutral' | 'prohibited' | 'skipped'
}

export interface TrainerSessionState {
  scenarioId: string
  startedAt: number
  /** Индекс текущего шага в steps-массиве сценария. */
  currentStepIndex: number
  /** Готовые записи по уже сыгранным шагам. */
  results: TrainerStepResult[]
  /** Метка времени, когда пользователь увидел текущий шаг. Для подсчёта reactionTime. */
  stepEnteredAt: number
}

export const initialTrainerSession = (
  scenarioId: string,
  startedAt: number = Date.now(),
): TrainerSessionState => ({
  scenarioId,
  startedAt,
  currentStepIndex: 0,
  results: [],
  stepEnteredAt: startedAt,
})

export const scoreAction = (
  meta: ScenarioStepInteractiveMeta,
  actionId: string,
  actions: ScenarioActionDefinition[],
  reactionTimeSec: number,
): { points: number; verdict: TrainerStepResult['verdict'] } => {
  const expected = new Set(meta.expectedActions)
  const action = actions.find((a) => a.id === actionId)

  let verdict: TrainerStepResult['verdict']
  let base: number
  if (expected.has(actionId)) {
    verdict = 'correct'
    base = meta.weight
  } else if (action?.prohibited) {
    verdict = 'prohibited'
    base = -meta.weight / 2
  } else {
    verdict = 'neutral'
    base = 0
  }

  // Штраф за просрочку — линейный, ограничен полным весом шага
  let penalty = 0
  if (reactionTimeSec > meta.maxDecisionTimeSec) {
    const overrun = reactionTimeSec - meta.maxDecisionTimeSec
    penalty = Math.min(meta.weight, (overrun / meta.maxDecisionTimeSec) * meta.weight)
  }

  return { points: base - penalty, verdict }
}

export const totalPoints = (results: TrainerStepResult[]): number =>
  results.reduce((acc, r) => acc + r.points, 0)

export const maxPointsForScenario = (steps: ScenarioStep[]): number =>
  steps
    .filter((s) => s.interactiveMeta)
    .reduce((acc, s) => acc + (s.interactiveMeta?.weight ?? 0), 0)

/**
 * Порог допуска по умолчанию — 70% от максимума.
 * В Phase 4.e это становится настраиваемым параметром аттестации.
 */
export const passThreshold = (maxPoints: number): number => Math.round(maxPoints * 0.7)

/**
 * Подбирает ближайший следующий шаг с `interactiveMeta`. Шаги без меты
 * (типично — `baseline`) тренажёр проматывает автоматически, как если бы
 * оператор просто наблюдал вводный кадр.
 */
export const findNextInteractiveStep = (
  steps: ScenarioStep[],
  fromIndex: number,
): number | null => {
  for (let i = fromIndex; i < steps.length; i += 1) {
    if (steps[i].interactiveMeta) return i
  }
  return null
}
