export type ScenarioId = 'thermal-incident' | 'heat-inlet-breach' | 'air-quality-co2'
export type ZoneId = 'zone-a' | 'zone-b' | 'zone-c'
export type Criticality = 'normal' | 'watch' | 'elevated' | 'high' | 'critical'
export type RunMode = 'manual' | 'auto'
export type PlaybackStatus = 'idle' | 'running' | 'paused' | 'completed'
export type TimelineEventType = 'signal' | 'event' | 'decision' | 'action' | 'forecast'
export type DisplayMode = 'operator' | 'display'
export type StoryboardSceneKind = 'baseline' | 'signal' | 'decision' | 'action' | 'outcome'
export type SourceKind = 'sensor' | 'external' | 'manual' | 'virtual' | 'actuator'
export type RiskKind = 'thermal' | 'water' | 'air'
export type IncidentOrigin = 'internal' | 'external' | 'hybrid'
export type TaskStatus = 'pending' | 'in-progress' | 'done'
export type ValveState = 'idle' | 'standby' | 'closing' | 'closed'
export type LightState = 'normal' | 'watch' | 'alert'
export type ActivePanel = 'city' | 'object' | 'tasks' | 'forecast'

export interface RecommendationItem {
  id: string
  title: string
  detail: string
  owner: string
  basis: string
}

export interface ExplainabilityNote {
  criticality: string
  decisionBasis: string
  causeEffectSummary: string
  ruleReference: string
}

export interface TimelineEvent {
  id: string
  at: string
  title: string
  body: string
  type: TimelineEventType
  sourceKind: SourceKind
  sourceLabel: string
  zoneId?: ZoneId
}

export interface CityObject {
  id: string
  name: string
  type: string
  district: string
  risk: Criticality
  incidentLabel: string
  services: string[]
  taskCount: number
  status: string
  selected?: boolean
}

export interface InfrastructureIncident {
  id: string
  title: string
  summary: string
  severity: Criticality
  source: string
  relatedObjectId: string
}

export interface CityContextSnapshot {
  statusLine: string
  objects: CityObject[]
  infrastructureIncidents: InfrastructureIncident[]
}

export interface SignalSource {
  id: string
  label: string
  kind: SourceKind
  deviceModel: string
  location: string
  zoneId?: ZoneId
  metric: string
  description: string
}

export interface ScenarioZone {
  id: ZoneId
  label: string
  semantic: string
  state: Criticality
  statusLine: string
  sensorLine: string
  operatorNote: string
  sourceIds: string[]
}

export interface TaskItem {
  id: string
  title: string
  service: string
  owner: string
  status: TaskStatus
  dueLabel: string
  note: string
}

export interface ForecastImpact {
  label: string
  withIntervention: string
  withoutIntervention: string
}

export interface ForecastSnapshot {
  title: string
  timeToWorsen: string
  withSigma: string
  withoutSigma: string
  preventedDamage: string
  outlook: string[]
  impacts: ForecastImpact[]
}

export interface ValveSnapshot {
  id: string
  label: string
  state: ValveState
}

export interface LightSnapshot {
  id: string
  label: string
  state: LightState
}

export interface ActuatorSnapshot {
  integrationStatus: string
  autoActionStatus: string
  valves: ValveSnapshot[]
  lights: LightSnapshot[]
  serviceLamp: string
}

export interface IncidentEscalation {
  destination: string
  canConfirm: boolean
  pendingStatus: string
  confirmedStatus: string
  status: string
  manualEventTitle?: string
  manualEventBody?: string
}

export interface IncidentSnapshot {
  badge: string
  title: string
  summary: string
  criticality: Criticality
  riskKind: RiskKind
  origin: IncidentOrigin
  affectedZones: ZoneId[]
  localizationStatus: string
  services: string[]
  escalation: IncidentEscalation
  recommendations: RecommendationItem[]
}

export interface ObjectCardSnapshot {
  id: string
  name: string
  type: string
  address: string
  cityRole: string
  summary: string
  externalDependency: string
  localizationStatus: string
  services: string[]
  tasksCreated: number
}

export interface SmartphoneAction {
  id: string
  label: string
  description: string
  panel: ActivePanel
  action: 'focus' | 'confirm-escalation'
}

export interface ScenarioStep {
  id: string
  phase: string
  label: string
  scene: StoryboardSceneKind
  narrative: string
  systemCriticality: Criticality
  cityContext: CityContextSnapshot
  objectCard: ObjectCardSnapshot
  zones: ScenarioZone[]
  activeSourceIds: string[]
  timeline: TimelineEvent[]
  incident: IncidentSnapshot
  explainability: ExplainabilityNote
  tasks: TaskItem[]
  forecast: ForecastSnapshot
  actuators: ActuatorSnapshot
  sigmaEffect: string
  autoAdvanceAfterMs?: number
}

export interface ScenarioDefinition {
  id: ScenarioId
  title: string
  headline: string
  tabLabel: string
  subtitle: string
  scenarioNumber: string
  cityContext: CityContextSnapshot
  sources: SignalSource[]
  smartphoneActions: SmartphoneAction[]
  steps: ScenarioStep[]
}
