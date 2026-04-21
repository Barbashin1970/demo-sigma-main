import type { ActivePanel, PlaybackStatus, RunMode } from '../../scenarios'

export interface PlaybackSyncMessage {
  selectedScenarioId: string
  currentStepIndex: number
  runMode: RunMode
  playbackStatus: PlaybackStatus
  activePanel: ActivePanel
  escalationAcknowledged: boolean
}

type PlaybackListener = (message: PlaybackSyncMessage) => void

const STORAGE_KEY_PREFIX = 'sigma-demo-sync'

export const createPlaybackSyncBridge = (channelName = 'sigma-demo') => {
  const listeners = new Set<PlaybackListener>()

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    const channel = new window.BroadcastChannel(`${STORAGE_KEY_PREFIX}:${channelName}`)

    channel.onmessage = (event: MessageEvent<PlaybackSyncMessage>) => {
      for (const listener of listeners) {
        listener(event.data)
      }
    }

    return {
      publish(message: PlaybackSyncMessage) {
        channel.postMessage(message)
      },
      subscribe(listener: PlaybackListener) {
        listeners.add(listener)

        return () => {
          listeners.delete(listener)
        }
      },
      dispose() {
        listeners.clear()
        channel.close()
      },
    }
  }

  const storageKey = `${STORAGE_KEY_PREFIX}:${channelName}`
  const storageTarget = window as Window

  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) {
      return
    }

    const payload = JSON.parse(event.newValue) as PlaybackSyncMessage

    for (const listener of listeners) {
      listener(payload)
    }
  }

  storageTarget.addEventListener('storage', onStorage)

  return {
    publish(message: PlaybackSyncMessage) {
      storageTarget.localStorage.setItem(storageKey, JSON.stringify(message))
    },
    subscribe(listener: PlaybackListener) {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    dispose() {
      listeners.clear()
      storageTarget.removeEventListener('storage', onStorage)
    },
  }
}
