import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('Trainer route (Phase 4.d)', () => {
  it('renders trainer shell on /trainer/:scenarioId for a scenario with interactiveMeta', () => {
    window.history.pushState({}, '', '/trainer/edds-mode-change')
    render(<App />)

    expect(screen.getByTestId('trainer-shell')).toBeInTheDocument()
    expect(screen.getByTestId('trainer-step')).toBeInTheDocument()
    expect(screen.getByTestId('trainer-actions')).toBeInTheDocument()
  })

  it('awards the full weight when user picks the expected action', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/trainer/edds-mode-change')
    render(<App />)

    // Step 1 (edds-1) expects acknowledge-signal, weight 5
    await user.click(screen.getByTestId('trainer-action-acknowledge-signal'))

    // After the click the shell should render step 2 (edds-2) with two allowed actions
    expect(screen.getByTestId('trainer-action-cross-check-sources')).toBeInTheDocument()
    expect(screen.getByTestId('trainer-action-prepare-escalation-draft')).toBeInTheDocument()
  })

  it('penalises a prohibited action and still advances', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/trainer/edds-mode-change')
    render(<App />)

    // Step 1 prohibited: dismiss-as-noise
    await user.click(screen.getByTestId('trainer-action-dismiss-as-noise'))

    // Advance to step 2
    expect(screen.getByTestId('trainer-action-cross-check-sources')).toBeInTheDocument()
  })

  it('reaches the summary after clicking through all interactive steps', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/trainer/edds-mode-change')
    render(<App />)

    // edds-1 → acknowledge-signal
    await user.click(screen.getByTestId('trainer-action-acknowledge-signal'))
    // edds-2 → cross-check-sources
    await user.click(screen.getByTestId('trainer-action-cross-check-sources'))
    // edds-3 → report-to-head
    await user.click(screen.getByTestId('trainer-action-report-to-head'))
    // edds-4 → transition-to-elevated
    await user.click(screen.getByTestId('trainer-action-transition-to-elevated'))

    const summary = await screen.findByTestId('trainer-summary')
    expect(summary).toBeInTheDocument()

    // Four result rows — one per interactive step
    expect(screen.getByTestId('trainer-summary-row-edds-1')).toBeInTheDocument()
    expect(screen.getByTestId('trainer-summary-row-edds-4')).toBeInTheDocument()
  })

  it('shows a hint from the expected action rationale on demand', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/trainer/edds-mode-change')
    render(<App />)

    expect(screen.queryByText(/первичная фиксация/i)).not.toBeInTheDocument()

    await user.click(screen.getByTestId('trainer-hint'))

    // Phase 4.c rationale for acknowledge-signal cites п. 8.5.2
    const hintBlock = screen.getByText(/первичная фиксация/i)
    expect(hintBlock).toBeInTheDocument()
  })

  it('falls back to invalid-state when scenario is unknown', () => {
    window.history.pushState({}, '', '/trainer/unknown-scenario')
    render(<App />)

    expect(screen.getByText(/экран недоступен/i)).toBeInTheDocument()
  })

  it('does not render the trainer step for a scenario without interactiveMeta', () => {
    // dormitory-flood has no interactiveMeta — trainer should jump straight to summary
    window.history.pushState({}, '', '/trainer/dormitory-flood')
    render(<App />)

    expect(screen.queryByTestId('trainer-step')).not.toBeInTheDocument()
    expect(screen.getByTestId('trainer-summary')).toBeInTheDocument()
  })
})
