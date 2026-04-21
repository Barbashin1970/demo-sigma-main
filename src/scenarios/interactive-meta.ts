/**
 * Phase 4.c — тренажёрная разметка шагов.
 *
 * Словарь `scenarioTrainerActions` — полный список действий, которые кнопками
 * предъявляются оператору в `/trainer/*`. На Phase 4.d отсюда же поднимаются
 * лейблы кнопок и атрибуты для scoring.
 *
 * Словарь `scenarioTrainerMeta` — карта `stepId → ScenarioStepInteractiveMeta`.
 * Шаги `baseline` намеренно опущены: на baseline оператор ничего не решает,
 * тренажёр проходит его как ожидание без очков.
 *
 * Наполнен для двух эталонных сценариев (`thermal-incident`, `edds-mode-change`).
 * Для остальных сценариев поле `interactiveMeta` не проставляется — их
 * `/trainer/*` не запускает.
 *
 * Хранится отдельно от `catalog.ts`, потому что на Phase 4.g этот модуль
 * мигрирует в YAML/JSON без изменения UI-слоя.
 */

import type {
  ScenarioActionDefinition,
  ScenarioId,
  ScenarioStepInteractiveMeta,
} from './types'

export const scenarioTrainerActions: Partial<
  Record<ScenarioId, ScenarioActionDefinition[]>
> = {
  'thermal-incident': [
    {
      id: 'observe-temperature',
      label: 'Наблюдать за температурой',
      service: 'Оператор Sigma',
      rationale: 'Пассивное наблюдение — допустимо на первом сигнале.',
    },
    {
      id: 'open-object-card',
      label: 'Открыть карточку серверной',
      service: 'Оператор Sigma',
      rationale: 'Подтянуть контекст источников по зоне.',
    },
    {
      id: 'dispatch-it-ops',
      label: 'Вызвать ИТ-службу НГУ',
      service: 'ИТ-служба НГУ',
      rationale:
        'Физический осмотр силового шкафа — основание по внутреннему регламенту ИТ-службы.',
    },
    {
      id: 'shutdown-power-early',
      label: 'Снять питание до подтверждения',
      service: 'Оператор Sigma',
      prohibited: true,
      rationale:
        'Запрещено регламентом: без подтверждения старшего ИТ-инженера обесточивание рушит рабочую нагрузку.',
    },
    {
      id: 'confirm-escalation',
      label: 'Подтвердить эскалацию на ЕДДС и 01/101/112',
      service: 'ЕДДС',
      rationale:
        'Подтверждение дыма вторым источником (HEIMAN) — основание для эскалации.',
    },
    {
      id: 'stand-down',
      label: 'Отменить тревогу',
      service: 'Оператор Sigma',
      prohibited: true,
      rationale: 'Не отменяем, пока не закрыт источник сигнала.',
    },
    {
      id: 'close-incident',
      label: 'Закрыть инцидент, перевести в штатный режим',
      service: 'Оператор Sigma',
      rationale:
        'После локализации силового шкафа и подтверждения ИТ-службы — закрытие.',
    },
    {
      id: 'extend-watch',
      label: 'Оставить объект в режиме повышенного наблюдения',
      service: 'Оператор Sigma',
      rationale: 'Мягкий выход после инцидента — допустимое решение.',
    },
  ],
  'edds-mode-change': [
    {
      id: 'acknowledge-signal',
      label: 'Принять сигнал и зафиксировать в журнале',
      service: 'Старший оперативный дежурный',
      rationale: 'п. 8.5.2 — первичная фиксация сигнала.',
    },
    {
      id: 'dismiss-as-noise',
      label: 'Оценить как шум и закрыть',
      service: 'Старший оперативный дежурный',
      prohibited: true,
      rationale:
        'Нарушает п. 8.5.2 — анализ достоверности требует двух независимых источников, а не единичной оценки.',
    },
    {
      id: 'cross-check-sources',
      label: 'Сверить АДПИ GSM + метеостанцию + «112»',
      service: 'Старший оперативный дежурный',
      rationale: 'п. 8.5.2 — анализ достоверности по независимым источникам.',
    },
    {
      id: 'prepare-escalation-draft',
      label: 'Подготовить формализованный доклад',
      service: 'Оператор 112',
      rationale:
        'п. 6.3 — готовятся формализованные документы для вышестоящих органов РСЧС.',
    },
    {
      id: 'wait-more-signals',
      label: 'Ждать ещё сигналов',
      service: 'Старший оперативный дежурный',
      prohibited: true,
      rationale:
        'При совпадении двух признаков ждать запрещено — это риск упустить окно решения.',
    },
    {
      id: 'report-to-head',
      label: 'Доложить главе поселка и председателю КЧС и ОПБ',
      service: 'Старший оперативный дежурный',
      rationale: 'п. 6.3 — немедленный доклад главе при классификации ЧС.',
    },
    {
      id: 'transition-to-elevated',
      label: 'Перевести службу в повышенную готовность',
      service: 'Глава поселка',
      rationale: 'п. 5.5.1 — решение принимает глава поселка.',
    },
    {
      id: 'hold-normal-mode',
      label: 'Удержать повседневный режим',
      service: 'Глава поселка',
      rationale:
        'Допустимо только если сигналы не подтверждаются — в текущем сценарии ведёт к штрафу.',
    },
  ],
}

export const scenarioTrainerMeta: Partial<
  Record<ScenarioId, Record<string, ScenarioStepInteractiveMeta>>
> = {
  'thermal-incident': {
    'thermal-1': {
      expectedActions: ['open-object-card'],
      allowedActions: ['observe-temperature', 'open-object-card'],
      maxDecisionTimeSec: 60,
      weight: 5,
      clauseRef: 'ИТ-служба НГУ · первичный контроль',
    },
    'thermal-2': {
      expectedActions: ['dispatch-it-ops'],
      allowedActions: [
        'dispatch-it-ops',
        'shutdown-power-early',
        'observe-temperature',
      ],
      maxDecisionTimeSec: 90,
      weight: 15,
      clauseRef: 'ИТ-служба НГУ · вызов физического осмотра',
    },
    'thermal-3': {
      expectedActions: ['confirm-escalation'],
      allowedActions: ['confirm-escalation', 'stand-down', 'dispatch-it-ops'],
      maxDecisionTimeSec: 45,
      weight: 20,
      clauseRef: 'ЕДДС · эскалация при подтверждении вторым источником',
    },
    'thermal-4': {
      expectedActions: ['close-incident', 'extend-watch'],
      allowedActions: ['close-incident', 'extend-watch', 'stand-down'],
      maxDecisionTimeSec: 60,
      weight: 10,
      clauseRef: 'Оператор Sigma · закрытие инцидента',
    },
  },
  'edds-mode-change': {
    'edds-1': {
      expectedActions: ['acknowledge-signal'],
      allowedActions: ['acknowledge-signal', 'dismiss-as-noise'],
      maxDecisionTimeSec: 45,
      weight: 5,
      clauseRef: '8.5.2:первичная-фиксация',
    },
    'edds-2': {
      expectedActions: ['cross-check-sources', 'prepare-escalation-draft'],
      allowedActions: [
        'cross-check-sources',
        'prepare-escalation-draft',
        'dismiss-as-noise',
      ],
      maxDecisionTimeSec: 90,
      weight: 20,
      clauseRef: '8.5.2:анализ-достоверности',
    },
    'edds-3': {
      expectedActions: ['report-to-head'],
      allowedActions: ['report-to-head', 'wait-more-signals'],
      maxDecisionTimeSec: 60,
      weight: 25,
      clauseRef: '6.3:доклад-главе',
    },
    'edds-4': {
      expectedActions: ['transition-to-elevated'],
      allowedActions: ['transition-to-elevated', 'hold-normal-mode'],
      maxDecisionTimeSec: 120,
      weight: 15,
      clauseRef: '5.5.1:перевод-режима',
    },
  },
}
