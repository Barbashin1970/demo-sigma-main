import { describe, expect, it } from 'vitest'

import { scenarioIds } from '../scenarios'
import type { RiskKind } from '../scenarios'

import { parseRegulations, regulations } from './regulations'

/**
 * Инварианты Phase 4.g — гарантируют, что YAML-конфиг валиден, полон и
 * каждое упомянутое там scenarioId действительно существует в каталоге.
 * При провале теста билд демо не ломается, но ясно видно, что регламент
 * рассинхронизирован со сценарием.
 */
describe('Regulations YAML loader (Phase 4.g)', () => {
  it('loads and validates src/config/regulations.yaml at build time', () => {
    expect(regulations.version).toBe('1.0')
    expect(Object.keys(regulations.scenarios).length).toBeGreaterThan(0)
  })

  it('references only scenario ids that exist in the catalog', () => {
    const knownIds = new Set<string>(scenarioIds)
    for (const id of Object.keys(regulations.scenarios)) {
      expect(knownIds.has(id)).toBe(true)
    }
  })

  it('requires every entry to have at least situation or actions', () => {
    for (const [scenarioId, entry] of Object.entries(regulations.scenarios)) {
      const hasContent = entry.situation !== undefined || entry.actions !== undefined
      expect(hasContent, `${scenarioId} must have situation or actions`).toBe(true)
    }
  })

  it('fails validation when a note misses a required field', () => {
    const broken = `
version: "1.0"
scenarios:
  edds-mode-change:
    situation:
      title: "Only title, body missing"
`
    expect(() => parseRegulations(broken)).toThrow()
  })

  it('fails validation when a scenario entry is empty', () => {
    const broken = `
version: "1.0"
scenarios:
  edds-mode-change: {}
`
    expect(() => parseRegulations(broken)).toThrow()
  })

  it('fails validation when version is unexpected', () => {
    const broken = `
version: "2.0"
scenarios: {}
`
    expect(() => parseRegulations(broken)).toThrow()
  })

  it('accepts a minimal valid document', () => {
    const ok = `
version: "1.0"
doNotByRisk:
  thermal:
    - "demo rule"
scenarios:
  edds-mode-change:
    actions:
      title: "Тест"
      body: "Тело регламента"
`
    const parsed = parseRegulations(ok)
    expect(parsed.scenarios['edds-mode-change'].actions?.title).toBe('Тест')
    expect(parsed.doNotByRisk.thermal).toEqual(['demo rule'])
  })

  describe('doNotByRisk', () => {
    const allRiskKinds: RiskKind[] = [
      'thermal',
      'water',
      'air',
      'security',
      'operational',
    ]

    it('covers every RiskKind with at least one rule', () => {
      for (const kind of allRiskKinds) {
        expect(regulations.doNotByRisk[kind], `missing rules for ${kind}`).toBeDefined()
        expect(regulations.doNotByRisk[kind].length).toBeGreaterThan(0)
      }
    })

    it('rejects empty rule arrays', () => {
      const broken = `
version: "1.0"
doNotByRisk:
  thermal: []
scenarios:
  edds-mode-change:
    actions:
      title: "ok"
      body: "ok"
`
      expect(() => parseRegulations(broken)).toThrow()
    })

    it('rejects empty-string rules', () => {
      const broken = `
version: "1.0"
doNotByRisk:
  thermal:
    - ""
scenarios:
  edds-mode-change:
    actions:
      title: "ok"
      body: "ok"
`
      expect(() => parseRegulations(broken)).toThrow()
    })
  })
})
