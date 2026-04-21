import type { Criticality, ScenarioStep, ScenarioZone, StoryboardSceneKind } from '../scenarios'

const criticalityRank: Record<Criticality, number> = {
  normal: 0,
  watch: 1,
  elevated: 2,
  high: 3,
  critical: 4,
}

export const storyboardSceneCopy: Record<
  StoryboardSceneKind,
  {
    eyebrow: string
    title: string
    description: string
  }
> = {
  baseline: {
    eyebrow: 'Город и объект',
    title: 'Исходный управленческий контур',
    description: 'Руководитель видит исходное состояние города, выбранного объекта и критических зон до развития инцидента.',
  },
  signal: {
    eyebrow: 'Сигнал',
    title: 'Первый значимый сигнал',
    description: 'Панель показывает, какой источник первым поднял объект в городской приоритет и почему это важно.',
  },
  decision: {
    eyebrow: 'Решение',
    title: 'Основание для интерпретации',
    description: 'Панель показывает, почему Sigma классифицирует риск именно так и какие контексты повышают приоритет.',
  },
  action: {
    eyebrow: 'Действие',
    title: 'Исполнение мер и задач',
    description: 'Панель отражает реальные действия служб и состояние исполнительных контуров, если они есть в железе.',
  },
  outcome: {
    eyebrow: 'Прогноз',
    title: 'Сравнение сценариев',
    description: 'Панель показывает прогноз с вмешательством и без вмешательства для людей, процесса, оборудования и города.',
  },
}

export const getStoryboardScene = (step: ScenarioStep): StoryboardSceneKind => step.scene

export const getFocusZones = (step: ScenarioStep): ScenarioZone[] => {
  const zoneIdFromEvent = step.timeline.at(-1)?.zoneId

  if (zoneIdFromEvent) {
    const matchedZone = step.zones.find((zone) => zone.id === zoneIdFromEvent)

    if (matchedZone) {
      return [matchedZone]
    }
  }

  if (step.incident.affectedZones.length > 0) {
    return step.zones.filter((zone) => step.incident.affectedZones.includes(zone.id)).slice(0, 2)
  }

  return [...step.zones].sort((left, right) => criticalityRank[right.state] - criticalityRank[left.state]).slice(0, 2)
}

export const getSceneMoments = (step: ScenarioStep) => step.timeline.slice(-2)
