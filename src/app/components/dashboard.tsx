import type { ScenarioId } from '../../scenarios'
import type { PlaybackStoreState } from '../../features/scenario-player/playbackStore'

import {
  ControlRail,
  ForecastPanel,
  IncidentPanel,
  ScenarioHeader,
  ShellBackground,
} from './dashboard-sections'

const LeaderDashboard = ({
  state,
  interactive,
  onScenarioSelect,
  onStep,
  onReset,
}: {
  state: PlaybackStoreState
  interactive: boolean
  onScenarioSelect?: (id: ScenarioId) => void
  onStep?: () => void
  onReset?: () => void
}) => (
  <div className="relative min-h-[100dvh] overflow-hidden bg-[#f3f0e8] text-zinc-950">
    <ShellBackground />
    <div className="relative mx-auto max-w-[1680px] px-4 py-5 md:px-6 lg:px-8" data-testid="operator-shell">
      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ControlRail
          interactive={interactive}
          onReset={onReset}
          onScenarioSelect={onScenarioSelect}
          onStep={onStep}
          state={state}
        />

        <div className="space-y-5">
          <ScenarioHeader state={state} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <IncidentPanel state={state} />
            <ForecastPanel state={state} />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const LoadingDashboard = () => (
  <div className="min-h-[100dvh] bg-[#f3f0e8] px-4 py-6 md:px-6 lg:px-8">
    <div className="mx-auto max-w-[1680px] animate-pulse space-y-5">
      <div className="h-40 rounded-[2rem] border border-white/70 bg-white/80" />
      <div className="h-32 rounded-[2rem] border border-white/70 bg-white/80" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="h-[360px] rounded-[2rem] border border-white/70 bg-white/80" />
        <div className="h-[360px] rounded-[2rem] border border-white/70 bg-white/80" />
      </div>
    </div>
  </div>
)

export const InvalidScenarioState = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-[#f3f0e8] px-4">
    <div className="max-w-xl rounded-[2rem] border border-red-200 bg-white/90 p-8 shadow-[0_24px_64px_-32px_rgba(127,29,29,0.28)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-red-500">Ошибка маршрута</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Экран недоступен</h1>
      <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-zinc-600">
        Откройте основную точку входа демонстрации и повторите переход к экрану.
      </p>
    </div>
  </div>
)

export const OperatorDashboard = ({
  state,
  onScenarioSelect,
  onStep,
  onReset,
}: {
  state: PlaybackStoreState
  onScenarioSelect: (id: ScenarioId) => void
  onStep: () => void
  onReset: () => void
}) => (
  <LeaderDashboard
    interactive
    onReset={onReset}
    onScenarioSelect={onScenarioSelect}
    onStep={onStep}
    state={state}
  />
)

export const DisplayDashboard = ({ state }: { state: PlaybackStoreState }) => <LeaderDashboard interactive={false} state={state} />
