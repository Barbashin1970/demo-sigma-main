import clsx from 'clsx'
import { useState, type HTMLAttributes, type ReactNode } from 'react'

import type { ActivePanel } from '../../scenarios'

const panelFocusClass = {
  city: 'border-zinc-950 shadow-[0_0_0_1px_rgba(24,24,27,0.18)]',
  object: 'border-zinc-950 shadow-[0_0_0_1px_rgba(24,24,27,0.18)]',
  tasks: 'border-zinc-950 shadow-[0_0_0_1px_rgba(24,24,27,0.18)]',
  forecast: 'border-zinc-950 shadow-[0_0_0_1px_rgba(24,24,27,0.18)]',
} as const

export const Surface = ({
  className,
  children,
  ...props
}: {
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLElement>) => (
  <section
    className={clsx(
      'rounded-[2rem] border border-white/60 bg-white/78 p-5 shadow-[0_22px_56px_-34px_rgba(15,23,42,0.28)] backdrop-blur-xl md:p-6',
      className,
    )}
    {...props}
  >
    {children}
  </section>
)

export const PanelSurface = ({
  active,
  panel,
  className,
  children,
  ...props
}: {
  active: ActivePanel | null
  panel?: ActivePanel
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLElement>) => (
  <Surface
    className={clsx(panel && active === panel ? panelFocusClass[panel] : undefined, className)}
    data-active={panel && active === panel ? 'true' : 'false'}
    {...props}
  >
    {children}
  </Surface>
)

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-500">{children}</p>
)

export const DetailReveal = ({
  label = 'Подробнее',
  children,
  className,
}: {
  label?: string
  children: ReactNode
  className?: string
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={clsx('mt-3 rounded-[1rem] border border-zinc-200/90 bg-white/70 px-3 py-2', className)}>
      <button
        aria-expanded={open}
        className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? 'Скрыть' : label}
      </button>
      {open ? <div className="mt-3 text-sm leading-relaxed text-zinc-600">{children}</div> : null}
    </div>
  )
}

export const StageCard = ({
  eyebrow,
  title,
  body,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  body?: string
  children?: ReactNode
  className?: string
}) => (
  <article className={clsx('rounded-[1.45rem] border border-zinc-200/90 bg-white/82 px-4 py-4', className)}>
    {eyebrow ? <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{eyebrow}</p> : null}
    <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-950">{title}</h3>
    {body ? <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p> : null}
    {children}
  </article>
)

export const ScenarioProgress = ({
  currentStepIndex,
  totalSteps,
}: {
  currentStepIndex: number
  totalSteps: number
}) => {
  const currentStep = Math.min(currentStepIndex + 1, totalSteps)
  const fillPercent = totalSteps <= 1 ? 100 : (currentStep / totalSteps) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        <span>Развитие ситуации</span>
        <span>{`Этап ${currentStep} из ${totalSteps}`}</span>
      </div>
      <div
        aria-label="Прогресс ситуации"
        aria-valuemax={totalSteps}
        aria-valuemin={1}
        aria-valuenow={currentStep}
        className="relative h-4"
        role="progressbar"
      >
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-zinc-200" />
        <div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-zinc-950 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${fillPercent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={index}
              className={clsx(
                'h-3 w-3 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(24,24,27,0.08)] transition-colors duration-300',
                index <= currentStepIndex ? 'bg-zinc-950' : 'bg-zinc-200',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const MetricTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.2rem] border border-zinc-200/90 bg-white/86 px-4 py-4">
    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</p>
    <p className="mt-3 text-sm font-semibold leading-snug text-zinc-950">{value}</p>
  </div>
)
