import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'

import { resolveScenarioId } from '../scenarios'
import type { DisplayMode } from '../scenarios'
import { usePlaybackActions, usePlaybackState, usePlaybackSync, useScenarioRoute } from '../features/scenario-player/runtime'
import {
  DisplayDashboard,
  InvalidScenarioState,
  LoadingDashboard,
  OperatorDashboard,
} from './components/dashboard'

const SceneRoute = ({ mode }: { mode: DisplayMode }) => {
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const state = usePlaybackState()
  const actions = usePlaybackActions()
  const resolvedScenarioId = resolveScenarioId(scenarioId)

  usePlaybackSync(mode)
  useScenarioRoute(resolvedScenarioId)

  if (!resolvedScenarioId) {
    return <InvalidScenarioState />
  }

  const handleScenarioSelect = (nextScenarioId: typeof state.selectedScenarioId) => {
    navigate(`/${mode}/${nextScenarioId}`)
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
      onScenarioSelect={handleScenarioSelect}
      onStep={actions.nextStep}
      state={state}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/operator/hospital-fire" />} path="/" />
        <Route element={<SceneRoute mode="operator" />} path="/operator/:scenarioId" />
        <Route element={<SceneRoute mode="display" />} path="/display/:scenarioId" />
        <Route element={<Navigate replace to="/operator/hospital-fire" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}
