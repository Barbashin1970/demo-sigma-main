import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import App from './App'

describe('Regulations viewer (/regulations)', () => {
  it('renders the shell with scenarios and do-not blocks', () => {
    window.history.pushState({}, '', '/regulations')
    render(<App />)

    expect(screen.getByTestId('regulations-shell')).toBeInTheDocument()
    expect(screen.getByTestId('regulations-do-not')).toBeInTheDocument()
    expect(screen.getByTestId('regulations-scenarios')).toBeInTheDocument()
    // At least the two exemplar scenarios show up
    expect(screen.getByTestId('regulations-entry-edds-mode-change')).toBeInTheDocument()
    expect(screen.getByTestId('regulations-entry-thermal-incident')).toBeInTheDocument()
  })

  it('exposes the help i-button with instructions', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/regulations')
    render(<App />)

    await user.click(screen.getByTestId('regulations-help'))
    expect(screen.getByText(/это витрина всех регламентов/i)).toBeInTheDocument()
  })

  it('downloads YAML via blob when the YAML button is clicked', async () => {
    const user = userEvent.setup()
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:yaml')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    window.history.pushState({}, '', '/regulations')
    render(<App />)

    await user.click(screen.getByTestId('download-yaml'))

    expect(createUrlSpy).toHaveBeenCalledTimes(1)
    const blob = createUrlSpy.mock.calls[0][0] as Blob
    expect(blob.type).toContain('yaml')

    const text = await blob.text()
    expect(text).toContain('version:')
    expect(text).toContain('doNotByRisk:')
    expect(text).toContain('edds-mode-change:')

    vi.restoreAllMocks()
  })

  it('downloads JSON of the parsed regulations', async () => {
    const user = userEvent.setup()
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:json')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    window.history.pushState({}, '', '/regulations')
    render(<App />)

    await user.click(screen.getByTestId('download-json'))

    const blob = createUrlSpy.mock.calls[0][0] as Blob
    const text = await blob.text()
    const parsed = JSON.parse(text)
    expect(parsed.version).toBe('1.0')
    expect(parsed.doNotByRisk.thermal.length).toBeGreaterThan(0)

    vi.restoreAllMocks()
  })
})

describe('SigmaAssist — entry points to trainer and regulations', () => {
  it('shows a Trainer button that navigates to /trainer/:id when the scenario has interactiveMeta', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/operator/edds-mode-change')
    render(<App />)

    const trainerButton = await screen.findByTestId('open-trainer')
    expect(trainerButton).toBeEnabled()
    await user.click(trainerButton)

    expect(await screen.findByTestId('trainer-shell')).toBeInTheDocument()
  })

  it('disables the Trainer button for scenarios without interactiveMeta', async () => {
    window.history.pushState({}, '', '/operator/dormitory-flood')
    render(<App />)

    const trainerButton = await screen.findByTestId('open-trainer')
    expect(trainerButton).toBeDisabled()
  })

  it('shows a Regulations button that navigates to /regulations', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/operator/thermal-incident')
    render(<App />)

    const regsButton = await screen.findByTestId('open-regulations')
    await user.click(regsButton)

    expect(await screen.findByTestId('regulations-shell')).toBeInTheDocument()
  })
})

describe('TrainerScreen — help hint banner and info button', () => {
  it('renders the hint banner and trainer-help info button in the header', () => {
    window.history.pushState({}, '', '/trainer/edds-mode-change')
    render(<App />)

    expect(screen.getByTestId('trainer-hint-banner')).toBeInTheDocument()
    expect(screen.getByTestId('trainer-help')).toBeInTheDocument()
  })

  it('opens the help modal with a description of trainer flow', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/trainer/edds-mode-change')
    render(<App />)

    await user.click(screen.getByTestId('trainer-help'))

    const modal = screen.getByTestId('info-modal')
    expect(within(modal).getByText(/как работает тренажёр sigma/i)).toBeInTheDocument()
    expect(within(modal).getByText(/подсказка доступна на каждом шаге/i)).toBeInTheDocument()
  })
})
