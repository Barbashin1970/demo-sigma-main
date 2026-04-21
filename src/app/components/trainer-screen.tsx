import { ArrowClockwise, CheckCircle, Prohibit, Sparkle, Warning } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  findNextInteractiveStep,
  initialTrainerSession,
  maxPointsForScenario,
  passThreshold,
  scoreAction,
  totalPoints,
  type TrainerSessionState,
} from '../../features/trainer/trainerSession'
import { resolveScenarioId, scenarios } from '../../scenarios'
import type {
  ScenarioActionDefinition,
  ScenarioDefinition,
  ScenarioStep,
} from '../../scenarios/types'

import { Eyebrow, ScenarioProgress, Surface } from './dashboard-shared'
import { IconGlyph } from './icon-glyph'
import { criticalityAccentBorder, criticalityText } from './icons'
import { InvalidScenarioState } from './dashboard'

interface TrainerScreenProps {
  /** Подсказка в UI (текст) — рассчитываем из rationale ожидаемого действия. */
  hintsEnabled?: boolean
}

export const TrainerScreen = ({ hintsEnabled = true }: TrainerScreenProps = {}) => {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const resolved = resolveScenarioId(scenarioId)
  const scenario = resolved ? scenarios[resolved] : null

  if (!scenario) return <InvalidScenarioState />
  return <TrainerRunner hintsEnabled={hintsEnabled} scenario={scenario} />
}

interface TrainerRunnerProps {
  scenario: ScenarioDefinition
  hintsEnabled: boolean
}

const TrainerRunner = ({ scenario, hintsEnabled }: TrainerRunnerProps) => {
  const navigate = useNavigate()
  const initialIndex = useMemo(
    () => findNextInteractiveStep(scenario.steps, 0) ?? scenario.steps.length,
    [scenario],
  )
  const [session, setSession] = useState<TrainerSessionState>(() => ({
    ...initialTrainerSession(scenario.id),
    currentStepIndex: initialIndex,
    stepEnteredAt: Date.now(),
  }))
  const [hintShown, setHintShown] = useState(false)

  const actions = scenario.actions ?? []
  const maxPoints = useMemo(() => maxPointsForScenario(scenario.steps), [scenario])
  const threshold = passThreshold(maxPoints)
  const score = totalPoints(session.results)

  const step: ScenarioStep | null = scenario.steps[session.currentStepIndex] ?? null
  const done = step === null || !step.interactiveMeta

  const handleAction = (actionId: string) => {
    if (!step?.interactiveMeta) return
    const now = Date.now()
    const reactionTimeSec = (now - session.stepEnteredAt) / 1000
    const { points, verdict } = scoreAction(
      step.interactiveMeta,
      actionId,
      actions,
      reactionTimeSec,
    )
    const nextIndex =
      findNextInteractiveStep(scenario.steps, session.currentStepIndex + 1) ??
      scenario.steps.length

    setSession({
      ...session,
      currentStepIndex: nextIndex,
      results: [
        ...session.results,
        {
          stepId: step.id,
          chosenActionId: actionId,
          reactionTimeSec,
          points,
          verdict,
        },
      ],
      stepEnteredAt: now,
    })
    setHintShown(false)
  }

  const handleReset = () => {
    setSession({
      ...initialTrainerSession(scenario.id),
      currentStepIndex: initialIndex,
      stepEnteredAt: Date.now(),
    })
    setHintShown(false)
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#f3f0e8] px-4 py-5 text-zinc-950 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] space-y-5" data-testid="trainer-shell">
        <header className="flex flex-col gap-3 rounded-[2rem] border border-zinc-200/80 bg-white/90 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              Тренажёр · {scenario.scenarioNumber}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
              {scenario.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">{scenario.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-[1rem] border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              <p className="font-mono uppercase tracking-[0.22em]">Балл</p>
              <p className="text-base font-semibold">
                {Math.round(score)} / {maxPoints}
              </p>
              <p className="text-[10px] text-sky-700">порог {threshold}</p>
            </div>
            <button
              aria-label="Сбросить сессию и начать заново"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-zinc-400"
              onClick={handleReset}
              type="button"
            >
              <ArrowClockwise size={14} weight="bold" /> Заново
            </button>
            <button
              aria-label="Выйти в оператор-режим"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-950 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
              onClick={() => navigate(`/operator/${scenario.id}`)}
              type="button"
            >
              Выйти
            </button>
          </div>
        </header>

        <ScenarioProgress
          currentStepIndex={Math.min(session.currentStepIndex, scenario.steps.length - 1)}
          totalSteps={scenario.steps.length}
        />

        {done ? (
          <TrainerSummary
            actions={actions}
            maxPoints={maxPoints}
            scenario={scenario}
            session={session}
            threshold={threshold}
            onReset={handleReset}
          />
        ) : (
          <StepPlay
            actions={actions}
            hintShown={hintShown}
            hintsEnabled={hintsEnabled}
            onAction={handleAction}
            onShowHint={() => setHintShown(true)}
            step={step}
          />
        )}
      </div>
    </div>
  )
}

const StepPlay = ({
  step,
  actions,
  onAction,
  hintsEnabled,
  hintShown,
  onShowHint,
}: {
  step: ScenarioStep
  actions: ScenarioActionDefinition[]
  onAction: (id: string) => void
  hintsEnabled: boolean
  hintShown: boolean
  onShowHint: () => void
}) => {
  const meta = step.interactiveMeta!
  const allowedActions = actions.filter((a) => meta.allowedActions.includes(a.id))
  const expectedAction = actions.find((a) => meta.expectedActions.includes(a.id))
  const hintText = expectedAction?.rationale ?? expectedAction?.label

  return (
    <Surface
      accent={step.systemCriticality}
      className={clsx('space-y-5', criticalityAccentBorder[step.systemCriticality])}
      data-testid="trainer-step"
    >
      <div>
        <Eyebrow>
          Этап {step.phase} · {step.label}
        </Eyebrow>
        <p
          className={clsx(
            'mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
            criticalityText[step.systemCriticality],
          )}
        >
          {step.incident.title}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700">{step.narrative}</p>
      </div>

      <div>
        <Eyebrow>Ваше решение</Eyebrow>
        <p className="mt-1 text-xs text-zinc-500">
          Норматив реакции: {meta.maxDecisionTimeSec} сек. Вес шага: {meta.weight}.
        </p>
        <div className="mt-3 grid gap-2" data-testid="trainer-actions">
          {allowedActions.map((action) => (
            <button
              key={action.id}
              className="flex items-start gap-3 rounded-[1rem] border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-400 hover:bg-zinc-50"
              data-testid={`trainer-action-${action.id}`}
              onClick={() => onAction(action.id)}
              type="button"
            >
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <Sparkle size={14} weight="duotone" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-zinc-950">{action.label}</span>
                {action.service ? (
                  <span className="mt-0.5 block text-[11px] text-zinc-500">
                    Исполняет: {action.service}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </div>

      {hintsEnabled ? (
        <div>
          {hintShown ? (
            <div className="rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
              <p className="font-mono uppercase tracking-[0.22em] text-amber-700">Подсказка</p>
              <p className="mt-1">{hintText}</p>
              {meta.clauseRef ? (
                <p className="mt-1 text-[10px] text-amber-700">{meta.clauseRef}</p>
              ) : null}
            </div>
          ) : (
            <button
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:border-amber-400"
              data-testid="trainer-hint"
              onClick={onShowHint}
              type="button"
            >
              <Warning size={14} weight="duotone" />
              Подсказка
            </button>
          )}
        </div>
      ) : null}
    </Surface>
  )
}

const verdictCopy: Record<
  'correct' | 'neutral' | 'prohibited' | 'skipped',
  { label: string; icon: typeof CheckCircle; tone: string }
> = {
  correct: { label: 'Корректно', icon: CheckCircle, tone: 'text-emerald-700' },
  neutral: { label: 'Нейтрально', icon: Sparkle, tone: 'text-sky-700' },
  prohibited: { label: 'Противорегламентно', icon: Prohibit, tone: 'text-rose-700' },
  skipped: { label: 'Пропущено', icon: Warning, tone: 'text-amber-700' },
}

const TrainerSummary = ({
  scenario,
  session,
  actions,
  maxPoints,
  threshold,
  onReset,
}: {
  scenario: ScenarioDefinition
  session: TrainerSessionState
  actions: ScenarioActionDefinition[]
  maxPoints: number
  threshold: number
  onReset: () => void
}) => {
  const score = Math.round(totalPoints(session.results))
  const passed = score >= threshold

  return (
    <Surface className="space-y-5" data-testid="trainer-summary">
      <header>
        <Eyebrow>Аттестация</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {passed ? 'Порог допуска пройден' : 'Ниже порога допуска'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Набрано {score} из {maxPoints} баллов. Порог — {threshold}. Разбор по шагам ниже.
        </p>
      </header>

      <ol className="space-y-2">
        {session.results.map((result) => {
          const step = scenario.steps.find((s) => s.id === result.stepId)
          const action = actions.find((a) => a.id === result.chosenActionId)
          const verdict = verdictCopy[result.verdict]
          const VerdictIcon = verdict.icon
          return (
            <li
              key={result.stepId}
              className="rounded-[1rem] border border-zinc-200 bg-white px-4 py-3"
              data-testid={`trainer-summary-row-${result.stepId}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {step?.phase ?? '—'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">
                    {action?.label ?? result.chosenActionId}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Реакция: {result.reactionTimeSec.toFixed(1)} сек
                    {step?.interactiveMeta
                      ? ` · норматив ${step.interactiveMeta.maxDecisionTimeSec} сек · вес ${step.interactiveMeta.weight}`
                      : ''}
                    {step?.interactiveMeta?.clauseRef
                      ? ` · ${step.interactiveMeta.clauseRef}`
                      : ''}
                  </p>
                </div>
                <div className={clsx('text-right', verdict.tone)}>
                  <p className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em]">
                    <IconGlyph of={VerdictIcon} size={12} weight="duotone" />
                    {verdict.label}
                  </p>
                  <p className="text-base font-semibold">
                    {result.points >= 0 ? '+' : ''}
                    {result.points.toFixed(1)}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-full border border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          onClick={onReset}
          type="button"
        >
          <ArrowClockwise size={14} weight="bold" />
          Пройти ещё раз
        </button>
      </div>
    </Surface>
  )
}
