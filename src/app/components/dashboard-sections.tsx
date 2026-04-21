import {
  ArrowClockwise,
  Buildings,
  ChartLineUp,
  GridFour,
  Monitor,
  ShieldCheck,
  Steps,
} from '@phosphor-icons/react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

import type {
  Criticality,
  PlaybackStatus,
  RiskKind,
  SignalSource,
} from '../../scenarios'
import type { PlaybackStoreState } from '../../features/scenario-player/playbackStore'
import { resolveFocus } from '../focus-resolver'
import { scenarioReferences } from '../references'
import { storyboardSceneCopy } from '../storyboard'
import {
  DetailReveal,
  Eyebrow,
  MetricTile,
  PanelSurface,
  ScenarioProgress,
  StageCard,
  Surface,
} from './dashboard-shared'
import { IconGlyph } from './icon-glyph'
import { InfoButton } from './info-button'
import {
  criticalityAccentBorder,
  criticalityIcon,
  criticalityText,
  incidentOriginIcon,
  riskIcon,
  scenarioTabIcon,
  serviceIcon,
  sourceKindIcon,
  taskStatusIcon,
  timelineEventIcon,
  zoneIcon,
} from './icons'

const criticalityLabel: Record<Criticality, string> = {
  normal: 'Норма',
  watch: 'Наблюдение',
  elevated: 'Повышено',
  high: 'Высокий риск',
  critical: 'Критично',
}

const playbackLabel: Record<PlaybackStatus, string> = {
  idle: 'Готово',
  running: 'Ситуация развивается',
  paused: 'Развитие приостановлено',
  completed: 'Развитие завершено',
}

const taskStatusLabel = {
  pending: 'Ожидает подтверждения',
  'in-progress': 'В работе',
  done: 'Выполнено',
} as const

const sourceKindLabel: Record<SignalSource['kind'], string> = {
  sensor: 'датчик',
  external: 'внешний источник',
  manual: 'подтверждение',
  virtual: 'расчетный источник',
  actuator: 'исполнительное устройство',
  'video-analytic': 'видеодетектор',
}

const riskTheme: Record<
  RiskKind,
  {
    chip: string
    soft: string
    border: string
    dot: string
    heroGradient: string
    heroIconText: string
  }
> = {
  thermal: {
    chip: 'bg-[#f8ede8] text-[#a64a1f]',
    soft: 'bg-[#fff5ef]',
    border: 'border-[#f0d5c9]',
    dot: 'bg-[#df6d36]',
    heroGradient: 'bg-gradient-to-br from-[#fde4d4] to-[#f0d5c9]',
    heroIconText: 'text-[#a64a1f]',
  },
  water: {
    chip: 'bg-[#e7f0f7] text-[#245b86]',
    soft: 'bg-[#f2f8fd]',
    border: 'border-[#d5e4f0]',
    dot: 'bg-[#3b82c4]',
    heroGradient: 'bg-gradient-to-br from-[#dbeaf6] to-[#c5dced]',
    heroIconText: 'text-[#245b86]',
  },
  air: {
    chip: 'bg-[#e8f6f4] text-[#0f6d68]',
    soft: 'bg-[#f1fbfa]',
    border: 'border-[#cfeae6]',
    dot: 'bg-[#1aa39a]',
    heroGradient: 'bg-gradient-to-br from-[#d9f0ed] to-[#bfe3dd]',
    heroIconText: 'text-[#0f6d68]',
  },
  security: {
    chip: 'bg-[#eeecf7] text-[#4c4a7a]',
    soft: 'bg-[#f6f5fb]',
    border: 'border-[#ddd9ee]',
    dot: 'bg-[#6c63a8]',
    heroGradient: 'bg-gradient-to-br from-[#e3def2] to-[#cec5e6]',
    heroIconText: 'text-[#4c4a7a]',
  },
  operational: {
    chip: 'bg-[#eef1f5] text-[#384250]',
    soft: 'bg-[#f6f8fa]',
    border: 'border-[#dde3ea]',
    dot: 'bg-[#6b7684]',
    heroGradient: 'bg-gradient-to-br from-[#e6ebf1] to-[#ccd5de]',
    heroIconText: 'text-[#384250]',
  },
}

const riskChipIcon = (riskKind: RiskKind) => (
  <IconGlyph of={riskIcon[riskKind]} size={16} weight="duotone" />
)

const presentText = (value: string) =>
  value
    .replaceAll('IAQ-мониторинг', 'контроль качества воздуха')
    .replaceAll('IAQ-апдейт', 'сводка по качеству воздуха')
    .replaceAll('IAQ-сервису', 'службе оценки воздуха')
    .replaceAll('IAQ-сервис', 'служба оценки воздуха')
    .replaceAll('IAQ-контур', 'контур качества воздуха')
    .replaceAll('IAQ-сигнал', 'сигнал качества воздуха')
    .replaceAll('IAQ-риск', 'риск по качеству воздуха')
    .replaceAll('IAQ-сценарий', 'ситуация по качеству воздуха')
    .replaceAll('CO₂-датчика', 'датчика углекислого газа')
    .replaceAll('CO₂-датчик', 'датчик углекислого газа')
    .replaceAll('virtual/integration source', 'внешний расчетный источник')
    .replaceAll('virtual/integration signal', 'внешний расчетный сигнал')
    .replaceAll('manual/presence', 'ручного подтверждения и признаков присутствия')
    .replaceAll('Sigma Virtual IAQ Feed', 'городской канал качества воздуха')
    .replaceAll('Sigma Correlation Engine', 'аналитический контур')
    .replaceAll('Sigma Task Tracker', 'контур задач')
    .replaceAll('Sigma Forecast', 'контур прогноза')
    .replaceAll('Sigma Automation', 'автоматический контур')
    .replaceAll('SONOFF SNZB-02DR2', 'датчик температуры и влажности')
    .replaceAll('SONOFF SNZB-05P', 'датчик протечки')
    .replaceAll('SONOFF SNZB-06P', 'датчик присутствия')
    .replaceAll('SONOFF SNZB-01P', 'кнопка сотрудника')
    .replaceAll('HEIMAN Zigbee Smoke', 'дымовой извещатель')
    .replaceAll('HEIMAN + SNZB-02DR2', 'дымовой и температурный датчики')
    .replaceAll('WLDC200', 'кабель протечки')
    .replaceAll('E27 RGB Zigbee', 'сигнальная лампа')
    .replaceAll('SONOFF iHost', 'локальный сервер объекта')
    .replaceAll('iHost', 'локальный сервер')
    .replaceAll('DN15', '')
    .replaceAll('smart valve', 'умный кран')
    .replaceAll('IAQ', 'качество воздуха')
    .replaceAll('CO₂', 'углекислый газ')
    .replaceAll('presence', 'присутствие')
    .replaceAll('task tracker', 'контур задач')
    .replaceAll('signal', 'сигнал')
    .replaceAll('source', 'источник')
    .replaceAll('UI', 'экране')
    .replaceAll('t°', 'температура')
    .replaceAll('virtual/integration', 'внешний расчетный')
    .replaceAll('human context', 'контекст людей')
    .replaceAll('Presence', 'Присутствие')
    .replaceAll('Сценарии', 'Обстановка')
    .replaceAll('Сценарий', 'Ситуация')
    .replaceAll('сценарий', 'ситуация')
    .replaceAll('  ', ' ')

const StatusPill = ({
  criticality,
  status,
}: {
  criticality: Criticality
  status: PlaybackStatus
}) => (
  <div
    aria-label={`Критичность: ${criticalityLabel[criticality]}`}
    className="inline-flex items-center gap-3 rounded-full border border-zinc-200/90 bg-white/90 px-4 py-3 text-sm"
    role="status"
  >
    <span className={clsx('inline-flex h-6 w-6 items-center justify-center rounded-full', criticalityText[criticality])}>
      <IconGlyph of={criticalityIcon[criticality]} size={18} weight="fill" />
    </span>
    <div>
      <p className="font-semibold">{criticalityLabel[criticality]}</p>
      <p className="text-xs text-zinc-500">{playbackLabel[status]}</p>
    </div>
  </div>
)

const TransportButton = ({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
}) => (
  <button
    aria-label={label}
    className={clsx(
      'inline-flex min-w-0 flex-col items-center justify-center gap-2 rounded-[1rem] border px-3 py-3 text-center text-[11px] font-medium leading-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
      disabled
        ? 'cursor-not-allowed border-zinc-200/70 bg-zinc-100/60 text-zinc-400'
        : 'border-zinc-200/90 bg-zinc-50/90 text-zinc-700 hover:border-zinc-300/80 hover:bg-white',
    )}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {icon}
    <span>{label}</span>
  </button>
)

const TransportControls = ({
  onStep,
  onReset,
  currentStepIndex,
  totalSteps,
}: {
  onStep: () => void
  onReset: () => void
  currentStepIndex: number
  totalSteps: number
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-2" data-testid="transport-bar">
      <TransportButton disabled={currentStepIndex >= totalSteps - 1} icon={<Steps size={18} weight="bold" />} label="Шаг" onClick={onStep} />
      <TransportButton icon={<ArrowClockwise size={18} weight="bold" />} label="Сброс" onClick={onReset} />
    </div>

    <ScenarioProgress currentStepIndex={currentStepIndex} totalSteps={totalSteps} />
  </div>
)

export const ControlRail = ({
  state,
  interactive,
  onStep,
  onReset,
  onOpenLauncher,
}: {
  state: PlaybackStoreState
  interactive: boolean
  onStep?: () => void
  onReset?: () => void
  onOpenLauncher?: () => void
}) => (
  <Surface className="xl:sticky xl:top-4" data-testid="control-rail">
    <div className="space-y-6">
      <div>
        <p className="text-4xl font-semibold tracking-tight text-zinc-950">СИГМА</p>
        <p className="mt-2 text-sm text-zinc-600">{presentText(state.scenario.title)}</p>
      </div>

      {interactive && onStep && onReset ? (
        <TransportControls
          currentStepIndex={state.currentStepIndex}
          onReset={onReset}
          onStep={onStep}
          totalSteps={state.scenario.steps.length}
        />
      ) : (
        <ScenarioProgress currentStepIndex={state.currentStepIndex} totalSteps={state.scenario.steps.length} />
      )}

      <div>
        <div className="flex items-center gap-2">
          <Eyebrow>Обстановка</Eyebrow>
          <InfoButton
            note={scenarioReferences[state.selectedScenarioId]?.situation}
            testId="info-situation"
          />
        </div>
        <p className="mt-2 text-sm leading-snug text-zinc-600">
          Текущий: {presentText(state.scenario.tabLabel)}
        </p>
        {onOpenLauncher ? (
          <button
            aria-label="Открыть каталог сценариев"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] border border-zinc-950 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-50 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.5)] transition hover:bg-zinc-800"
            data-testid="open-launcher"
            onClick={onOpenLauncher}
            type="button"
          >
            <GridFour size={18} weight="duotone" />
            Каталог сценариев
          </button>
        ) : null}
      </div>

      <div>
        <Eyebrow>Зоны объекта</Eyebrow>
        <div className="mt-4 space-y-3">
          {state.zones.map((zoneItem) => {
            const ZoneIcon = zoneIcon[zoneItem.icon]
            const focused = state.currentStep.scene === 'signal' && zoneItem.state !== 'normal'
            return (
              <article
                key={zoneItem.id}
                className={clsx(
                  'rounded-[1.2rem] border bg-zinc-50/80 px-4 py-4',
                  focused
                    ? clsx('border-l-4 pl-[13px]', criticalityAccentBorder[zoneItem.state])
                    : 'border-zinc-200/90',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.75rem] bg-white text-zinc-700"
                    >
                      <IconGlyph of={ZoneIcon} size={16} weight="duotone" />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{zoneItem.label}</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-950">{presentText(zoneItem.semantic)}</p>
                    </div>
                  </div>
                  <span
                    aria-label={`Состояние зоны: ${criticalityLabel[zoneItem.state]}`}
                    className={clsx('mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full', criticalityText[zoneItem.state])}
                    role="status"
                  >
                    <IconGlyph of={criticalityIcon[zoneItem.state]} size={14} weight="fill" />
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-600">{presentText(zoneItem.statusLine)}</p>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  </Surface>
)

export const CityOverviewPanel = ({ state }: { state: PlaybackStoreState }) => {
  const selectedObject = state.cityContext.objects.find((item) => item.selected) ?? state.cityContext.objects[0]
  const otherObjects = state.cityContext.objects.filter((item) => item.id !== selectedObject?.id)
  const primaryIncident = state.cityContext.infrastructureIncidents[0]
  const secondaryIncidents = state.cityContext.infrastructureIncidents.slice(1)

  return (
    <PanelSurface active={state.activePanel} data-testid="city-summary" panel="city">
      <Eyebrow>Объект под риском</Eyebrow>
      {selectedObject ? (
        <StageCard body={presentText(selectedObject.status)} className="mt-4 border-zinc-950 bg-zinc-950 text-zinc-50" eyebrow={presentText(selectedObject.type)} title={presentText(selectedObject.name)}>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-1">
              <Buildings size={12} weight="duotone" />
              {selectedObject.district}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-1">
              <ChartLineUp size={12} weight="duotone" />
              {selectedObject.taskCount} задач
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-1">
              <ShieldCheck size={12} weight="duotone" />
              {selectedObject.services.length} службы
            </span>
          </div>
          {primaryIncident ? (
            <div className="mt-4 rounded-[1rem] border border-white/15 bg-white/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-300">Внешний фактор</p>
              <p className="mt-2 text-sm font-semibold text-zinc-50">{presentText(primaryIncident.title)}</p>
              <p className="mt-1 text-sm text-zinc-200">{presentText(primaryIncident.source)}</p>
            </div>
          ) : null}
          <DetailReveal className="border-white/15 bg-white/10 text-zinc-100" label="Подробнее по городу">
            <p>{presentText(state.cityContext.statusLine)}</p>
            <p className="mt-2">{selectedObject.services.join(' / ')}</p>
            {otherObjects.length > 0 ? (
              <div className="mt-3 space-y-2">
                {otherObjects.map((item) => (
                  <p key={item.id}>
                    {presentText(item.name)}: {presentText(item.incidentLabel)}, {criticalityLabel[item.risk]}
                  </p>
                ))}
              </div>
            ) : null}
            {primaryIncident ? <p className="mt-3">{presentText(primaryIncident.summary)}</p> : null}
            {secondaryIncidents.length > 0 ? (
              <div className="mt-3 space-y-2">
                {secondaryIncidents.map((incident) => (
                  <p key={incident.id}>
                    {presentText(incident.title)}: {presentText(incident.summary)}
                  </p>
                ))}
              </div>
            ) : null}
          </DetailReveal>
        </StageCard>
      ) : null}
    </PanelSurface>
  )
}

export const ObjectCardPanel = ({ state }: { state: PlaybackStoreState }) => {
  const focus = resolveFocus(state.currentStep.scene, state.criticality)
  const accent = focus.panel === 'object' ? focus.accent : null
  const theme = riskTheme[state.incident.riskKind]
  const TabIcon = scenarioTabIcon[state.selectedScenarioId]
  const activeSource = state.activeSources[0]
  const ActiveSourceIcon = activeSource ? sourceKindIcon[activeSource.kind] : null

  return (
    <PanelSurface accent={accent} active={state.activePanel} data-testid="object-summary" panel="object">
      <Eyebrow>Карточка объекта</Eyebrow>
      <div
        aria-hidden
        className={clsx(
          'mt-4 flex h-24 items-center justify-between overflow-hidden rounded-[1.25rem] px-6',
          theme.heroGradient,
        )}
      >
        <p className={clsx('text-xs font-medium uppercase tracking-[0.24em]', theme.heroIconText)}>
          {presentText(state.objectCard.cityRole).slice(0, 64)}
        </p>
        <IconGlyph of={TabIcon} size={56} weight="duotone" className={clsx('opacity-80', theme.heroIconText)} />
      </div>
      <StageCard
        body={presentText(state.objectCard.localizationStatus)}
        className="mt-4"
        eyebrow={presentText(state.objectCard.type)}
        title={presentText(state.objectCard.name)}
      >
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricTile label="Роль" value="Критический объект" />
        <MetricTile label="Службы" value={String(state.objectCard.services.length)} />
        <MetricTile label="Задачи" value={String(state.objectCard.tasksCreated)} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {state.zones.map((zoneItem) => {
          const ZoneIcon = zoneIcon[zoneItem.icon]
          return (
            <div key={zoneItem.id} className="rounded-[1rem] border border-zinc-200/80 bg-zinc-50/75 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.6rem] bg-white text-zinc-700"
                  >
                    <IconGlyph of={ZoneIcon} size={14} weight="duotone" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{zoneItem.label}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-950">{presentText(zoneItem.semantic)}</p>
                  </div>
                </div>
                <span
                  aria-label={`Состояние зоны: ${criticalityLabel[zoneItem.state]}`}
                  className={clsx('mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full', criticalityText[zoneItem.state])}
                  role="status"
                >
                  <IconGlyph of={criticalityIcon[zoneItem.state]} size={13} weight="fill" />
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">{presentText(zoneItem.statusLine)}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-[1rem] border border-zinc-200/80 bg-zinc-50/75 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Активный сигнал</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              {ActiveSourceIcon ? (
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.6rem] bg-white text-zinc-700"
                >
                  <IconGlyph of={ActiveSourceIcon} size={14} weight="duotone" />
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950">
                  {activeSource ? presentText(activeSource.label) : 'Нет активных источников'}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {activeSource ? sourceKindLabel[activeSource.kind] : 'наблюдение'}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-right text-xs text-zinc-600">
              {activeSource ? presentText(activeSource.metric) : 'Сигналы в норме'}
            </span>
          </div>
        </div>
        <div className="rounded-[1rem] border border-zinc-200/80 bg-zinc-50/75 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Контур реагирования</p>
          <p className="mt-2 text-sm font-semibold text-zinc-950">{presentText(state.actuators.autoActionStatus)}</p>
        </div>
      </div>

      <DetailReveal label="Подробнее по объекту">
        <p>{presentText(state.objectCard.summary)}</p>
        <p className="mt-2">{presentText(state.objectCard.cityRole)}</p>
        <p className="mt-2">{presentText(state.objectCard.externalDependency)}</p>
        {state.activeSources.map((signalSource) => (
          <p key={signalSource.id} className="mt-2">
            {presentText(signalSource.label)}: {presentText(signalSource.deviceModel)}, {presentText(signalSource.location)}.{' '}
            {presentText(signalSource.description)}
          </p>
        ))}
        {state.zones.map((zone) => (
          <p key={zone.id} className="mt-2">
            {zone.label}: {presentText(zone.sensorLine)}. {presentText(zone.operatorNote)}
          </p>
        ))}
        <p className="mt-2">{presentText(state.actuators.integrationStatus)}</p>
        <p className="mt-2">{presentText(state.actuators.serviceLamp)}</p>
      </DetailReveal>
    </StageCard>
    </PanelSurface>
  )
}

const OriginLabel: Record<'external' | 'internal' | 'hybrid', string> = {
  external: 'Внешняя',
  internal: 'Внутренняя',
  hybrid: 'Гибридная',
}

export const IncidentPanel = ({ state }: { state: PlaybackStoreState }) => {
  const theme = riskTheme[state.incident.riskKind]
  const visibleRecommendations = state.incident.recommendations.slice(0, 2)
  const completedTasks = state.tasks.filter((item) => item.status === 'done').length
  const keyTask = state.tasks.find((item) => item.status !== 'done') ?? state.tasks[0]
  const KeyTaskIcon = keyTask ? taskStatusIcon[keyTask.status] : null
  const OriginIcon = incidentOriginIcon[state.incident.origin]
  const focus = resolveFocus(state.currentStep.scene, state.criticality)
  const accent = focus.panel === 'incident' ? focus.accent : null

  return (
    <Surface
      accent={accent}
      className={clsx('flex h-full flex-col', theme.soft, theme.border)}
      data-testid="decision-summary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Eyebrow>Рекомендуемые действия</Eyebrow>
            <InfoButton
              note={scenarioReferences[state.selectedScenarioId]?.actions}
              testId="info-actions"
            />
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Действия руководителя</h2>
        </div>
        <span
          className={clsx(
            'inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium',
            theme.chip,
          )}
        >
          {riskChipIcon(state.incident.riskKind)}
          {visibleRecommendations.length} действия
        </span>
      </div>
      <div className="mt-5 flex flex-1 flex-col gap-4">
        <StageCard
          body={presentText(state.incident.title)}
          className="border-white/70 bg-white/76"
          eyebrow="Что происходит"
          title={criticalityLabel[state.incident.criticality]}
        >
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-700">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/90 px-2 py-1',
                criticalityText[state.incident.criticality],
              )}
            >
              <IconGlyph of={criticalityIcon[state.incident.criticality]} size={12} weight="fill" />
              {criticalityLabel[state.incident.criticality]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/86 px-2 py-1">
              <IconGlyph of={OriginIcon} size={12} weight="duotone" />
              {OriginLabel[state.incident.origin]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/86 px-2 py-1">
              <IconGlyph of={ShieldCheck} size={12} weight="duotone" />
              {state.incident.services.length} службы
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
            {state.incident.services.map((service) => (
              <span
                key={service}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/70 bg-white/70 px-2 py-1"
              >
                <IconGlyph of={serviceIcon(service)} size={12} weight="duotone" />
                {presentText(service)}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">{presentText(state.incident.localizationStatus)}</p>
        </StageCard>

        <StageCard
          body={visibleRecommendations[0] ? presentText(visibleRecommendations[0].title) : 'Меры появятся по мере развития ситуации'}
          className="border-white/70 bg-white/76"
          eyebrow="Что делать сейчас"
          title={`${visibleRecommendations.length} действия`}
        >
          {visibleRecommendations.length > 1 ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{presentText(visibleRecommendations[1].title)}</p>
          ) : null}
        </StageCard>

        <StageCard
          body={`${completedTasks} из ${state.tasks.length} задач завершено`}
          className="border-white/70 bg-white/76"
          eyebrow="Исполнение служб"
          title={keyTask ? presentText(keyTask.title) : 'Ключевая задача не назначена'}
        >
          {keyTask && KeyTaskIcon ? (
            <p className="mt-2 flex items-center gap-2 text-sm leading-relaxed text-zinc-600">
              <IconGlyph
                of={KeyTaskIcon}
                size={14}
                weight="duotone"
                className={clsx(
                  keyTask.status === 'in-progress' ? 'animate-spin text-amber-500' : undefined,
                  keyTask.status === 'done' ? 'text-emerald-500' : undefined,
                  keyTask.status === 'pending' ? 'text-zinc-500' : undefined,
                )}
              />
              {taskStatusLabel[keyTask.status]} · {presentText(keyTask.service)}
            </p>
          ) : null}
        </StageCard>

        <DetailReveal className="mt-auto" label="Подробности решения">
          <p>{presentText(state.incident.summary)}</p>
          <p className="mt-3">{presentText(state.explainability.decisionBasis)}</p>
          <p className="mt-2">{presentText(state.explainability.causeEffectSummary)}</p>
          <p className="mt-2">{presentText(state.incident.escalation.destination)}</p>
          <ul className="mt-3 space-y-2">
            {state.incident.recommendations.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-600">
                <IconGlyph of={timelineEventIcon.decision} size={14} weight="duotone" className="mt-0.5 shrink-0 text-zinc-500" />
                <span>
                  {presentText(item.title)}: {presentText(item.detail)} Основание: {presentText(item.basis)}
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-3 space-y-2">
            {state.tasks.map((item) => {
              const ItemIcon = taskStatusIcon[item.status]
              return (
                <li key={item.id} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-600">
                  <IconGlyph
                    of={ItemIcon}
                    size={14}
                    weight="duotone"
                    className={clsx(
                      'mt-0.5 shrink-0',
                      item.status === 'in-progress' ? 'animate-spin text-amber-500' : undefined,
                      item.status === 'done' ? 'text-emerald-500' : undefined,
                      item.status === 'pending' ? 'text-zinc-500' : undefined,
                    )}
                  />
                  <span>
                    {presentText(item.title)}: {taskStatusLabel[item.status]}, {presentText(item.dueLabel)}. {presentText(item.note)}
                  </span>
                </li>
              )
            })}
          </ul>
        </DetailReveal>
      </div>
    </Surface>
  )
}

export const ForecastPanel = ({ state }: { state: PlaybackStoreState }) => {
  const latestEvent = state.timeline.at(-1)
  const focus = resolveFocus(state.currentStep.scene, state.criticality)
  const accent = focus.panel === 'forecast' ? focus.accent : null
  const LatestIcon = latestEvent ? timelineEventIcon[latestEvent.type] : timelineEventIcon.forecast

  return (
    <PanelSurface accent={accent} active={state.activePanel} className="flex h-full flex-col" data-testid="forecast-summary" panel="forecast">
      <div className="flex items-center gap-2">
        <IconGlyph of={timelineEventIcon.forecast} size={14} weight="duotone" className="text-zinc-500" />
        <Eyebrow>Прогноз</Eyebrow>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-4">
        <StageCard
          body={latestEvent?.at ?? presentText(state.forecast.timeToWorsen)}
          title={latestEvent ? presentText(latestEvent.title) : presentText(state.forecast.title)}
          eyebrow="Последнее событие"
        >
          <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
            <IconGlyph of={LatestIcon} size={12} weight="duotone" />
            {latestEvent ? latestEvent.sourceLabel : 'прогноз'}
          </div>
        </StageCard>
        <StageCard body={presentText(state.forecast.withSigma)} eyebrow="С вмешательством" title={presentText(state.forecast.timeToWorsen)} />
        <StageCard body={presentText(state.forecast.withoutSigma)} eyebrow="Без вмешательства" title={presentText(state.forecast.preventedDamage)} />
      </div>
      <DetailReveal className="mt-auto" label="Подробности прогноза">
        {latestEvent ? (
          <>
            <p>{presentText(latestEvent.body)}</p>
          </>
        ) : null}
        <ul className="mt-3 space-y-2">
          {state.forecast.outlook.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-600">
              <IconGlyph of={timelineEventIcon.forecast} size={12} weight="duotone" className="mt-1 shrink-0 text-amber-500" />
              <span>{presentText(item)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-3">
          {state.forecast.impacts.map((impact) => (
            <div key={impact.label}>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{presentText(impact.label)}</p>
              <p className="mt-1 text-sm text-zinc-600">С вмешательством: {presentText(impact.withIntervention)}</p>
              <p className="mt-1 text-sm text-zinc-600">Без вмешательства: {presentText(impact.withoutIntervention)}</p>
            </div>
          ))}
        </div>
      </DetailReveal>
    </PanelSurface>
  )
}

export const ScenarioHeader = ({
  state,
  interactive = true,
}: {
  state: PlaybackStoreState
  interactive?: boolean
}) => {
  const sceneCopy = storyboardSceneCopy[state.currentStep.scene]
  const theme = riskTheme[state.incident.riskKind]
  const sceneToTimelineType: Record<typeof state.currentStep.scene, 'signal' | 'event' | 'decision' | 'action' | 'forecast'> = {
    baseline: 'event',
    signal: 'signal',
    decision: 'decision',
    action: 'action',
    outcome: 'forecast',
  }
  const SceneIcon = timelineEventIcon[sceneToTimelineType[state.currentStep.scene]]

  return (
    <Surface className={clsx(theme.soft, theme.border)}>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>{presentText(state.objectCard.name)}</Eyebrow>
            <span className={clsx('inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium', theme.chip)}>
              <IconGlyph of={SceneIcon} size={14} weight="duotone" />
              {presentText(sceneCopy.eyebrow)}
            </span>
            {!interactive ? (
              <span
                aria-label="Режим видеостены — только показ, управление идёт с оператора через синхронизацию"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-700"
                data-testid="display-mode-badge"
              >
                <Monitor size={12} weight="fill" />
                Видеостена · только показ
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">{presentText(state.scenario.headline)}</h1>
          <p className="mt-4 max-w-[72ch] text-sm leading-relaxed text-zinc-600">{presentText(state.scenario.subtitle)}</p>
        </div>
        <StatusPill criticality={state.criticality} status={state.playbackStatus} />
      </div>
    </Surface>
  )
}

export const ShellBackground = () => (
  <div className="pointer-events-none fixed inset-0 opacity-70">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(24,24,27,0.08),transparent_30%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.025)_1px,transparent_1px)] bg-[size:160px_160px]" />
  </div>
)
