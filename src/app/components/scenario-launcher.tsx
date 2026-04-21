import { ArrowLeft, Monitor, Play, X } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { scenarioIds, scenarios as scenarioDefinitions } from '../../scenarios'
import type { DisplayMode, RiskKind, ScenarioDefinition, ScenarioId } from '../../scenarios'
import { listVenuesByPersona, personaLabel, venues } from '../venues'
import type { Persona, VenueMeta } from '../venues'
import { IconGlyph } from './icon-glyph'
import { criticalityAccentBorder, criticalityText, riskIcon } from './icons'

const riskKindLabel: Record<RiskKind, string> = {
  thermal: 'Термический',
  water: 'Водный',
  air: 'Воздух',
  security: 'Безопасность',
  operational: 'Операционный',
}

const allRiskKinds: RiskKind[] = ['thermal', 'water', 'air', 'security', 'operational']

type PersonaFilter = Persona | 'all'

const personaFilterLabel: Record<PersonaFilter, string> = {
  all: 'Все',
  ...personaLabel,
}

const personaFilterOptions: PersonaFilter[] = ['all', 'campus', 'city', 'municipal']

type LauncherCard = {
  venue: VenueMeta
  scenarios: Array<{ definition: ScenarioDefinition; riskKind: RiskKind }>
}

type Step = 'filters' | 'results'

const DEFAULT_PERSONA: PersonaFilter = 'all'

const isFilterChanged = (persona: PersonaFilter, risks: Set<RiskKind>) =>
  persona !== DEFAULT_PERSONA || risks.size !== allRiskKinds.length

const buildCards = (
  personaFilter: PersonaFilter,
  riskFilter: Set<RiskKind>,
): LauncherCard[] => {
  const activePersona: Persona | null = personaFilter === 'all' ? null : personaFilter
  const visibleVenues = listVenuesByPersona(activePersona)

  const cards: LauncherCard[] = []
  for (const venue of visibleVenues) {
    const scenariosHere = scenarioIds
      .map((id) => scenarioDefinitions[id])
      .filter((def) => def.venueId === venue.id)
      .map((def) => ({ definition: def, riskKind: def.steps[0].incident.riskKind }))
      .filter((item) => riskFilter.has(item.riskKind))

    if (scenariosHere.length > 0) {
      cards.push({ venue, scenarios: scenariosHere })
    }
  }
  return cards
}

const describeActiveFilters = (personaFilter: PersonaFilter, riskFilter: Set<RiskKind>) => {
  const parts: string[] = []
  if (personaFilter !== 'all') {
    parts.push(personaLabel[personaFilter])
  }
  if (riskFilter.size !== allRiskKinds.length) {
    const selectedRisks = allRiskKinds.filter((kind) => riskFilter.has(kind)).map((k) => riskKindLabel[k])
    parts.push(selectedRisks.length === 0 ? 'без риск-типов' : selectedRisks.join(', '))
  }
  return parts.length === 0 ? 'Все сценарии' : parts.join(' · ')
}

export interface ScenarioLauncherProps {
  open: boolean
  onClose: () => void
  currentScenarioId: ScenarioId
  currentMode: DisplayMode
}

export const ScenarioLauncher = ({
  open,
  onClose,
  currentScenarioId,
  currentMode,
}: ScenarioLauncherProps) => {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('filters')
  const [personaFilter, setPersonaFilter] = useState<PersonaFilter>(DEFAULT_PERSONA)
  const [riskFilter, setRiskFilter] = useState<Set<RiskKind>>(new Set(allRiskKinds))

  const cards = useMemo(() => buildCards(personaFilter, riskFilter), [personaFilter, riskFilter])

  const resultScenarioCount = useMemo(
    () => cards.reduce((acc, card) => acc + card.scenarios.length, 0),
    [cards],
  )

  /** Сколько сценариев получит пользователь при выборе конкретной персоны — с учётом текущего риск-фильтра. */
  const personaCounts = useMemo<Record<PersonaFilter, number>>(() => {
    const counts: Record<PersonaFilter, number> = { all: 0, campus: 0, city: 0, municipal: 0 }
    for (const id of scenarioIds) {
      const def = scenarioDefinitions[id]
      const kind = def.steps[0].incident.riskKind
      if (!riskFilter.has(kind)) continue
      counts.all += 1
      if (def.venueId) {
        const venue = venues[def.venueId]
        if (venue) counts[venue.persona] += 1
      }
    }
    return counts
  }, [riskFilter])

  /** Сколько сценариев получит пользователь с конкретным риск-кинд — с учётом текущей персоны. */
  const riskCounts = useMemo<Record<RiskKind, number>>(() => {
    const counts: Record<RiskKind, number> = { thermal: 0, water: 0, air: 0, security: 0, operational: 0 }
    const activePersona: Persona | null = personaFilter === 'all' ? null : personaFilter
    for (const id of scenarioIds) {
      const def = scenarioDefinitions[id]
      if (activePersona !== null) {
        const venue = def.venueId ? venues[def.venueId] : null
        if (!venue || venue.persona !== activePersona) continue
      }
      const kind = def.steps[0].incident.riskKind
      counts[kind] += 1
    }
    return counts
  }, [personaFilter])

  const filterChanged = isFilterChanged(personaFilter, riskFilter)
  const canApply = resultScenarioCount > 0

  const toggleRisk = (kind: RiskKind) => {
    setRiskFilter((prev) => {
      const next = new Set(prev)
      if (next.has(kind)) {
        next.delete(kind)
      } else {
        next.add(kind)
      }
      return next
    })
  }

  const handleApply = () => {
    if (!canApply) return
    setStep('results')
  }

  const handleClose = () => {
    onClose()
    // Reset wizard state for the next open
    setStep('filters')
  }

  const handleSelect = (scenarioId: ScenarioId, mode: DisplayMode) => {
    const url = `/${mode}/${scenarioId}`
    // Режим видеостены открывается в новой вкладке, чтобы оператор мог
    // перенести её мышкой на стеновой экран/проектор. Вкладка оператора
    // остаётся на ноутбуке и продолжает управлять сценарием.
    if (mode === 'display') {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      navigate(url)
    }
    handleClose()
  }

  if (!open) return null

  return (
    <div
      aria-label="Каталог сценариев"
      aria-modal
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-950/40 px-4 py-8 backdrop-blur-sm"
      data-testid="scenario-launcher"
      role="dialog"
    >
      <section
        className="flex w-full max-w-6xl flex-col rounded-[2rem] border border-white/60 bg-white/95 p-6 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.32)] md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-500">
              Каталог
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              {step === 'filters' ? 'Сценарии Sigma' : 'Отобранные сценарии'}
            </h2>
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-zinc-600">
              {step === 'filters'
                ? 'Выберите персону и типы инцидентов. Применить — перейти к списку подходящих сценариев.'
                : `Под текущие фильтры: ${describeActiveFilters(personaFilter, riskFilter)}.`}
            </p>
          </div>
          <button
            aria-label="Закрыть каталог"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
            onClick={handleClose}
            type="button"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        {step === 'filters' ? (
          <FiltersStep
            canApply={canApply}
            filterChanged={filterChanged}
            onApply={handleApply}
            onTogglePersona={setPersonaFilter}
            onToggleRisk={toggleRisk}
            personaCounts={personaCounts}
            personaFilter={personaFilter}
            resultScenarioCount={resultScenarioCount}
            riskCounts={riskCounts}
            riskFilter={riskFilter}
            venueCount={cards.length}
          />
        ) : (
          <ResultsStep
            cards={cards}
            currentMode={currentMode}
            currentScenarioId={currentScenarioId}
            onBack={() => setStep('filters')}
            onSelect={handleSelect}
          />
        )}
      </section>
    </div>
  )
}

const FiltersStep = ({
  personaFilter,
  riskFilter,
  personaCounts,
  riskCounts,
  onTogglePersona,
  onToggleRisk,
  onApply,
  canApply,
  filterChanged,
  resultScenarioCount,
  venueCount,
}: {
  personaFilter: PersonaFilter
  riskFilter: Set<RiskKind>
  personaCounts: Record<PersonaFilter, number>
  riskCounts: Record<RiskKind, number>
  onTogglePersona: (p: PersonaFilter) => void
  onToggleRisk: (k: RiskKind) => void
  onApply: () => void
  canApply: boolean
  filterChanged: boolean
  resultScenarioCount: number
  venueCount: number
}) => (
  <>
    <div className="mt-6 space-y-3" data-testid="scenario-launcher-filters">
      <FilterRow label="Персона">
        {personaFilterOptions.map((option) => {
          const active = personaFilter === option
          const count = personaCounts[option]
          const isEmpty = count === 0
          return (
            <button
              key={option}
              aria-pressed={active}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] transition',
                isEmpty
                  ? 'border-zinc-200 bg-zinc-50 text-zinc-300'
                  : active
                    ? 'border-zinc-950 bg-zinc-950 text-zinc-50'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400',
              )}
              data-empty={isEmpty ? 'true' : 'false'}
              onClick={() => onTogglePersona(option)}
              type="button"
            >
              {personaFilterLabel[option]}
            </button>
          )
        })}
      </FilterRow>
      <FilterRow label="Риск">
        {allRiskKinds.map((kind) => {
          const active = riskFilter.has(kind)
          const count = riskCounts[kind]
          const isEmpty = count === 0
          return (
            <button
              key={kind}
              aria-pressed={active}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                isEmpty
                  ? 'border-zinc-200 bg-zinc-50 text-zinc-300'
                  : active
                    ? 'border-zinc-950 bg-zinc-950 text-zinc-50'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400',
              )}
              data-empty={isEmpty ? 'true' : 'false'}
              onClick={() => onToggleRisk(kind)}
              type="button"
            >
              <IconGlyph of={riskIcon[kind]} size={14} weight="duotone" />
              {riskKindLabel[kind]}
            </button>
          )
        })}
      </FilterRow>
    </div>

    <div className="mt-6 rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/80 px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Под текущие фильтры</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-700">
        {canApply
          ? `Найдено ${resultScenarioCount} ${declineScenarios(resultScenarioCount)} в ${venueCount} ${declineVenues(venueCount)}.`
          : 'Нет сценариев под выбранные фильтры. Расширьте риск-типы или смените персону.'}
      </p>
    </div>

    <div className="mt-6 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
      <button
        aria-disabled={!canApply}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-[1.1rem] px-6 py-3 text-sm font-semibold transition',
          !canApply
            ? 'cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400'
            : filterChanged
              ? 'border border-zinc-950 bg-zinc-950 text-zinc-50 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.55)] hover:bg-zinc-800'
              : 'border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900',
        )}
        data-testid="launcher-apply"
        onClick={onApply}
        type="button"
      >
        {filterChanged ? 'Применить фильтры' : 'Показать все сценарии'}
      </button>
    </div>
  </>
)

const ResultsStep = ({
  cards,
  currentScenarioId,
  currentMode,
  onBack,
  onSelect,
}: {
  cards: LauncherCard[]
  currentScenarioId: ScenarioId
  currentMode: DisplayMode
  onBack: () => void
  onSelect: (scenarioId: ScenarioId, mode: DisplayMode) => void
}) => (
  <>
    <div className="mt-5 flex items-center justify-between gap-3">
      <button
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
        data-testid="launcher-back-to-filters"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft size={14} weight="bold" />
        К фильтрам
      </button>
    </div>

    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.length === 0 ? (
        <p className="col-span-full rounded-[1.4rem] border border-dashed border-zinc-300 bg-white/70 px-5 py-8 text-center text-sm text-zinc-500">
          Под выбранные фильтры сценариев нет. Вернитесь к фильтрам и расширьте выборку.
        </p>
      ) : (
        cards.map((card) => (
          <VenueCard
            key={card.venue.id}
            card={card}
            currentMode={currentMode}
            currentScenarioId={currentScenarioId}
            onSelect={onSelect}
          />
        ))
      )}
    </div>
  </>
)

const declineScenarios = (n: number): string => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'сценарий'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'сценария'
  return 'сценариев'
}

const declineVenues = (n: number): string => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'объекте'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'объектах'
  return 'объектах'
}

const FilterRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="mr-1 min-w-[72px] text-[10px] font-mono uppercase tracking-[0.24em] text-zinc-500">
      {label}
    </span>
    {children}
  </div>
)

const VenueCard = ({
  card,
  currentScenarioId,
  currentMode,
  onSelect,
}: {
  card: LauncherCard
  currentScenarioId: ScenarioId
  currentMode: DisplayMode
  onSelect: (scenarioId: ScenarioId, mode: DisplayMode) => void
}) => {
  const VenueIcon = card.venue.icon
  return (
    <article
      className="flex flex-col rounded-[1.6rem] border border-zinc-200/90 bg-white p-5 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.25)]"
      data-testid={`venue-card-${card.venue.id}`}
    >
      <header className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-zinc-50 text-zinc-700">
          <IconGlyph of={VenueIcon} size={20} weight="duotone" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{card.venue.district}</p>
          <h3 className="mt-1 text-sm font-semibold leading-snug text-zinc-950">{card.venue.label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{card.venue.shortDescription}</p>
        </div>
      </header>

      <div className="mt-4 space-y-3">
        {card.scenarios.map(({ definition, riskKind }) => {
          const isCurrent = definition.id === currentScenarioId
          const RiskIcon = riskIcon[riskKind]
          return (
            <div
              key={definition.id}
              className={clsx(
                'rounded-[1.1rem] border bg-zinc-50/60 px-4 py-3',
                isCurrent
                  ? clsx('border-l-4', criticalityAccentBorder.watch)
                  : 'border-zinc-200/80',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={clsx('inline-flex h-5 w-5 items-center justify-center rounded-full', criticalityText.elevated)}>
                      <IconGlyph of={RiskIcon} size={12} weight="fill" />
                    </span>
                    <p className="truncate text-sm font-semibold text-zinc-950">{definition.tabLabel}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                    {definition.subtitle}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-700">
                    Открыт
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex gap-2">
                <LaunchButton
                  ariaLabel="Открыть сценарий в режиме оператора: управление шагами, задачами, эскалацией"
                  highlighted={!isCurrent || currentMode !== 'operator'}
                  icon={<Play size={12} weight="fill" />}
                  label="Открыть"
                  onClick={() => onSelect(definition.id, 'operator')}
                />
                <LaunchButton
                  ariaLabel="Открыть вкладку видеостены в новом окне браузера: только показ, можно перетащить на стеновой экран"
                  highlighted={false}
                  icon={<Monitor size={12} weight="duotone" />}
                  label="На видеостену"
                  onClick={() => onSelect(definition.id, 'display')}
                />
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

const LaunchButton = ({
  label,
  ariaLabel,
  icon,
  highlighted,
  onClick,
}: {
  label: string
  ariaLabel: string
  icon: React.ReactNode
  highlighted: boolean
  onClick: () => void
}) => (
  <button
    aria-label={ariaLabel}
    className={clsx(
      'inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
      highlighted
        ? 'border-zinc-950 bg-zinc-950 text-zinc-50 hover:bg-zinc-800'
        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400',
    )}
    onClick={onClick}
    type="button"
  >
    {icon}
    {label}
  </button>
)
