import { X } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { scenarioIds, scenarios as scenarioDefinitions } from '../../scenarios'
import type { DisplayMode, RiskKind, ScenarioDefinition, ScenarioId } from '../../scenarios'
import { listVenuesByPersona, personaLabel } from '../venues'
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
  const [personaFilter, setPersonaFilter] = useState<PersonaFilter>('all')
  const [riskFilter, setRiskFilter] = useState<Set<RiskKind>>(new Set(allRiskKinds))

  const cards = useMemo(() => buildCards(personaFilter, riskFilter), [personaFilter, riskFilter])

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

  const handleSelect = (scenarioId: ScenarioId, mode: DisplayMode) => {
    onClose()
    navigate(`/${mode}/${scenarioId}`)
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
        className="w-full max-w-6xl rounded-[2rem] border border-white/60 bg-white/95 p-6 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.32)] md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-500">Каталог</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              Сценарии Sigma
            </h2>
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-zinc-600">
              Выберите объект и тип инцидента. Каждый сценарий доступен в режимах оператора и дисплея.
            </p>
          </div>
          <button
            aria-label="Закрыть каталог"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
            onClick={onClose}
            type="button"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        <div className="mt-6 space-y-3" data-testid="scenario-launcher-filters">
          <FilterRow label="Персона">
            {personaFilterOptions.map((option) => {
              const active = personaFilter === option
              return (
                <button
                  key={option}
                  aria-pressed={active}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] transition',
                    active
                      ? 'border-zinc-950 bg-zinc-950 text-zinc-50'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400',
                  )}
                  onClick={() => setPersonaFilter(option)}
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
              return (
                <button
                  key={kind}
                  aria-pressed={active}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    active
                      ? 'border-zinc-950 bg-zinc-950 text-zinc-50'
                      : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400',
                  )}
                  onClick={() => toggleRisk(kind)}
                  type="button"
                >
                  <IconGlyph of={riskIcon[kind]} size={14} weight="duotone" />
                  {riskKindLabel[kind]}
                </button>
              )
            })}
          </FilterRow>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.length === 0 ? (
            <p className="col-span-full rounded-[1.4rem] border border-dashed border-zinc-300 bg-white/70 px-5 py-8 text-center text-sm text-zinc-500">
              Под выбранные фильтры сценариев нет. Расширьте риск-выборку или переключите персону.
            </p>
          ) : (
            cards.map((card) => (
              <VenueCard
                key={card.venue.id}
                card={card}
                currentScenarioId={currentScenarioId}
                currentMode={currentMode}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
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
                  label="Оператор"
                  highlighted={!isCurrent || currentMode !== 'operator'}
                  onClick={() => onSelect(definition.id, 'operator')}
                />
                <LaunchButton
                  label="Дисплей"
                  highlighted={false}
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
  highlighted,
  onClick,
}: {
  label: string
  highlighted: boolean
  onClick: () => void
}) => (
  <button
    className={clsx(
      'inline-flex flex-1 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition',
      highlighted
        ? 'border-zinc-950 bg-zinc-950 text-zinc-50 hover:bg-zinc-800'
        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400',
    )}
    onClick={onClick}
    type="button"
  >
    {label}
  </button>
)

