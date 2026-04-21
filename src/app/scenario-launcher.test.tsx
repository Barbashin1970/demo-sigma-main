import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ScenarioLauncher } from './components/scenario-launcher'

const renderLauncher = (overrides: Partial<Parameters<typeof ScenarioLauncher>[0]> = {}) => {
  const onClose = vi.fn()
  render(
    <MemoryRouter>
      <ScenarioLauncher
        currentMode="operator"
        currentScenarioId="thermal-incident"
        onClose={onClose}
        open
        {...overrides}
      />
    </MemoryRouter>,
  )
  return { onClose }
}

describe('ScenarioLauncher', () => {
  it('does not render when closed', () => {
    render(
      <MemoryRouter>
        <ScenarioLauncher
          currentMode="operator"
          currentScenarioId="thermal-incident"
          onClose={() => undefined}
          open={false}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByTestId('scenario-launcher')).not.toBeInTheDocument()
  })

  it('opens on the filter step with Apply disabled-looking until changes', () => {
    renderLauncher()

    expect(screen.getByTestId('scenario-launcher-filters')).toBeInTheDocument()
    expect(screen.queryByTestId('venue-card-ngu-server')).not.toBeInTheDocument()

    const applyButton = screen.getByTestId('launcher-apply')
    expect(applyButton).toHaveTextContent(/показать все сценарии/i)
    // When filters are in default state the Apply button should NOT have the highlighted black background
    expect(applyButton.className).not.toMatch(/bg-zinc-950/)
  })

  it('highlights Apply after a filter is changed', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByRole('button', { name: /муниципалитет/i }))

    const applyButton = screen.getByTestId('launcher-apply')
    expect(applyButton).toHaveTextContent(/применить фильтры/i)
    expect(applyButton.className).toMatch(/bg-zinc-950/)
  })

  it('shows zero-state and blocks Apply when all risks are toggled off', async () => {
    const user = userEvent.setup()
    renderLauncher()

    for (const label of [/термический/i, /водный/i, /воздух/i, /безопасность/i, /операционный/i]) {
      await user.click(screen.getByRole('button', { name: label }))
    }

    expect(screen.getByText(/нет сценариев под выбранные фильтры/i)).toBeInTheDocument()
    const applyButton = screen.getByTestId('launcher-apply')
    expect(applyButton).toHaveAttribute('aria-disabled', 'true')
  })

  it('transitions to results step on Apply and renders cards', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByTestId('launcher-apply'))

    expect(screen.getByTestId('venue-card-ngu-server')).toBeInTheDocument()
    expect(screen.getByTestId('venue-card-city-clinic')).toBeInTheDocument()
    expect(screen.getByTestId('venue-card-koltsovo-edds')).toBeInTheDocument()
    expect(screen.getByTestId('launcher-back-to-filters')).toBeInTheDocument()
  })

  it('applies the persona filter on transition', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByRole('button', { name: /муниципалитет/i }))
    await user.click(screen.getByTestId('launcher-apply'))

    expect(screen.getByTestId('venue-card-koltsovo-edds')).toBeInTheDocument()
    expect(screen.queryByTestId('venue-card-ngu-server')).not.toBeInTheDocument()
    expect(screen.queryByTestId('venue-card-city-clinic')).not.toBeInTheDocument()
  })

  it('highlights the currently opened scenario with an «Открыт» badge in results', async () => {
    const user = userEvent.setup()
    renderLauncher({ currentScenarioId: 'edds-mode-change' })

    await user.click(screen.getByTestId('launcher-apply'))

    const eddsCard = screen.getByTestId('venue-card-koltsovo-edds')
    expect(within(eddsCard).getByText(/^открыт$/i)).toBeInTheDocument()
  })

  it('returns from results to filters via «К фильтрам»', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByTestId('launcher-apply'))
    await user.click(screen.getByTestId('launcher-back-to-filters'))

    expect(screen.getByTestId('scenario-launcher-filters')).toBeInTheDocument()
    expect(screen.queryByTestId('venue-card-ngu-server')).not.toBeInTheDocument()
  })

  it('calls onClose when the cross button is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = renderLauncher()

    await user.click(screen.getByRole('button', { name: /закрыть каталог/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('visually mutes risk chips that have zero scenarios under current persona', async () => {
    const user = userEvent.setup()
    renderLauncher()

    // Municipal persona has only "operational" scenarios — other risk chips must mute
    await user.click(screen.getByRole('button', { name: /муниципалитет/i }))

    const thermalChip = screen.getByRole('button', { name: /термический/i })
    const operationalChip = screen.getByRole('button', { name: /операционный/i })

    expect(thermalChip).toHaveAttribute('data-empty', 'true')
    expect(operationalChip).toHaveAttribute('data-empty', 'false')
  })

  it('visually mutes persona chips that have zero scenarios under current risk selection', async () => {
    const user = userEvent.setup()
    renderLauncher()

    // Leave only "operational" risk — campus and city personas become empty
    for (const label of [/термический/i, /водный/i, /воздух/i, /безопасность/i]) {
      await user.click(screen.getByRole('button', { name: label }))
    }

    expect(screen.getByRole('button', { name: /кампус нгу/i })).toHaveAttribute('data-empty', 'true')
    expect(screen.getByRole('button', { name: /^город$/i })).toHaveAttribute('data-empty', 'true')
    expect(screen.getByRole('button', { name: /муниципалитет/i })).toHaveAttribute('data-empty', 'false')
  })

  it('renders clear action labels «Открыть» and «На видеостену» on each scenario card', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByTestId('launcher-apply'))

    const serverCard = screen.getByTestId('venue-card-ngu-server')
    expect(within(serverCard).getByText(/^открыть$/i)).toBeInTheDocument()
    expect(within(serverCard).getByText(/на видеостену/i)).toBeInTheDocument()
  })

  it('opens display-mode scenario in a new tab, keeping the current tab intact', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    renderLauncher()

    await user.click(screen.getByTestId('launcher-apply'))
    const serverCard = screen.getByTestId('venue-card-ngu-server')
    await user.click(
      within(serverCard).getByRole('button', {
        name: /открыть вкладку видеостены в новом окне/i,
      }),
    )

    expect(openSpy).toHaveBeenCalledWith(
      '/display/thermal-incident',
      '_blank',
      'noopener,noreferrer',
    )

    openSpy.mockRestore()
  })

  it('does not call window.open for «Открыть» (operator mode navigates in place)', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    renderLauncher({ currentScenarioId: 'edds-mode-change' })

    await user.click(screen.getByTestId('launcher-apply'))
    const serverCard = screen.getByTestId('venue-card-ngu-server')
    await user.click(
      within(serverCard).getByRole('button', {
        name: /открыть сценарий в режиме оператора/i,
      }),
    )

    expect(openSpy).not.toHaveBeenCalled()

    openSpy.mockRestore()
  })
})
