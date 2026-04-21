import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { playbackStore } from '../features/scenario-player/runtime'
import App from './App'

describe('App routes', () => {
  beforeEach(() => {
    playbackStore.selectScenario('thermal-incident')
    playbackStore.reset()
  })

  it('renders the leader city dashboard on the legacy hospital-fire route', () => {
    window.history.pushState({}, '', '/operator/hospital-fire')

    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: /опасность пожара в серверной университета/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getAllByTestId('scenario-tabs').at(-1)).toBeInTheDocument()
    expect(screen.queryByTestId('city-summary')).not.toBeInTheDocument()
    expect(screen.queryByTestId('object-summary')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('decision-summary').at(-1)).toBeInTheDocument()
    expect(screen.getAllByTestId('forecast-summary').at(-1)).toBeInTheDocument()
    expect(screen.queryByText(/смартфонный пульт руководителя/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /опасность пожара/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /прорыв теплового ввода/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /качество воздуха/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^термический инцидент$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /запуск/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /пауза/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /шаг/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /сброс/i })).toBeInTheDocument()
    expect(screen.getByText(/этап 1 из 5/i)).toBeInTheDocument()
    expect(screen.queryByText(/действия оператора/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^сценарии$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ход сценария/i)).not.toBeInTheDocument()
  })

  it('resets event feed and progress when switching scenario tabs', async () => {
    const user = userEvent.setup()

    window.history.pushState({}, '', '/operator/thermal-incident')

    render(<App />)

    await user.click(screen.getAllByRole('button', { name: /шаг/i })[0])

    const thermalShell = screen.getAllByTestId('operator-shell').at(-1)

    expect(thermalShell).toBeDefined()
    expect(within(thermalShell!).getByText(/этап 2 из 5/i)).toBeInTheDocument()
    expect(within(thermalShell!).getByText(/рост температуры в электрощитовой/i)).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /прорыв теплового ввода/i })[0])

    await screen.findByRole('heading', { name: /прорыв теплового ввода/i })

    const waterShell = screen.getAllByTestId('operator-shell').at(-1)

    expect(waterShell).toBeDefined()
    expect(within(waterShell!).queryByText(/рост температуры в электрощитовой/i)).not.toBeInTheDocument()
    expect(within(waterShell!).getByText(/этап 1 из 5/i)).toBeInTheDocument()
    expect(within(waterShell!).getByText(/городской контур и тепловой ввод стабильны/i)).toBeInTheDocument()
  })

  it('keeps secondary context hidden until the user expands details', () => {
    window.history.pushState({}, '', '/operator/hospital-fire')

    render(<App />)

    expect(screen.queryByTestId('city-summary')).not.toBeInTheDocument()
    expect(screen.queryByTestId('object-summary')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('decision-summary').at(-1)).toBeInTheDocument()
    expect(screen.getAllByTestId('forecast-summary').at(-1)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /подробности решения/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /подробности прогноза/i }).length).toBeGreaterThan(0)
    expect(screen.queryByText(/медицинский объект работает без отклонений, внешняя инфраструктура стабильна/i)).not.toBeInTheDocument()
  })

  it('renders scenario tabs without risk badges', () => {
    window.history.pushState({}, '', '/operator/hospital-fire')

    render(<App />)

    const scenarioTabs = screen.getAllByTestId('scenario-tabs').at(-1)

    expect(scenarioTabs).toBeDefined()
    expect(within(scenarioTabs!).queryByText(/термический риск/i)).not.toBeInTheDocument()
    expect(within(scenarioTabs!).queryByText(/водяной риск/i)).not.toBeInTheDocument()
    expect(within(scenarioTabs!).queryByText(/воздушная опасность/i)).not.toBeInTheDocument()
  })
})
