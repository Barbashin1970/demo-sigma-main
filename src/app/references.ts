import { regulations, type RegulationNote, type ScenarioReferences } from '../config/regulations'
import type { ScenarioId } from '../scenarios'

/**
 * Выдержки из регуляторной базы, которые подсвечиваются в UI через кнопку «i».
 * Каждое поле — независимый справочный блок, привязанный к конкретной секции
 * интерфейса (например, «Обстановка» в ControlRail или «Действия руководителя»
 * в IncidentPanel).
 *
 * Phase 4.b — read-only справка. Phase 4.g — источник истины перенесён в
 * YAML ([src/config/regulations.yaml]); данный модуль — тонкая обёртка,
 * сохраняющая публичный API.
 */
export type { RegulationNote, ScenarioReferences }

export const scenarioReferences: Partial<Record<ScenarioId, ScenarioReferences>> =
  regulations.scenarios as Partial<Record<ScenarioId, ScenarioReferences>>
