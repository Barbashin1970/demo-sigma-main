# Sigma Demo

Демонстрационный фронтенд Sigma — ИИ-прослойки над ситуационным центром / ЕДДС. Показывает три параллельных нарратива работы оператора ситуационного центра:

- **Кампус НГУ** — пожар в серверной, прорыв теплового ввода в клинике, лесной дым, протечка в общежитии, проникновение в лабораторию, забытый пропуск, проход по поручителям.
- **Муниципальная ЕДДС р.п. Кольцово** (индустриальный партнёр) — переход службы из повседневной деятельности в повышенную готовность по совокупности низкоуровневых триггеров.

> Живая версия: <https://demo-sigma-alpha.vercel.app/operator/hospital-fire>
>
> SPA на React 19 + Vite 8 + Tailwind 4. Весь UI рендерится на клиенте, демо детерминированное (без fetch/axios).

## Режимы работы

| URL | Когда использовать |
| :-- | :-- |
| `/operator/:scenarioId` | Рабочая станция оператора. Транспорт (Шаг/Сброс), AI-подсказки Sigma Assist, каталог сценариев. |
| `/display/:scenarioId` | Видеостена. Read-only, управление — через BroadcastChannel из оператор-вкладки. |
| `/trainer/:scenarioId` | Тренажёр. Оператор выбирает действие из `allowedActions`, получает балл, в конце — аттестационный отчёт JSON. |
| `/` | Редирект на `/operator/hospital-fire` (legacy-алиас `thermal-incident`). |

## Сценарии

8 сценариев на 7 venues × 3 персоны (`campus` НГУ / `city` Новосибирск / `municipal` Кольцово):

| `scenarioId` | Площадка | Риск |
| :-- | :-- | :-- |
| `thermal-incident` | Серверная НГУ, Академгородок | Термический |
| `heat-inlet-breach` | Клиника Мешалкина, Красный проспект | Водный |
| `air-quality-co2` | Лесопарк Академгородка | Воздух |
| `dormitory-flood` | Общежитие НГУ, блок Б | Водный (ночная протечка) |
| `lab-access-breach` | Лаборатория 14Л-2 Технопарка НГУ | Безопасность |
| `access-no-pass` | КПП учебного корпуса НГУ | Безопасность (виртуальный пропуск) |
| `access-guarantors` | КПП учебного корпуса НГУ | Безопасность (поручительство) |
| `edds-mode-change` | ЕДДС МКУ «СВЕТОЧ», р.п. Кольцово | Операционный (переход режима) |

Каталог с фильтрами по персоне и стихии риска — правый drawer, открывается из Sigma Assist. Чипы рисков окрашены по стихии: огонь — оранжевый, вода — синий, воздух — teal, безопасность — emerald, операционный — indigo.

## Структура

```
src/
├── app/                          # BrowserRouter, компоненты экранов, references, venues
│   ├── App.tsx                   # Маршруты: /operator, /display, /trainer
│   ├── components/
│   │   ├── dashboard.tsx         # LeaderDashboard (operator/display)
│   │   ├── dashboard-sections.tsx # ScenarioHeader (StatusBanner), ControlRail (зоны), IncidentPanel (do/don't), ForecastPanel (стрелки)
│   │   ├── sigma-assist.tsx      # Floating-панель справа внизу: logo, progress, транспорт, AI-подсказки, каталог
│   │   ├── scenario-launcher.tsx # Правый drawer с фильтрами
│   │   ├── info-button.tsx       # i-кнопка в sky-тинте + InfoModal со справкой из регламентов
│   │   ├── trainer-screen.tsx    # /trainer/:scenarioId — StepPlay, TrainerSummary, аттестация
│   │   └── icons.ts              # Phosphor-хаб: risk/criticality/source/zone/task/timeline icons
│   ├── references.ts             # Фасад над YAML-регламентами
│   └── venues.ts                 # 7 venues × 3 персоны
├── config/
│   ├── regulations.yaml          # Источник истины для «i» справок по сценариям (Phase 4.g)
│   └── regulations.ts            # Loader: js-yaml + zod
├── features/
│   ├── scenario-player/          # External store, BroadcastChannel-синхронизация
│   └── trainer/
│       └── trainerSession.ts     # scoreAction, totalPoints, maxPointsForScenario, AttestationReport
├── scenarios/
│   ├── types.ts                  # 8 ScenarioId, 5 RiskKind, ScenarioStep, ScenarioStepInteractiveMeta, ScenarioActionDefinition
│   ├── catalog.ts                # 8 × 5 шагов снапшотов
│   ├── interactive-meta.ts       # Phase 4.c: expectedActions/allowedActions/weight/clauseRef для thermal + edds
│   └── index.ts
└── test/setup.ts                 # BroadcastChannelMock + afterEach(cleanup)
```

## UX-паттерны

Закреплены в скилле [situational-center-ux](.agents/skills/situational-center-ux/SKILL.md). Коротко:

- **Status Banner** во всю ширину с цветовой подсветкой по критичности (`emerald → amber → orange → red`) и крупной uppercase-надписью. Главный вопрос оператора «тревожиться или нет?» получает ответ за 3 секунды.
- **Зоны** с цветной полосой `border-l-4` + пастельным тинтом по состоянию.
- **Do / Don't чек-лист** в `IncidentPanel` вместо текстового абзаца. «Что делать сейчас» — emerald + нумерация; «Чего не делать» — rose + иконка Prohibit, тексты из `doNotByRisk` по 5 RiskKind.
- **Прогноз стрелками** — TrendDown emerald «Риск снижается» и TrendUp rose «Риск растёт».
- **Цвет по семантике**: info = sky, action = emerald, deny = rose, forecast = emerald/rose, criticality = своя лестница.
- **Sigma Assist** — floating bottom-right: логотип, progress, Шаг/Сброс, 3 AI-подсказки (ответы из state), каталог. Сворачивается в FAB.
- **Scenario Launcher** — правый drawer с 1 колонкой карточек и компактными кнопками (`▶ Открыть` + иконная `Television` для видеостены).

## Тренажёр и аттестация

`/trainer/:scenarioId` работает на сценариях с заполненной `interactiveMeta` (сейчас `thermal-incident`, `edds-mode-change`). На каждом decision/action-шаге оператор видит `allowedActions` как кнопки:

- Корректное действие (`expectedActions`) → `+weight`
- Противорегламентное (`prohibited: true`) → `−weight/2`
- Нейтральное → `0`
- Превышение `maxDecisionTimeSec` → линейный штраф, ограничен полным `weight`

Порог допуска — 70% от максимума. Финальный экран — анкета (ФИО + роль) + разбор по шагам с `clauseRef` на пункты Положения + кнопка «Скачать отчёт JSON». Формат отчёта — [`AttestationReport`](src/features/trainer/trainerSession.ts), версия `1.0`, совместим с будущей отправкой в АИС ЦУКС.

## Регламенты как данные (Phase 4.g)

Выдержки регламентов для i-кнопок хранятся в [`src/config/regulations.yaml`](src/config/regulations.yaml). Валидируются через zod-схему при парсинге — невалидный YAML валит билд.

```yaml
# src/config/regulations.yaml
version: "1.0"
scenarios:
  edds-mode-change:
    situation:
      title: "Режимы функционирования ЕДДС"
      source: "Положение о ЕДДС МКУ «СВЕТОЧ», пп. 5.3–5.6"
      body: |
        Служба работает в трёх режимах...
```

Источники содержимого — реальные документы:

- **Положение о ЕДДС МКУ «СВЕТОЧ»** (пр. №15 от 04.12.2020) — пп. 5.3–5.6 (режимы), 6.3–6.4 (доклад главе), 8.5.2 (анализ достоверности)
- **Инструкция НГУ — Приложение №6** к приказу № 721-3 от 26.03.2024 — раздел 1 (пожар), пп. 2.1–2.2 (подозрительные лица и предметы)

Phase 5 предусматривает перевод остальных текстовых блоков (`doNotByRisk`, `scenarioTrainerActions.rationale`) в тот же YAML + веб-редактор на textarea с валидацией (референс — [NSK_OpenData_Bot-main/src/static/studio.html](NSK_OpenData_Bot-main/), локально, в `.gitignore`).

## Команды

```bash
npm install
npm run dev         # Vite dev-сервер на http://localhost:5173
npm run build       # tsc -b && vite build
npm run lint        # eslint .
npm run test        # vitest watch
npm run test:run    # однократный прогон
npm run preview     # превью production-сборки
```

## Покрытие тестами

```
Test Files  14 passed (14)
Tests       302+ passed
```

Группы тестов:

- [src/app/App.test.tsx](src/app/App.test.tsx) — маршруты и базовый UI
- [src/app/trainer.test.tsx](src/app/trainer.test.tsx) — e2e тренажёр и JSON-экспорт
- [src/app/scenario-launcher.test.tsx](src/app/scenario-launcher.test.tsx) — drawer-каталог и фильтры
- [src/app/info-button.test.tsx](src/app/info-button.test.tsx) — i-кнопка и модалка
- [src/features/scenario-player/playbackStore.test.ts](src/features/scenario-player/playbackStore.test.ts) — шаги, сброс, синхронизация
- [src/features/trainer/trainerSession.test.ts](src/features/trainer/trainerSession.test.ts) — scoring + passThreshold
- [src/scenarios/consistency.test.ts](src/scenarios/consistency.test.ts) — целостность каталога
- [src/scenarios/scenario-invariants.test.ts](src/scenarios/scenario-invariants.test.ts) — invariantProfile по сценариям
- [src/scenarios/interactive-meta.test.ts](src/scenarios/interactive-meta.test.ts) — expectedActions ⊂ allowedActions, веса, clauseRef
- [src/config/regulations.test.ts](src/config/regulations.test.ts) — валидация YAML против zod-схемы
- [src/app/storyboard.test.ts](src/app/storyboard.test.ts) — соответствие storyboard kinds
- [src/test/repo-hygiene.test.ts](src/test/repo-hygiene.test.ts) — запрет служебных артефактов

## Агенты и скиллы

В репозитории — шесть ролевых скиллов в [.agents/skills/](.agents/skills/):

| Скилл | Роль |
| :-- | :-- |
| [smart-city-analyst](.agents/skills/smart-city-analyst/SKILL.md) | Доменный владелец: лестница критичности, матрица служб, инвентарь источников, narrative. |
| [ui-designer](.agents/skills/ui-designer/SKILL.md) | Визуальная система: палитра по риску, компоненты, tokens. |
| [situational-center-ux](.agents/skills/situational-center-ux/SKILL.md) | Закреплённые UX-паттерны leader-view: status banner, do/don't, arrows, Sigma Assist, drawer. 10 правил редизайна. |
| [frontend-developer](.agents/skills/frontend-developer/SKILL.md) | Код shell-композиции, playbackStore, BroadcastChannel, trainer. |
| [workflow-architect](.agents/skills/workflow-architect/SKILL.md) | Контракты: escalation matrix, operator↔display sync, storyboard kinds, trainer scoring, YAML boundary. |
| [ux-researcher](.agents/skills/ux-researcher/SKILL.md) | Исследование двойной персоны: аналитик и руководитель. |

Правила границ между скиллами и структура — в [AGENTS.md](AGENTS.md).

## Деплой

[vercel.json](vercel.json) настраивает SPA-fallback на `index.html` — любые пути обслуживаются клиентским роутером.

## Лицензия

Демо-проект, использование по согласованию с авторами.
