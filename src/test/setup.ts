import '@testing-library/jest-dom/vitest'

class BroadcastChannelMock {
  name: string
  onmessage: ((event: MessageEvent) => void) | null = null

  private static registry = new Map<string, Set<BroadcastChannelMock>>()

  constructor(name: string) {
    this.name = name

    const channels = BroadcastChannelMock.registry.get(name) ?? new Set()
    channels.add(this)
    BroadcastChannelMock.registry.set(name, channels)
  }

  postMessage(data: unknown) {
    const channels = BroadcastChannelMock.registry.get(this.name)

    if (!channels) {
      return
    }

    for (const channel of channels) {
      if (channel !== this && channel.onmessage) {
        channel.onmessage(new MessageEvent('message', { data }))
      }
    }
  }

  close() {
    const channels = BroadcastChannelMock.registry.get(this.name)

    if (!channels) {
      return
    }

    channels.delete(this)

    if (channels.size === 0) {
      BroadcastChannelMock.registry.delete(this.name)
    }
  }
}

Object.defineProperty(window, 'BroadcastChannel', {
  writable: true,
  value: BroadcastChannelMock,
})
