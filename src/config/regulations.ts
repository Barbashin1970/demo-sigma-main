/**
 * Phase 4.g — загрузчик регламентов из YAML.
 *
 * Логика:
 * 1. Vite-фича `?raw` импортирует YAML-файл как строку на этапе сборки.
 * 2. `js-yaml` парсит её в объект.
 * 3. `zod` валидирует форму и возвращает типизированный результат.
 *
 * Если YAML невалиден — `parseRegulations` бросает исключение; приложение
 * не стартует с битыми данными. Unit-тест [regulations.test.ts] пинит
 * успешный парсинг текущего конфига.
 *
 * В Phase 5 тот же loader работает с содержимым, полученным из Studio-
 * редактора (tetxarea → строка → parseRegulations), без изменений UI-слоя.
 */

import yaml from 'js-yaml'
import { z } from 'zod'

import yamlSource from './regulations.yaml?raw'

const regulationNoteSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  source: z.string().optional(),
})

const scenarioReferencesSchema = z
  .object({
    situation: regulationNoteSchema.optional(),
    actions: regulationNoteSchema.optional(),
  })
  .refine(
    (value) => value.situation !== undefined || value.actions !== undefined,
    { message: 'Запись должна содержать хотя бы одно поле: situation или actions' },
  )

/**
 * «Чего не делать» — массив строк по пяти `RiskKind`. Держим схему
 * открытой по ключам (`z.record`), чтобы будущие добавления RiskKind
 * не требовали синхронного обновления схемы; проверка на принадлежность
 * ключа к актуальному RiskKind делается тестом
 * [regulations.test.ts].
 */
const doNotByRiskSchema = z.record(z.string(), z.array(z.string().min(1)).min(1))

const regulationsFileSchema = z.object({
  version: z.literal('1.0'),
  doNotByRisk: doNotByRiskSchema,
  scenarios: z.record(z.string(), scenarioReferencesSchema),
})

export type RegulationNote = z.infer<typeof regulationNoteSchema>
export type ScenarioReferences = z.infer<typeof scenarioReferencesSchema>
export type DoNotByRisk = z.infer<typeof doNotByRiskSchema>
export type RegulationsFile = z.infer<typeof regulationsFileSchema>

/**
 * Парсит YAML-строку и валидирует её. Выделено отдельно, чтобы в тестах
 * можно было подать синтетический YAML без чтения файла.
 */
export const parseRegulations = (source: string): RegulationsFile => {
  const raw = yaml.load(source)
  return regulationsFileSchema.parse(raw)
}

/** Модуль-сингeлтон: парсим один раз при загрузке. */
export const regulations: RegulationsFile = parseRegulations(yamlSource)
