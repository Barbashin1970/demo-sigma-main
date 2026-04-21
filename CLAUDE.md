# CLAUDE.md

Руководство по работе с репозиторием `demo-sigma-main` для агентов Claude Code.

> Живая версия: https://demo-sigma-alpha.vercel.app/operator/hospital-fire
> Приложение — SPA: содержимое рендерится на клиенте, поэтому WebFetch возвращает только пустой `index.html`. Реальный UI полностью определяется исходным кодом, описанным ниже.

## Что это за продукт

Sigma Demo — демонстрационный leader-view системы мониторинга городских инцидентов. Показывает, как руководитель города видит развитие инцидента на критическом объекте: городской контур → карточка объекта → таймлайн событий → рекомендации → задачи службам → прогноз с/без вмешательства.

Домен — Smart City Emergency Management. В демо 8 сценариев на 7 venues × 3 персоны (campus НГУ / city Новосибирск / municipal Кольцово):

| `scenarioId` | Alias URL | Профиль площадки | Тип риска |
|---|---|---|---|
| `thermal-incident` | `/operator/hospital-fire` | Серверная НГУ, Академгородок | Термический (пожар) |
| `heat-inlet-breach` | `/operator/hospital-breach` | Клиника Мешалкина, Красный проспект | Теплоноситель / вода |
| `air-quality-co2` | `/operator/lab-overheat` | Лесопарк Академгородка | Качество воздуха / CO₂ |
| `dormitory-flood` | — | Общежитие НГУ, блок Б | Вода (ночная протечка) |
| `lab-access-breach` | — | Лаборатория 14Л-2 Технопарка НГУ | Безопасность (проникновение) |
| `access-no-pass` | — | КПП учебного корпуса НГУ | Безопасность (виртуальный пропуск) |
| `access-guarantors` | — | КПП учебного корпуса НГУ | Безопасность (проход по поручителям) |
| `edds-mode-change` | — | ЕДДС МКУ «СВЕТОЧ», р.п. Кольцово | Операционный (переход режима) |

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
│   ├── storyboard.ts                 # метаданные scene kinds
│   ├── focus-resolver.ts             # resolveFocus(scene, criticality) — какую панель подсвечивать
│   ├── references.ts                 # RegulationNote + scenarioReferences (реальные выдержки регламентов для i-кнопки)
│   ├── venues.ts                     # 7 venues × 3 персоны; Persona = campus | city | municipal
│   └── components/
│       ├── dashboard.tsx             # LeaderDashboard — композит всего экрана
│       ├── dashboard-sections.tsx    # ControlRail (только зоны), ScenarioHeader (StatusBanner), IncidentPanel (do/don't), ForecastPanel (стрелки)
│       ├── dashboard-shared.tsx      # Surface, PanelSurface, Eyebrow, DetailReveal, StageCard, MetricTile, ScenarioProgress
│       ├── sigma-assist.tsx          # Floating panel bottom-right: логотип, progress, Шаг/Сброс, 3 AI-подсказки, каталог
│       ├── scenario-launcher.tsx     # Правый drawer: фильтры persona+risk, карточки venue, цветные чипы по стихии
│       ├── info-button.tsx           # i-кнопка в sky-тинте + InfoModal со справкой
│       ├── icons.ts                  # Phosphor-хаб: risk/criticality/source/zone/task/timeline icons, criticalityText, criticalityAccentBorder
│       ├── icon-glyph.tsx            # Тонкая обёртка над Phosphor для react-refresh
│       └── trainer-screen.tsx        # /trainer/:scenarioId — StepPlay + TrainerSummary + подсказки
├── features/scenario-player/
│   ├── playbackStore.ts              # external store: состояние, шаги, derive-функции, auto-advance
│   ├── runtime.ts                    # usePlaybackState / usePlaybackActions / useScenarioRoute / usePlaybackSync
│   └── syncBridge.ts                 # BroadcastChannel + localStorage fallback для operator↔display
├── features/trainer/
│   └── trainerSession.ts             # Phase 4.d: scoreAction / totalPoints / maxPointsForScenario / passThreshold / findNextInteractiveStep
├── scenarios/
│   ├── types.ts                      # ScenarioId (8), RiskKind (5), InvariantProfile, Criticality, TimelineEvent, ScenarioStep, ScenarioStepInteractiveMeta, ScenarioActionDefinition, ScenarioDefinition
│   ├── index.ts                      # публичный API + resolveScenarioId (route aliases)
│   ├── catalog.ts                    # 8 сценариев × 5 шагов, snapshot-фабрики (zone, timeline, task, valve, light) + withTrainerMeta
│   └── interactive-meta.ts           # Phase 4.c: scenarioTrainerActions + scenarioTrainerMeta (эталоны thermal-incident, edds-mode-change)
├── test/
│   ├── setup.ts                      # BroadcastChannelMock для jsdom + afterEach(cleanup)
│   └── repo-hygiene.test.ts          # запрет служебных артефактов
└── index.css                         # @import 'tailwindcss' + CSS-переменные
```

## Маршрутизация

Конфигурируется в [src/app/App.tsx](src/app/App.tsx):

- `/` → `Navigate` на `/operator/hospital-fire`
- `/operator/:scenarioId` — интерактивный режим с SigmaAssist + транспортом
- `/display/:scenarioId` — read-only для видеостены, синхронизируется с оператором через BroadcastChannel
- `/trainer/:scenarioId` — Phase 4.d: тренажёрный режим для сценариев с `interactiveMeta` (сейчас `thermal-incident`, `edds-mode-change`). Свои шаги, свой scoring, свой экран аттестации. Не использует `playbackStore` — локальный session state
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
- **`interactiveMeta?`** (Phase 4.c) — опциональная тренажёрная разметка: `expectedActions`, `allowedActions`, `maxDecisionTimeSec`, `weight`, `clauseRef`. Наполнена для `thermal-incident` и `edds-mode-change` через словарь в [interactive-meta.ts](src/scenarios/interactive-meta.ts). Сценарии без меты продолжают работать в `/operator/*` и `/display/*` как раньше, а `/trainer/*` их пропускает с сразу показанным summary

`ScenarioDefinition.actions?` — словарь `ScenarioActionDefinition` (id, label, service, `prohibited?`, `rationale?`). Используется тренажёром для рендера кнопок и для scoring: `prohibited=true` → штраф `−weight/2`, `rationale` — текст подсказки.

Нет fetch/axios — все данные in-memory, демо полностью детерминировано. Phase 4.g планирует вынести текстовые блоки (`scenarioReferences`, `doNotByRisk`, `scenarioTrainerActions`) в YAML с hot-reload — см. референс в `NSK_OpenData_Bot-main/` (`.gitignore`).

## UI-слой

Главный композит — `LeaderDashboard` в [src/app/components/dashboard.tsx](src/app/components/dashboard.tsx). Он оборачивается `ShellBackground`. Layout:

```
[ ScenarioHeader — StatusBanner во всю ширину, цвет по критичности         ]
[ ControlRail (280px)  | IncidentPanel (1.1fr)  | ForecastPanel (1fr)       ]
[ SigmaAssist — floating bottom-right, позиция fixed                         ]
[ ScenarioLauncher — правый drawer (max-w-md) по клику в SigmaAssist         ]
```

Секции:

- **ScenarioHeader / StatusBanner** ([dashboard-sections.tsx](src/app/components/dashboard-sections.tsx)) — крупная иконка-лампа + uppercase-надпись по `statusBannerCopy[criticality]` («СИСТЕМА В НОРМЕ» / «НАБЛЮДЕНИЕ» / «ПОВЫШЕННАЯ ГОТОВНОСТЬ» / «ВЫСОКИЙ РИСК» / «АКТИВНЫЙ ИНЦИДЕНТ»). Фон и рамка подкрашены по критичности. Заголовок сценария — подзаголовок справа, не главный
- **ControlRail** — только зоны объекта, sticky, inner-scroll. Watermark «Sigma · объект» + название venue
- **IncidentPanel** — инцидент разбит на цветные блоки: `criticalityRowTint` «Что происходит», emerald «Что делать сейчас» (нумерованный чек-лист из `recommendations`), rose «Чего не делать» (из `doNotByRisk: Record<RiskKind, string[]>`), sky «Исполнение служб»
- **ForecastPanel** — sky-блок «Последнее событие», две карточки-стрелки: emerald `TrendDown` «Риск снижается» и rose `TrendUp` «Риск растёт»
- **SigmaAssist** ([sigma-assist.tsx](src/app/components/sigma-assist.tsx)) — Robot-логотип, текущий сценарий + i-кнопка «Обстановка», `ScenarioProgress`, Шаг/Сброс, 3 AI-подсказки (ответы из state), кнопка каталога. Сворачивается в pill-FAB. В `display`-режиме транспорт и каталог скрыты, AI-подсказки остаются
- **ScenarioLauncher** ([scenario-launcher.tsx](src/app/components/scenario-launcher.tsx)) — правый drawer с фильтрами persona+risk и карточками venue. Чипы рисков окрашены по стихии (thermal=orange, water=sky, air=teal, security=emerald, operational=indigo). Кнопки сценария: «▶ Открыть» (полная ширина) + квадратная иконка `<Television>` с `sr-only` текстом «На видеостену» — открывает display-режим в новой вкладке
- **InfoButton + InfoModal** ([info-button.tsx](src/app/components/info-button.tsx)) — sky-кнопка 24 px с Info-иконкой. Модалка в sky-тинте с заголовком, телом (`whitespace-pre-line`) и источником. Данные — `scenarioReferences` в [src/app/references.ts](src/app/references.ts): реальные выдержки Положения ЕДДС Кольцово (пп. 5.3–5.6, 6.3–6.4) и Инструкции НГУ Приложение №6 (пожар, подозрительные лица/предметы, видеодетектор «оставлен >5 мин»)

Переиспользуемые примитивы (все в [src/app/components/dashboard-shared.tsx](src/app/components/dashboard-shared.tsx)):
`Surface`, `PanelSurface` (поддерживает `data-active`), `Eyebrow`, `StageCard`, `DetailReveal` (collapsible), `MetricTile`, `ScenarioProgress`.

### Стилизация

Tailwind 4 utility-first. Цвет несёт **семантику функции**, не только тип данных:

- **Информация / справка**: sky (голубой) — i-кнопка, InfoModal, «Последнее событие», активный сигнал
- **Действия («делай»)**: emerald — чек-лист «Что делать сейчас», прогноз с вмешательством
- **Запреты / риск роста**: rose — «Чего не делать», прогноз без вмешательства
- **Критичность**: лестница `emerald → amber → orange → red → red-dark` (см. `criticalityText` и `criticalityAccentBorder` в [icons.ts](src/app/components/icons.ts))
- **Стихия риска** (в scenario-launcher): thermal=orange, water=sky, air=teal, security=emerald, operational=indigo

Акценты по риск-домену в `riskTheme` (dashboard-sections): thermal orange/red, water blue, air teal, security violet, operational slate.

Копирайт — полностью на русском. `presentText` в [dashboard-sections.tsx](src/app/components/dashboard-sections.tsx) делает терминологические подмены на лету (IAQ → «качество воздуха», SONOFF-модель → описание и т. п.).

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
- **`situational-center-ux`** ([SKILL.md](.agents/skills/situational-center-ux/SKILL.md)) — закреплённый набор UX-паттернов leader-view (статус-баннер, do/don't чек-лист, стрелки прогноза, SigmaAssist, drawer-каталог, цвет-по-семантике, цветные чипы по стихии, стратегия скролла для видеостен). К нему идут вопросы «как разложить новое окно/панель» — там готовый чек-лист из 10 правил

Ни один исполнитель не изобретает доменные факты, которые принадлежат `smart-city-analyst`.

## Деплой

[vercel.json](vercel.json) настраивает SPA-fallback на `index.html` — любые пути обслуживаются клиентским роутером.
