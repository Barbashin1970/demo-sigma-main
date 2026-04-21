import {
  ArrowSquareIn,
  Barricade,
  Bed,
  Bell,
  Brain,
  Broadcast,
  CheckCircle,
  CircleNotch,
  ClipboardText,
  Cloud,
  Desktop,
  DoorOpen,
  Drop,
  Eye,
  Fire,
  FireExtinguisher,
  FirstAid,
  FirstAidKit,
  Flask,
  Gauge,
  GitBranch,
  HandHeart,
  HardDrives,
  Headset,
  Hourglass,
  IdentificationCard,
  Key,
  Lightning,
  MapPinLine,
  Monitor,
  Path,
  PersonSimpleWalk,
  PhoneCall,
  Plug,
  Pulse,
  ShieldCheck,
  ShieldWarning,
  SignIn,
  Siren,
  Stethoscope,
  Thermometer,
  TrendUp,
  Tree,
  Users,
  VideoCamera,
  Warning,
  WarningOctagon,
  Waves,
  Wind,
  Wrench,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

import type {
  Criticality,
  IncidentOrigin,
  RiskKind,
  ScenarioId,
  SourceKind,
  TaskStatus,
  TimelineEventType,
  ZoneIconKey,
} from '../../scenarios'

export type IconComponent = Icon

/** Scenario tab icons — object, not risk-kind. */
export const scenarioTabIcon: Record<ScenarioId, IconComponent> = {
  'thermal-incident': HardDrives,
  'heat-inlet-breach': FirstAidKit,
  'air-quality-co2': Tree,
  'dormitory-flood': Bed,
  'lab-access-breach': ShieldWarning,
  'access-no-pass': IdentificationCard,
  'access-guarantors': HandHeart,
  'edds-mode-change': Headset,
}

/** Risk-kind icon — used in chips and watermarks. */
export const riskIcon: Record<RiskKind, IconComponent> = {
  thermal: Fire,
  water: Waves,
  air: Wind,
  security: ShieldWarning,
  operational: Broadcast,
}

/** Criticality lamp icon — 5 states. */
export const criticalityIcon: Record<Criticality, IconComponent> = {
  normal: CheckCircle,
  watch: Eye,
  elevated: Warning,
  high: WarningOctagon,
  critical: Siren,
}

/** Tailwind text color per criticality — used for chips and accents. */
export const criticalityText: Record<Criticality, string> = {
  normal: 'text-emerald-600',
  watch: 'text-amber-600',
  elevated: 'text-orange-600',
  high: 'text-red-600',
  critical: 'text-red-700',
}

/** Left-border accent class per criticality. */
export const criticalityAccentBorder: Record<Criticality, string> = {
  normal: 'border-l-emerald-500',
  watch: 'border-l-amber-500',
  elevated: 'border-l-orange-500',
  high: 'border-l-red-500',
  critical: 'border-l-red-600',
}

/** SourceKind icons — 6 kinds. */
export const sourceKindIcon: Record<SourceKind, IconComponent> = {
  sensor: Gauge,
  external: Broadcast,
  manual: ClipboardText,
  virtual: Brain,
  actuator: Plug,
  'video-analytic': VideoCamera,
}

/** Timeline event type icons — 5 types. */
export const timelineEventIcon: Record<TimelineEventType, IconComponent> = {
  signal: Pulse,
  event: Bell,
  decision: GitBranch,
  action: Lightning,
  forecast: TrendUp,
}

/** Task status icons — 3 states. */
export const taskStatusIcon: Record<TaskStatus, IconComponent> = {
  pending: Hourglass,
  'in-progress': CircleNotch,
  done: CheckCircle,
}

/** Incident origin icons. */
export const incidentOriginIcon: Record<IncidentOrigin, IconComponent> = {
  internal: ShieldCheck,
  external: Broadcast,
  hybrid: GitBranch,
}

/** Zone semantic icons — declared on each ScenarioZone. */
export const zoneIcon: Record<ZoneIconKey, IconComponent> = {
  'server-rack': HardDrives,
  'electrical-panel': Lightning,
  'access-corridor': DoorOpen,
  'intensive-care': FirstAid,
  'tech-corridor': Path,
  'heat-node': Thermometer,
  'forest-edge': Tree,
  'pedestrian-route': PersonSimpleWalk,
  'forest-entrance': SignIn,
  'residential-floor': Bed,
  'leak-collector': Drop,
  laboratory: Flask,
  'perimeter-gate': ArrowSquareIn,
  turnstile: Barricade,
  'waiting-area': Users,
  'cloud-verification': Cloud,
  'dispatch-room': Monitor,
  'city-monitoring': MapPinLine,
  'call-center-112': PhoneCall,
}

/** Service receiver icons — matched by substring of the service label. */
const serviceIconRules: Array<[RegExp, IconComponent]> = [
  [/ЕДДС|оперативный|диспетч/i, Headset],
  [/МЧС|пожарн/i, FireExtinguisher],
  [/коменд/i, Key],
  [/аварийн/i, Wrench],
  [/теплосет/i, Thermometer],
  [/лесн/i, Tree],
  [/охран|безопасност/i, ShieldCheck],
  [/ИТ-|инженер/i, Desktop],
  [/клиническ|скор|медиц/i, Stethoscope],
  [/водокан/i, Drop],
]

export const serviceIcon = (service: string): IconComponent => {
  for (const [pattern, icon] of serviceIconRules) {
    if (pattern.test(service)) {
      return icon
    }
  }
  return Headset
}
