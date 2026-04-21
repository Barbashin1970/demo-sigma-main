import type { Criticality, FocusDescriptor, StoryboardSceneKind } from '../scenarios'

/**
 * Derives the single focus anchor for the current storyboard kind.
 * Rule: at most one panel is accented per scene, colored by criticality.
 *
 * baseline  — nothing (all calm)
 * signal    — object card (зона сработала)
 * decision  — incident card (подтверждение)
 * action    — tasks inside incident (эскалация pending)
 * outcome   — forecast (предотвращённый ущерб либо сохраняющийся риск)
 */
export const resolveFocus = (
  scene: StoryboardSceneKind,
  criticality: Criticality,
): FocusDescriptor => {
  switch (scene) {
    case 'baseline':
      return { panel: null, accent: null }
    case 'signal':
      return { panel: 'object', accent: criticality }
    case 'decision':
      return { panel: 'incident', accent: criticality }
    case 'action':
      return { panel: 'incident', accent: criticality }
    case 'outcome':
      return { panel: 'forecast', accent: criticality }
  }
}
