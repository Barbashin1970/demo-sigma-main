import { describe, expect, it } from 'vitest'

import type { Criticality, StoryboardSceneKind } from '../scenarios'
import { resolveFocus } from './focus-resolver'

const scenes: StoryboardSceneKind[] = ['baseline', 'signal', 'decision', 'action', 'outcome']
const criticalities: Criticality[] = ['normal', 'watch', 'elevated', 'high', 'critical']

describe('resolveFocus', () => {
  it('returns no accent for baseline regardless of criticality', () => {
    for (const c of criticalities) {
      expect(resolveFocus('baseline', c)).toEqual({ panel: null, accent: null })
    }
  })

  it('focuses object on signal', () => {
    expect(resolveFocus('signal', 'watch')).toEqual({ panel: 'object', accent: 'watch' })
  })

  it('focuses incident on decision and action', () => {
    expect(resolveFocus('decision', 'elevated')).toEqual({ panel: 'incident', accent: 'elevated' })
    expect(resolveFocus('action', 'high')).toEqual({ panel: 'incident', accent: 'high' })
  })

  it('focuses forecast on outcome', () => {
    expect(resolveFocus('outcome', 'watch')).toEqual({ panel: 'forecast', accent: 'watch' })
  })

  it('is total over (scene × criticality) — no undefined returns', () => {
    for (const scene of scenes) {
      for (const c of criticalities) {
        const result = resolveFocus(scene, c)
        expect(result).toBeDefined()
        expect(result.accent === null || typeof result.accent === 'string').toBe(true)
      }
    }
  })
})
