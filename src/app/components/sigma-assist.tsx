import {
  ArrowClockwise,
  CaretDown,
  ChatCircleText,
  GridFour,
  Robot,
  Sparkle,
  Steps,
} from '@phosphor-icons/react'
import clsx from 'clsx'
import { useState } from 'react'

import type { PlaybackStoreState } from '../../features/scenario-player/playbackStore'

import { Eyebrow, ScenarioProgress } from './dashboard-shared'
import { InfoButton } from './info-button'
import { scenarioReferences } from '../references'

interface SigmaAssistProps {
  state: PlaybackStoreState
  interactive: boolean
  onStep?: () => void
  onReset?: () => void
  onOpenLauncher?: () => void
}

export const SigmaAssist = ({
  state,
  interactive,
  onStep,
  onReset,
  onOpenLauncher,
}: SigmaAssistProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [activeAnswer, setActiveAnswer] = useState<string | null>(null)

  const totalSteps = state.scenario.steps.length
  const stepCanAdvance = state.currentStepIndex < totalSteps - 1

  const prompts = [
    {
      id: 'why',
      label: 'Объясни, что происходит',
      answer:
        state.explainability.causeEffectSummary || state.incident.summary || state.scenario.subtitle,
    },
    {
      id: 'what-if',
      label: 'Что если ничего не делать?',
      answer: state.forecast.withoutSigma,
    },
    {
      id: 'next',
      label: 'Что сделает Sigma дальше?',
      answer: state.forecast.withSigma,
    },
  ]

  if (collapsed) {
    return (
      <button
        aria-label="Открыть Sigma Assist"
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_34px_-12px_rgba(15,23,42,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.6)]"
        data-testid="sigma-assist-fab"
        onClick={() => setCollapsed(false)}
        type="button"
      >
        <span
          aria-hidden
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white"
        >
          <Robot size={16} weight="duotone" />
        </span>
        Sigma Assist
      </button>
    )
  }

  return (
    <aside
      aria-label="Sigma Assist — помощник оператора"
      className="fixed bottom-4 right-4 z-30 flex w-[340px] max-h-[min(82vh,660px)] flex-col overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/95 shadow-[0_32px_72px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl"
      data-testid="sigma-assist"
    >
      <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-[0_8px_20px_-8px_rgba(56,189,248,0.6)]"
          >
            <Robot size={18} weight="duotone" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]">Sigma Assist</p>
            <p className="text-[10px] text-zinc-300">Помощник оператора</p>
          </div>
        </div>
        <button
          aria-label="Свернуть Sigma Assist"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
          onClick={() => setCollapsed(true)}
          type="button"
        >
          <CaretDown size={14} weight="bold" />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div>
          <Eyebrow>Текущий сценарий</Eyebrow>
          <div className="mt-1.5 flex items-start gap-2">
            <p className="flex-1 text-sm font-semibold leading-snug text-zinc-950">
              {state.scenario.title}
            </p>
            <InfoButton
              note={scenarioReferences[state.selectedScenarioId]?.situation}
              testId="info-situation"
            />
          </div>
        </div>

        <ScenarioProgress currentStepIndex={state.currentStepIndex} totalSteps={totalSteps} />

        {interactive && onStep && onReset ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              aria-label="Следующий шаг сценария"
              className={clsx(
                'inline-flex items-center justify-center gap-2 rounded-[0.9rem] border px-3 py-2.5 text-xs font-semibold transition',
                stepCanAdvance
                  ? 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-300 hover:bg-white'
                  : 'cursor-not-allowed border-zinc-200/60 bg-zinc-100/60 text-zinc-400',
              )}
              disabled={!stepCanAdvance}
              onClick={onStep}
              type="button"
            >
              <Steps size={14} weight="bold" /> Шаг
            </button>
            <button
              aria-label="Сбросить сценарий"
              className="inline-flex items-center justify-center gap-2 rounded-[0.9rem] border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-white"
              onClick={onReset}
              type="button"
            >
              <ArrowClockwise size={14} weight="bold" /> Сброс
            </button>
          </div>
        ) : null}

        <div>
          <div className="flex items-center gap-2">
            <Sparkle size={14} weight="duotone" className="text-sky-600" />
            <Eyebrow>Спросить у Sigma</Eyebrow>
          </div>
          <div className="mt-2 space-y-2" data-testid="assist-prompts">
            {prompts.map((prompt) => {
              const isOpen = activeAnswer === prompt.id
              return (
                <button
                  key={prompt.id}
                  aria-expanded={isOpen}
                  aria-label={prompt.label}
                  className={clsx(
                    'w-full rounded-[0.9rem] border px-3 py-2.5 text-left transition',
                    isOpen
                      ? 'border-sky-300 bg-sky-50'
                      : 'border-zinc-200 bg-white hover:border-sky-300 hover:bg-sky-50/70',
                  )}
                  data-testid={`assist-prompt-${prompt.id}`}
                  onClick={() => setActiveAnswer((current) => (current === prompt.id ? null : prompt.id))}
                  type="button"
                >
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                    <ChatCircleText size={13} weight="duotone" className="text-sky-600" />
                    {prompt.label}
                  </span>
                  {isOpen ? (
                    <p className="mt-2 rounded-[0.7rem] bg-white/80 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-700">
                      {prompt.answer}
                    </p>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {onOpenLauncher ? (
          <button
            aria-label="Открыть каталог сценариев"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-zinc-950 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(15,23,42,0.5)] transition hover:bg-zinc-800"
            data-testid="open-launcher"
            onClick={onOpenLauncher}
            type="button"
          >
            <GridFour size={16} weight="duotone" />
            Каталог сценариев
          </button>
        ) : null}
      </div>
    </aside>
  )
}
