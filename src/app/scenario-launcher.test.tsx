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

  it('renders venue cards for every persona when filter is "Все"', () => {
    renderLauncher()

    expect(screen.getByTestId('venue-card-ngu-server')).toBeInTheDocument()
    expect(screen.getByTestId('venue-card-city-clinic')).toBeInTheDocument()
    expect(screen.getByTestId('venue-card-koltsovo-edds')).toBeInTheDocument()
  })

  it('filters venues by persona', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByRole('button', { name: /муниципалитет/i }))

    expect(screen.getByTestId('venue-card-koltsovo-edds')).toBeInTheDocument()
    expect(screen.queryByTestId('venue-card-ngu-server')).not.toBeInTheDocument()
    expect(screen.queryByTestId('venue-card-city-clinic')).not.toBeInTheDocument()
  })

  it('filters scenarios by risk-kind toggle', async () => {
    const user = userEvent.setup()
    renderLauncher()

    // Toggle off all risks except thermal — expect only thermal venue visible
    await user.click(screen.getByRole('button', { name: /водный/i }))
    await user.click(screen.getByRole('button', { name: /воздух/i }))
    await user.click(screen.getByRole('button', { name: /безопасность/i }))
    await user.click(screen.getByRole('button', { name: /операционный/i }))

    expect(screen.getByTestId('venue-card-ngu-server')).toBeInTheDocument()
    expect(screen.queryByTestId('venue-card-academ-forest')).not.toBeInTheDocument()
    expect(screen.queryByTestId('venue-card-koltsovo-edds')).not.toBeInTheDocument()
  })

  it('highlights the currently opened scenario with an «Открыт» badge', () => {
    renderLauncher({ currentScenarioId: 'edds-mode-change' })

    const eddsCard = screen.getByTestId('venue-card-koltsovo-edds')
    expect(within(eddsCard).getByText(/открыт/i)).toBeInTheDocument()
  })

  it('closes the launcher on pressing the close button', async () => {
    const user = userEvent.setup()
    const { onClose } = renderLauncher()

    await user.click(screen.getByRole('button', { name: /закрыть каталог/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows empty-state when all risk filters are off', async () => {
    const user = userEvent.setup()
    renderLauncher()

    for (const label of [/термический/i, /водный/i, /воздух/i, /безопасность/i, /операционный/i]) {
      await user.click(screen.getByRole('button', { name: label }))
    }

    expect(screen.getByText(/под выбранные фильтры сценариев нет/i)).toBeInTheDocument()
  })
})
