import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react'

import { scenarios } from '../../scenarios'
import type { DisplayMode, ScenarioId } from '../../scenarios'
import { createPlaybackStore } from './playbackStore'
import { createPlaybackSyncBridge } from './syncBridge'

export const playbackStore = createPlaybackStore({ scenarios })

export const usePlaybackState = () =>
  useSyncExternalStore(playbackStore.subscribe, playbackStore.getState, playbackStore.getState)

export const usePlaybackActions = () => playbackStore

export const useScenarioRoute = (scenarioId: ScenarioId | null) => {
  useLayoutEffect(() => {
    if (!scenarioId) {
      return
    }

    if (playbackStore.getState().selectedScenarioId !== scenarioId) {
      playbackStore.selectScenario(scenarioId)
    }
  }, [scenarioId])
}

export const usePlaybackSync = (mode: DisplayMode) => {
  useEffect(() => {
    const bridge = createPlaybackSyncBridge('sigma-demo')

    if (mode === 'operator') {
      const publish = () => bridge.publish(playbackStore.getSyncMessage())

      publish()
      const unsubscribe = playbackStore.subscribe(publish)

      return () => {
        unsubscribe()
        bridge.dispose()
      }
    }

    const unsubscribe = bridge.subscribe((message) => {
      playbackStore.applySyncMessage(message)
    })

    return () => {
      unsubscribe()
      bridge.dispose()
    }
  }, [mode])
}
