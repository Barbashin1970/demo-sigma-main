# CLAUDE.md

Руководство по работе с репозиторием `demo-sigma-main` для агентов Claude Code.

> Живая версия: https://demo-sigma-alpha.vercel.app/operator/hospital-fire
> Приложение — SPA: содержимое рендерится на клиенте, поэтому WebFetch возвращает только пустой `index.html`. Реальный UI полностью определяется исходным кодом, описанным ниже.

## Что это за продукт

Sigma Demo — демонстрационный leader-view системы мониторинга городских инцидентов. Показывает, как руководитель города видит развитие инцидента на критическом объекте: городской контур → карточка объекта → таймлайн событий → рекомендации → задачи службам → прогноз с/без вмешательства.

Домен — Smart City Emergency Management. В демо три сценария:

| `scenarioId` | Alias URL | Профиль площадки | Тип риска |
|---|---|---|---|
| `thermal-incident` | `/operator/hospital-fire` | Серверная НГУ, Академгородок | Термический (пожар) |
| `heat-inlet-breach` | `/operator/hospital-breach` | Клиника Мешалкина, Красный проспект | Теплоноситель / вода |
| `air-quality-co2` | `/operator/lab-overheat` | Лесопарк Академгородка | Качество воздуха / CO₂ |

## Технологический стек

- **React 19** + **TypeScript** (strict), **React Router DOM 7**
- **Vite 8** + `@vitejs/plugin-react`, сборка: `tsc -b && vite build`
- **Tailwind CSS 4** через `@tailwindcss/vite` (импорт в [src/index.css](src/index.css))
- **@phosphor-icons/react**, **clsx**, шрифты Outfit + JetBrains Mono (`@fontsource`)
- **Vitest 4** + **@testing-library/react** + **jsdom**
- **ESLint 9** (react-hooks, react-refresh, typescript-eslint)
- Деплой — Vercel ([vercel.json](vercel.json))

## Структура

```
src/
├── main.tsx                          # React DOM mount, импорт шрифтов и index.css
├── App.tsx                           # re-export из app/App
├── app/
│   ├── App.tsx                       # BrowserRouter + Routes + SceneRoute
│   ├── storyboard.ts                 # метаданные scene kinds, getStoryboardScene / getFocusZones / getSceneMoments
│   └── components/
│       ├── dashboard.tsx             # LeaderDashboard — композит всего экрана
│       ├── dashboard-sections.tsx    # ControlRail, ScenarioHeader, IncidentPanel, ForecastPanel, ShellBackground
│       └── dashboard-shared.tsx      # Surface, PanelSurface, Eyebrow, DetailReveal, StageCard, MetricTile, ScenarioProgress
├── features/scenario-player/
│   ├── playbackStore.ts              # external store: состояние, шаги, derive-функции, auto-advance
│   ├── runtime.ts                    # usePlaybackState / usePlaybackActions / useScenarioRoute / usePlaybackSync
│   └── syncBridge.ts                 # BroadcastChannel + localStorage fallback для operator↔display
├── scenarios/
│   ├── types.ts                      # ScenarioId, Criticality, TimelineEvent, ScenarioStep, ScenarioDefinition...
│   ├── index.ts                      # публичный API + resolveScenarioId (route aliases)
│   └── catalog.ts                    # 3 сценария × 5 шагов, snapshot-фабрики (zone, timeline, task, valve, light...)
├── test/
│   ├── setup.ts                      # BroadcastChannelMock для jsdom
│   └── repo-hygiene.test.ts          # запрет служебных артефактов
└── index.css                         # @import 'tailwindcss' + CSS-переменные
```

## Маршрутизация

Конфигурируется в [src/app/App.tsx](src/app/App.tsx):

- `/` → `Navigate` на `/operator/hospital-fire`
- `/operator/:scenarioId` — интерактивный режим с ControlRail
- `/display/:scenarioId` — read-only (без управляющих действий)
- `*` → fallback на `/operator/hospital-fire`

`SceneRoute` читает `:scenarioId` через `useParams`, прогоняет через `resolveScenarioId` ([src/scenarios/index.ts](src/scenarios/index.ts)) для учёта legacy-алиасов и передаёт в `useScenarioRoute` — хук вызывает `playbackStore.selectScenario()`.

## Управление состоянием

Кастомный **external store** поверх `useSyncExternalStore` — не Redux, не Zustand, не Context.

Единый источник правды: [src/features/scenario-player/playbackStore.ts](src/features/scenario-player/playbackStore.ts).

Ключевые поля состояния (`PlaybackStoreState`):
- `selectedScenarioId`, `scenario`, `scenarioIds`
- `currentStepIndex` (0–4), `currentStep`
- `runMode: 'manual' | 'auto'`, `playbackStatus: 'idle' | 'running' | 'paused' | 'completed'`
- `cityContext`, `objectCard`, `zones`, `timeline`, `incident`, `tasks`, `forecast`, `actuators`
- `explainability`, `criticality`, `sources`, `activeSources`, `smartphoneActions`
- `activePanel: 'city' | 'object' | 'tasks' | 'forecast'`
- `escalationAcknowledged: boolean`

Action-методы: `start`, `pause`, `reset`, `setRunMode`, `nextStep`, `selectScenario`, `focusPanel`, `confirmEscalation`, `applySyncMessage`, `dispose`.

### Derive-функции (computed state)

`buildState` собирает снапшот из «сырых» данных шага плюс три деривации:
- `deriveIncident` — поднимает уровень эскалации при `escalationAcknowledged`
- `deriveTasks` — переводит статусы задач эскалации
- `deriveTimeline` — добавляет событие о ручной эскалации

Это гарантирует консистентность: одна булевая флаг-переменная `escalationAcknowledged` синхронно меняет три раздела UI.

### Auto-advance

Когда `runMode='auto'` и `playbackStatus='running'`, store ставит `setTimeout` на `step.autoAdvanceAfterMs` (по умолчанию 3000 мс) и дергает `nextStep`. На последнем шаге статус становится `completed`.

### React-интеграция

В [src/features/scenario-player/runtime.ts](src/features/scenario-player/runtime.ts):
- `usePlaybackState()` — подписка через `useSyncExternalStore`
- `usePlaybackActions()` — доступ к методам store
- `useScenarioRoute(scenarioId)` — синхронизация URL → store
- `usePlaybackSync(mode)` — подключение BroadcastChannel по режиму

### Межвкладочная синхронизация

[src/features/scenario-player/syncBridge.ts](src/features/scenario-player/syncBridge.ts) — `operator` публикует `PlaybackSyncMessage`, `display` применяет через `applySyncMessage`. Транспорт: `BroadcastChannel` с fallback на `localStorage` storage-event. Синхронизируется минимальный набор: `selectedScenarioId`, `currentStepIndex`, `runMode`, `playbackStatus`, `activePanel`, `escalationAcknowledged`.

## Сценарная модель (data-driven)

Типы в [src/scenarios/types.ts](src/scenarios/types.ts). Каталог — [src/scenarios/catalog.ts](src/scenarios/catalog.ts) (~2k строк): три `ScenarioDefinition`, каждое с 5 шагами (baseline → signal → decision → action → outcome по storyboard kinds).

Каждый `ScenarioStep` — полный snapshot:
- `cityContext`, `objectCard`, `zones` (A/B/C)
- `timeline` (события типа signal/event/decision/action/forecast)
- `incident` + `explainability`
- `tasks`, `forecast`, `actuators` (клапаны и сигнальные лампы)
- `narrative`, `autoAdvanceAfterMs`

Нет fetch/axios — все данные in-memory, демо полностью детерминировано.

## UI-слой

Главный композит — `LeaderDashboard` в [src/app/components/dashboard.tsx](src/app/components/dashboard.tsx). Он оборачивается `ShellBackground` и раскладывает панели в грид `xl:grid-cols-[340px_minmax(0,1fr)]`:

- **ControlRail** (только при `interactive`, режим `operator`) — выбор сценария, play/pause, step, reset, переключение manual/auto, смартфонный пульт с `confirmEscalation`
- **ScenarioHeader** — заголовок, ScenarioProgress-степпер
- **City / Object** панели — городской контур и карточка критического объекта
- **IncidentPanel** — incident snapshot, explainability, таймлайн, список задач
- **ForecastPanel** — прогноз с/без Sigma

Переиспользуемые примитивы (все в [src/app/components/dashboard-shared.tsx](src/app/components/dashboard-shared.tsx)):
`Surface`, `PanelSurface` (поддерживает `data-active`), `Eyebrow`, `StageCard`, `DetailReveal` (collapsible), `MetricTile`, `ScenarioProgress`.

### Стилизация

Tailwind 4 utility-first. Палитра — нейтральные zinc + полупрозрачные `bg-white/60..86` + акцент по риску:
- thermal: orange/red (`#df6d36`, `#a64a1f`)
- water: blue (`#3b82c4`, `#245b86`)
- air: teal (`#1aa39a`, `#0f6d68`)

Индикаторы критичности — цвет «лампы»: emerald (normal) → amber (watch) → orange (elevated) → red (high/critical).

Копирайт — полностью на русском.

## Команды

```bash
npm install
npm run dev            # Vite dev-сервер
npm run build          # tsc -b && vite build
npm run lint           # eslint .
npm run test           # vitest watch
npm run test:run       # однократный прогон
npm run preview        # превью production-сборки
```

## Тестирование

Конфиг Vitest встроен в [vite.config.ts](vite.config.ts), окружение `jsdom`, setup — [src/test/setup.ts](src/test/setup.ts) (мок `BroadcastChannel`).

Покрытие:
- [src/app/App.test.tsx](src/app/App.test.tsx) — маршруты, базовые UI-сценарии
- [src/features/scenario-player/playbackStore.test.ts](src/features/scenario-player/playbackStore.test.ts) — шаги, сброс, синхронизация, эскалация
- [src/scenarios/consistency.test.ts](src/scenarios/consistency.test.ts) — целостность каталога
- [src/app/storyboard.test.ts](src/app/storyboard.test.ts) — соответствие storyboard kinds
- [src/test/repo-hygiene.test.ts](src/test/repo-hygiene.test.ts) — запрет служебных артефактов

## Архитектурные паттерны и договорённости

1. **Data-driven scenarios** — новые сценарии/шаги добавляются редактированием [catalog.ts](src/scenarios/catalog.ts), без изменений UI-кода.
2. **External store + `useSyncExternalStore`** — состояние живёт вне React, один snapshot на шаг, никаких incremental updates.
3. **Derived state** — `escalationAcknowledged` в одном месте → консистентно меняет `incident`, `tasks`, `timeline`.
4. **Snapshot-per-step** — каждый шаг содержит полные данные, переходы = замена объекта (не merge).
5. **Route aliases** — legacy URL `/operator/hospital-fire` резолвится в `thermal-incident` через `resolveScenarioId`.
6. **Operator vs display** — один `LeaderDashboard`, разница только в пропсе `interactive`.
7. **Межвкладочная синхронизация** — через `BroadcastChannel`, минимальный payload, fallback на `localStorage`.
8. **Storyboard kinds** — каждому шагу жёстко сопоставлен `StoryboardSceneKind` (`baseline | signal | decision | action | outcome`), консистентность проверяется тестами.

## Агенты и скиллы

В репозитории — пять ролевых скиллов в [.agents/skills/](.agents/skills/). Правила структуры и границы ролей — в [AGENTS.md](AGENTS.md). Соблюдай их при изменениях в `.agents/`.

Домейн-владельцем продукта выступает **[smart-city-analyst](.agents/skills/smart-city-analyst/SKILL.md)** — роль аналитика ситуационного центра, то есть того самого пользователя, которого Sigma автоматизирует. К нему идут все решения про:

- лестницу критичности (`normal → watch → elevated → high → critical`) и её триггеры
- матрицу служб, задач, SLA и эскалаций
- инвентарь источников сигналов (sensor / external / manual / virtual / actuator)
- explainability, forecast и сценарный narrative
- регистр и tone of voice русскоязычного UI (см. [copy-voice.md](.agents/skills/smart-city-analyst/references/copy-voice.md))

Исполняющие роли (`ui-designer`, `frontend-developer`, `workflow-architect`, `ux-researcher`) в этом репо расширены:

- `frontend-developer` получил явное право править [catalog.ts](src/scenarios/catalog.ts), derive-функции playbackStore, sync bridge и storyboard kinds
- `ui-designer` владеет криталити-лестницей (лампы, палитра по риску) и раскладкой compact-first leader view
- `workflow-architect` формализует инцидент-флоу аналитика и контракт operator↔display
- `ux-researcher` ведёт исследование двойной персоны: аналитика и руководителя
- `design-taste-frontend` применяется только поверх брифа других скиллов

Ни один исполнитель не изобретает доменные факты, которые принадлежат `smart-city-analyst`.

## Деплой

[vercel.json](vercel.json) настраивает SPA-fallback на `index.html` — любые пути обслуживаются клиентским роутером.
