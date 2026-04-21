import { scenarios as scenarioDefinitions } from '../../scenarios'
import type {
  ActivePanel,
  IncidentSnapshot,
  PlaybackStatus,
  RunMode,
  ScenarioDefinition,
  ScenarioId,
  SignalSource,
  TaskItem,
} from '../../scenarios'
import type { PlaybackSyncMessage } from './syncBridge'

interface PlaybackStoreOptions {
  scenarios?: Record<ScenarioId, ScenarioDefinition>
}

export interface PlaybackStoreState {
  selectedScenarioId: ScenarioId
  scenarioIds: ScenarioId[]
  scenario: ScenarioDefinition
  currentStepIndex: number
  currentStep: ScenarioDefinition['steps'][number]
  runMode: RunMode
  playbackStatus: PlaybackStatus
  cityContext: ScenarioDefinition['steps'][number]['cityContext']
  objectCard: ScenarioDefinition['steps'][number]['objectCard']
  timeline: ScenarioDefinition['steps'][number]['timeline']
  zones: ScenarioDefinition['steps'][number]['zones']
  incident: IncidentSnapshot
  explainability: ScenarioDefinition['steps'][number]['explainability']
  tasks: TaskItem[]
  forecast: ScenarioDefinition['steps'][number]['forecast']
  actuators: ScenarioDefinition['steps'][number]['actuators']
  criticality: ScenarioDefinition['steps'][number]['systemCriticality']
  sources: SignalSource[]
  activeSources: SignalSource[]
  smartphoneActions: ScenarioDefinition['smartphoneActions']
  activePanel: ActivePanel
  escalationAcknowledged: boolean
}

type Listener = () => void

const INITIAL_SCENARIO_ID: ScenarioId = 'thermal-incident'
const AUTO_ADVANCE_FALLBACK_MS = 3000

export const createPlaybackStore = ({
  scenarios = scenarioDefinitions,
}: PlaybackStoreOptions = {}) => {
  const scenarioIds = Object.keys(scenarios) as ScenarioId[]

  const core = {
    selectedScenarioId: INITIAL_SCENARIO_ID as ScenarioId,
    currentStepIndex: 0,
    runMode: 'manual' as RunMode,
    playbackStatus: 'idle' as PlaybackStatus,
    activePanel: 'object' as ActivePanel,
    escalationAcknowledged: false,
  }

  const listeners = new Set<Listener>()
  let timerId: ReturnType<typeof setTimeout> | null = null

  const getScenario = (scenarioId = core.selectedScenarioId) => scenarios[scenarioId]

  const clearScheduledAdvance = () => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  const deriveTasks = (tasks: TaskItem[]) =>
    tasks.map((item) =>
      item.id.includes('task-10') || item.id.includes('task-15') || item.id.includes('task-16')
        ? core.escalationAcknowledged && /эскалац/i.test(item.title)
          ? { ...item, status: 'done' as const, note: 'Подтверждено руководителем со смартфонного пульта.' }
          : item
        : item,
    )

  const deriveIncident = (incident: IncidentSnapshot): IncidentSnapshot => ({
    ...incident,
    escalation: {
      ...incident.escalation,
      status: core.escalationAcknowledged ? incident.escalation.confirmedStatus : incident.escalation.pendingStatus,
    },
  })

  const deriveTimeline = (state: ScenarioDefinition['steps'][number], incident: IncidentSnapshot) => {
    if (!core.escalationAcknowledged || !incident.escalation.manualEventTitle || !incident.escalation.manualEventBody) {
      return state.timeline
    }

    const hasManualEvent = state.timeline.some((event) => event.title === incident.escalation.manualEventTitle)

    if (hasManualEvent) {
      return state.timeline
    }

    return [
      ...state.timeline,
      {
        id: `${state.id}-manual-escalation`,
        at: 'Ручн.',
        title: incident.escalation.manualEventTitle,
        body: incident.escalation.manualEventBody,
        type: 'action' as const,
        sourceKind: 'manual' as const,
        sourceLabel: 'Смартфонный пульт руководителя',
      },
    ]
  }

  const buildState = (): PlaybackStoreState => {
    const scenario = getScenario()
    const currentStep = scenario.steps[core.currentStepIndex]
    const incident = deriveIncident(currentStep.incident)
    const timeline = deriveTimeline(currentStep, incident)
    const tasks = deriveTasks(currentStep.tasks)
    const activeSources = scenario.sources.filter((source) => currentStep.activeSourceIds.includes(source.id))

    return {
      selectedScenarioId: core.selectedScenarioId,
      scenarioIds,
      scenario,
      currentStepIndex: core.currentStepIndex,
      currentStep,
      runMode: core.runMode,
      playbackStatus: core.playbackStatus,
      cityContext: currentStep.cityContext,
      objectCard: currentStep.objectCard,
      timeline,
      zones: currentStep.zones,
      incident,
      explainability: currentStep.explainability,
      tasks,
      forecast: currentStep.forecast,
      actuators: currentStep.actuators,
      criticality: currentStep.systemCriticality,
      sources: scenario.sources,
      activeSources,
      smartphoneActions: scenario.smartphoneActions,
      activePanel: core.activePanel,
      escalationAcknowledged: core.escalationAcknowledged,
    }
  }

  let snapshot = buildState()

  const emit = () => {
    snapshot = buildState()

    for (const listener of listeners) {
      listener()
    }
  }

  const setIndex = (nextIndex: number) => {
    const scenario = getScenario()
    const maxIndex = scenario.steps.length - 1
    core.currentStepIndex = Math.max(0, Math.min(nextIndex, maxIndex))
  }

  const scheduleAutoAdvance = () => {
    clearScheduledAdvance()

    if (core.runMode !== 'auto' || core.playbackStatus !== 'running') {
      return
    }

    const scenario = getScenario()
    const maxIndex = scenario.steps.length - 1

    if (core.currentStepIndex >= maxIndex) {
      core.playbackStatus = 'completed'
      emit()
      return
    }

    const delay = scenario.steps[core.currentStepIndex].autoAdvanceAfterMs ?? AUTO_ADVANCE_FALLBACK_MS

    timerId = setTimeout(() => {
      moveToNextStep()

      if (core.playbackStatus === 'running' && core.runMode === 'auto') {
        scheduleAutoAdvance()
      }
    }, delay)
  }

  const moveToNextStep = () => {
    const scenario = getScenario()
    const maxIndex = scenario.steps.length - 1

    if (core.currentStepIndex >= maxIndex) {
      core.playbackStatus = 'completed'
      emit()
      return
    }

    core.currentStepIndex += 1
    core.playbackStatus = core.currentStepIndex >= maxIndex ? 'completed' : 'running'
    emit()
  }

  const resetCore = () => {
    clearScheduledAdvance()
    core.currentStepIndex = 0
    core.playbackStatus = 'idle'
    core.activePanel = 'object'
    core.escalationAcknowledged = false
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    getState() {
      return snapshot
    },
    getSyncMessage(): PlaybackSyncMessage {
      return {
        selectedScenarioId: core.selectedScenarioId,
        currentStepIndex: core.currentStepIndex,
        runMode: core.runMode,
        playbackStatus: core.playbackStatus,
        activePanel: core.activePanel,
        escalationAcknowledged: core.escalationAcknowledged,
      }
    },
    start() {
      if (core.playbackStatus === 'completed') {
        return
      }

      if (core.runMode === 'manual') {
        moveToNextStep()
        return
      }

      if (core.playbackStatus !== 'running') {
        moveToNextStep()
      }

      if (core.currentStepIndex < getScenario().steps.length - 1) {
        scheduleAutoAdvance()
      }
    },
    pause() {
      clearScheduledAdvance()

      if (core.playbackStatus !== 'completed') {
        core.playbackStatus = core.currentStepIndex === 0 ? 'idle' : 'paused'
      }

      emit()
    },
    reset() {
      resetCore()
      emit()
    },
    setRunMode(mode: RunMode) {
      if (core.runMode === mode) {
        return
      }

      core.runMode = mode
      clearScheduledAdvance()

      if (mode === 'manual' && core.playbackStatus === 'running') {
        core.playbackStatus = core.currentStepIndex === 0 ? 'idle' : 'paused'
      }

      emit()

      if (mode === 'auto' && core.playbackStatus === 'running') {
        scheduleAutoAdvance()
      }
    },
    nextStep() {
      clearScheduledAdvance()
      moveToNextStep()
    },
    selectScenario(scenarioId: ScenarioId) {
      if (core.selectedScenarioId === scenarioId) {
        return
      }

      core.selectedScenarioId = scenarioId
      resetCore()
      emit()
    },
    focusPanel(panel: ActivePanel) {
      core.activePanel = panel
      emit()
    },
    confirmEscalation() {
      if (!snapshot.incident.escalation.canConfirm) {
        return
      }

      core.escalationAcknowledged = true
      core.activePanel = 'tasks'
      emit()
    },
    applySyncMessage(message: PlaybackSyncMessage) {
      clearScheduledAdvance()
      core.selectedScenarioId = message.selectedScenarioId as ScenarioId
      core.runMode = message.runMode
      core.playbackStatus = message.playbackStatus
      core.activePanel = message.activePanel
      core.escalationAcknowledged = message.escalationAcknowledged
      setIndex(message.currentStepIndex)
      emit()
    },
    dispose() {
      clearScheduledAdvance()
      listeners.clear()
    },
  }
}
