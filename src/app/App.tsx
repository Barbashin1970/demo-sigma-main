import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'

import { resolveScenarioId } from '../scenarios'
import type { DisplayMode } from '../scenarios'
import { usePlaybackActions, usePlaybackState, usePlaybackSync, useScenarioRoute } from '../features/scenario-player/runtime'
import {
  DisplayDashboard,
  InvalidScenarioState,
  LoadingDashboard,
  OperatorDashboard,
} from './components/dashboard'
import { RegulationsScreen } from './components/regulations-screen'
import { TrainerScreen } from './components/trainer-screen'

/** Сценарий по умолчанию для маршрутов без явного scenarioId. */
const DEFAULT_SCENARIO_ID = 'thermal-incident'

const SceneRoute = ({ mode }: { mode: DisplayMode }) => {
  const { scenarioId } = useParams()
  const state = usePlaybackState()
  const actions = usePlaybackActions()
  // Если scenarioId не задан в URL — используем сценарий по умолчанию.
  // Так `/operator` показывает рабочий экран без редиректа на длинный URL.
  const resolvedScenarioId = resolveScenarioId(scenarioId) ?? (scenarioId ? null : DEFAULT_SCENARIO_ID)

  usePlaybackSync(mode)
  useScenarioRoute(resolvedScenarioId)

  if (!resolvedScenarioId) {
    return <InvalidScenarioState />
  }

  if (state.selectedScenarioId !== resolvedScenarioId) {
    return <LoadingDashboard />
  }

  if (mode === 'display') {
    return <DisplayDashboard state={state} />
  }

  return (
    <OperatorDashboard
      onReset={actions.reset}
      onStep={actions.nextStep}
      state={state}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/operator" />} path="/" />
        <Route element={<SceneRoute mode="operator" />} path="/operator" />
        <Route element={<SceneRoute mode="operator" />} path="/operator/:scenarioId" />
        <Route element={<SceneRoute mode="display" />} path="/display" />
        <Route element={<SceneRoute mode="display" />} path="/display/:scenarioId" />
        <Route element={<TrainerScreen />} path="/trainer/:scenarioId" />
        <Route element={<RegulationsScreen />} path="/regulations" />
        <Route element={<Navigate replace to="/operator" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}
