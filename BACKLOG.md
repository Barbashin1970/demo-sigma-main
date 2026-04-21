# BACKLOG

Живой список задач для demo-sigma. Фиксирует домейн-решения и техническую декомпозицию по фазам. Домейн-владелец — [smart-city-analyst](.agents/skills/smart-city-analyst/SKILL.md).

## Продуктовая позиция

Sigma — ИИ-прослойка над ситуационным центром/ЕДДС, показанная на двух параллельных нарративах:

1. **Кампусный ситуационный центр** — НГУ Академгородок. Сценарии: пожар в серверной, прорыв теплового ввода в клинике, лесной дым, протечка в общежитии, проникновение в лабораторию, забытый пропуск, проход по поручителям. Пользователь: безопасность/ИТ кампуса и руководство.
2. **Муниципальная ЕДДС** — р.п. Кольцово (индустриальный партнёр). Пользователь: оперативный дежурный ЕДДС и глава поселка. Положение о ЕДДС МКУ «СВЕТОЧ» (приказ №15 от 04.12.2020) прямо запрашивает цифровые двойники для тренировок персонала — Sigma отвечает на этот пункт нормативного акта.

---

## Сделано

### Фаза 1 — сценарий `dormitory-flood`

- 5 шагов: baseline → signal → decision → action → outcome
- Объект: Общежитие кампуса НГУ, блок Б, 345 мест
- 7 источников: расходомер, датчик протечки, влажность, присутствие, пульт коменданта, отсекатель DN20, RGB-индикация
- RiskKind `water`, Origin `internal`, лестница `normal → watch → elevated → high → watch`

### Фаза 1.5 — визуальный слой

- Иконочный хаб [src/app/components/icons.ts](src/app/components/icons.ts) на phosphor
- Чистый `resolveFocus(scene, criticality)` в [src/app/focus-resolver.ts](src/app/focus-resolver.ts): один акцент на шаг
- `Surface.accent` — левая рамка 4 px по критичности
- Tabs / зоны / инцидент / прогноз получили иконочные анкеры
- ObjectCard получил hero-полосу с градиентом risk-темы
- Криталити-чипы, service-chips, timeline-events-icons, task-status-icons

### Фаза 2 — `lab-access-breach` (security-семья, адверсариал)

- 5 шагов: baseline → signal (силуэт 02:14) → decision (RFID попытка + видеодетектор двери) → action (замок удерживает, Росгвардия) → outcome (задержание 02:31)
- Введён `RiskKind='security'`, `SourceKind='video-analytic'` (блок видеодетекторов Ростелекома)
- Новые ZoneIconKey: `laboratory`, `perimeter-gate`
- Палитра slate/violet под security
- invariantProfile `escalating`

### Фаза 3 — семья verification-сценариев (security-семья, позитив)

Та же инфраструктура (RFID + видеодетектор + кнопка охранника), но вместо задержания — верификация.

- **3.1 `access-no-pass`** — виртуальный пропуск по истории, 5 шагов resolving
- **3.2 `access-guarantors`** — проход по двум поручителям при нулевой истории, 5 шагов resolving

Архитектурные решения:
- Введён `InvariantProfile` = `escalating | resolving`; инвариантный тест ветвится по профилю
- Новые ZoneIconKey: `turnstile`, `waiting-area`, `cloud-verification`
- Tab-иконки: `IdentificationCard`, `HandHeart`
- Концепты `PassTapEvent` / `VirtualPassToken` / `AccessEvent` — narrative-only (YAGNI)

### UX-переделка leader-view (Phase 4.a/4.b + поверх плана)

Закреплено как скилл [situational-center-ux](.agents/skills/situational-center-ux/SKILL.md). Готовые шаблоны можно переиспользовать в последующих ролях (trainer/leader).

- **Status Banner** во всю ширину: крупная иконка-лампа 52–80 px, uppercase-надпись («СИСТЕМА В НОРМЕ» / «НАБЛЮДЕНИЕ» / «ПОВЫШЕННАЯ ГОТОВНОСТЬ» / «ВЫСОКИЙ РИСК» / «АКТИВНЫЙ ИНЦИДЕНТ»), фоновая подсветка по `Criticality` (emerald/amber/orange/red). Заголовок сценария ушёл в правый блок баннера как контекст
- **Зоны объекта** — `border-l-4` в цвет состояния + мягкий тинт (`bg-emerald-50/55`, `bg-amber-50/70` и т. д.). Снимает проблему «три одинаковых строки с зелёной точкой»
- **Do/Don't чек-лист** вместо абзаца в IncidentPanel: emerald-блок «Что делать сейчас» с нумерованным списком из `recommendations` + rose-блок «Чего не делать» из статического словаря `doNotByRisk` (термический / вода / воздух / безопасность / операционный)
- **Прогноз стрелками** — `TrendDown` emerald / `TrendUp` rose вместо параграфов
- **Цветовой код по семантике, не по данным**: info=sky, action=emerald, deny=rose, forecast-down=emerald, forecast-up=rose, criticality=лестница
- **SigmaAssist** — floating-панель правом-нижнем углу: логотип/scenario title/progress/Шаг/Сброс/3 AI-подсказки/каталог. Сворачивается в FAB. В `display`-режиме прячутся транспорт и каталог, AI-подсказки остаются
- **Левая панель = только зоны объекта** + тонкий watermark «Sigma · объект» (убрали логотип «СИГМА», транспорт и кнопку каталога из F-паттерн-дыры «хром браузера»)
- **ScenarioLauncher → правый drawer** (`max-w-md`, sticky header, 1 колонка). Чипы рисков окрашены по стихии: огонь=orange, вода=sky, воздух=teal, безопасность=emerald, операционный=indigo. Полоса карточки сценария — в цвет риска
- **Компактные кнопки действий**: primary «▶ Открыть» pill-button + secondary квадратная иконная кнопка с `<Television>` (24 px) и `sr-only` текстом «На видеостену»
- **InfoButton** — кнопка + модалка в sky-тинте (`bg-sky-50`, `text-sky-600`). Содержимое — `RegulationNote` в [src/app/references.ts](src/app/references.ts): реальные пункты Положения ЕДДС Кольцово (5.3–5.6, 6.3–6.4) и инструкции НГУ Приложение №6 (пп. 1 и 2.1–2.2). Покрывает пожар в серверной и подозрительный предмет/лицо (в т. ч. «оставленный объект >5 мин» от видеодетектора)
- **Скроллинг для видеостен** — inner overflow на ControlRail / SigmaAssist, sticky-хедеры, `line-clamp-2/3` на длинных строках

---

## Фаза 4 — Кольцово как индустриальный партнёр (активная)

Переход от «демо-сторибоарда» к **тренажёру с аттестацией**, привязанному к реальному регламенту работы ЕДДС р.п. Кольцово. Основание — Положение о ЕДДС МКУ «СВЕТОЧ» от 04.12.2020:
- п. 5.3/5.5/5.6 — три режима функционирования (повседневная / повышенная готовность / ЧС)
- п. 4.1 — основные задачи службы
- п. 6.1–6.6 — порядок работы, приём вызовов, классификация ЧС, доклад главе поселка
- п. 7.1 — формы обучения: ежедневные тренировки с ЦУКС, учения 2+ раз в год на смену, зачёты каждые 6 месяцев
- п. 8.5.2 / 8.6.2 — компетенции старшего оперативного дежурного и оператора «112»
- п. 10.2 — состав оборудования (АРМ, «112», АДПИ GSM, видеонаблюдение, метеостанция)
- стр. 26 PDF — прямое указание на внедрение цифровых двойников для тренировок ЕДДС

### 4.a — Кольцово как venue + сценарий `edds-mode-change` (активный подэтап)

Grounding: первый сценарий, где пользователь — не безопасность НГУ, а оперативный дежурный ЕДДС муниципального уровня.

**Доменный бриф:**
- Venue: ЕДДС МКУ «СВЕТОЧ», р.п. Кольцово, ул. Центральная, 24/2
- Сценарий: переход режима ЕДДС из повседневной деятельности в повышенную готовность по совокупности низкоуровневых триггеров (не единичный инцидент, а операционное решение)
- Лестница: normal → watch (один АДПИ GSM) → elevated (второй АДПИ + метео + рост 112) → high (доклад главе) → high (режим переведён)
- RiskKind: новый `operational` (ортогонально thermal/water/air/security — это не физический инцидент, а операционная эскалация режима службы)
- invariantProfile: `escalating`
- Зоны: диспетчерская ЕДДС / городской контур мониторинга / контур приёма «112»
- Эскалация: глава поселка / первый заместитель — председатель КЧС и ОПБ

**Технический чеклист:**
- [x] `RiskKind` += `'operational'`, `ScenarioId` += `'edds-mode-change'`
- [x] `ZoneIconKey` += `dispatch-room`, `city-monitoring`, `call-center-112`
- [x] `riskIcon.operational`, `scenarioTabIcon['edds-mode-change']`, три новых `zoneIcon`
- [x] `riskTheme.operational` — палитра slate/steel (нейтральная, управленческая)
- [x] `eddsVenueProfile` + `eddsSources` + `eddsSteps` (5 шагов)
- [x] Регистрация в `scenarios` Record
- [x] Строка в expectation-таблице
- [x] `npm run test:run`, `npm run lint`, `npm run build`, dev-smoke

### 4.b — Scenario Launcher (каталог сценариев модалкой)

Навигация по матрице venue × сценарий перестаёт быть линейным списком табов. Модалка поверх текущего приложения, без трогания роутера.

**Решения:**
- Главная страница (`/`) НЕ меняется — остаётся редирект на `/operator/hospital-fire`. Launcher как модалка, чтобы потом проще монтировать с другими блоками проекта
- Две оси фильтров: **персона** (`campus` НГУ / `city` городские объекты / `municipal` Кольцово) + **риск-тип** (thermal / water / air / security / operational, multi-select)
- Triangle кнопки режимов на карточке: **Оператор** + **Дисплей**. Тренажёр пока не показываем — появится после 4.c
- Архитектура: вариант A (ScenarioKind + Instance) откладываем в Phase 5; дублирование (вариант C) отклонено. Сейчас добавляем только лёгкий venue-реестр поверх существующего каталога

**Чеклист:**
- [x] Реестр [src/app/venues.ts](src/app/venues.ts): 7 venues × 3 персоны
- [x] Опциональный `venueId: string` на `ScenarioDefinition`; проставить для всех 8 сценариев
- [x] [src/app/components/scenario-launcher.tsx](src/app/components/scenario-launcher.tsx) — модальный компонент с двумя шагами (фильтры → результаты)
- [x] Trigger в ControlRail + монтирование в `LeaderDashboard`
- [x] Инвариант: `venueId` каждого сценария существует в registry
- [x] Unit-тесты: рендер открытого/закрытого состояния, фильтры, клик → navigate
- [x] Подсветка только ненулевых чипов (persona и risk) через `data-empty`
- [x] Кнопки действий переименованы в «Открыть» (оператор) и «На видеостену» (display в новой вкладке)
- [x] Убраны табы сценариев из ControlRail — навигация только через каталог
- [x] Бейдж «Видеостена · только показ» в ScenarioHeader при `interactive=false`
- [x] Справочные кнопки «i» в углу секций (Обстановка, Действия руководителя) с привязкой к регламенту в [src/app/references.ts](src/app/references.ts)

### 4.c — Interactive step metadata (фундамент тренажёра)

Backwards-compat расширение `ScenarioStep`:

```ts
interface ScenarioStepInteractiveMeta {
  expectedActions: string[]   // ID корректных действий
  allowedActions: string[]    // полный набор кнопок
  maxDecisionTimeSec: number  // норматив реакции
  weight: number              // вклад шага в итоговый балл
  clauseRef?: string          // ссылка на пункт Положения (напр. '8.5.2:анализ-достоверности')
}
```

Поле опциональное — старые сценарии без `interactiveMeta` продолжают работать в `/operator/*` как сейчас. Наполняем для `edds-mode-change` и `thermal-incident` как эталонных.

Инвариант: если `interactiveMeta` заполнен — `expectedActions ⊂ allowedActions`, `maxDecisionTimeSec > 0`, `weight ≥ 0`.

### 4.d — Маршруты `/trainer/*` + scoring-движок (MVP ✓, v2 планируется)

**Phase 4.d MVP (сделано):**
- Маршрут `/trainer/:scenarioId` — [src/app/App.tsx](src/app/App.tsx)
- Чистые функции scoring — [src/features/trainer/trainerSession.ts](src/features/trainer/trainerSession.ts): `scoreAction`, `totalPoints`, `maxPointsForScenario`, `passThreshold`, `findNextInteractiveStep`
- UI — [src/app/components/trainer-screen.tsx](src/app/components/trainer-screen.tsx): StepPlay (narrative + allowedActions как кнопки + кнопка «Подсказка») + TrainerSummary (per-step breakdown + итог + порог допуска)
- Scoring: `+weight` за корректное действие, `−weight/2` за prohibited, 0 за нейтральное. Линейный штраф за превышение `maxDecisionTimeSec`, ограничен полным `weight`
- Baseline-шаги без `interactiveMeta` пролистываются автоматически (findNextInteractiveStep)
- Порог допуска по умолчанию 70% от максимума (`passThreshold`)
- Тесты: [src/features/trainer/trainerSession.test.ts](src/features/trainer/trainerSession.test.ts) (6 проверок scoring), [src/app/trainer.test.tsx](src/app/trainer.test.tsx) (7 e2e через React Router)

**Осталось для v2:**
- [ ] Визуальный таймер обратного отсчёта на шаге (сейчас время считается, но не показывается — пользователь видит только итоговую реакцию в summary)
- [ ] Раздельные маршруты `/trainer/operator/:scenarioId` и `/trainer/leader/:scenarioId` — разные наборы `allowedActions` по роли. Требует расширения `interactiveMeta` → `Record<Role, ScenarioStepInteractiveMeta>`
- [ ] Сохранение сессии в `localStorage` на случай перезагрузки
- [ ] Touch-оптимизация (крупные кнопки, swipe между шагами) для видеостены

### 4.e — Аттестационный отчёт

- Финальный экран: пользователь, роль, сценарий, дата, per-step breakdown
- Мэппинг результата на пункты Положения через `clauseRef`: «п. 8.5.2 — анализ достоверности: выполнено (12 сек)»
- Итоговый балл и порог допуска к дежурству (70 по умолчанию)
- Экспорт JSON одной кнопкой, без backend. Шаблон совместим с будущей отправкой в АИС ЦУКС — сама интеграция вне scope Phase 4

### 4.f — Статичные подсказки (✓ реализовано вместе с 4.d MVP)

- Кнопка «Подсказка» на шаге тренажёра ([trainer-screen.tsx](src/app/components/trainer-screen.tsx))
- Источник: `rationale` ожидаемого действия из `scenarioTrainerActions` + `clauseRef` шага из `scenarioTrainerMeta` — пример: «п. 8.5.2 — первичная фиксация сигнала»
- AI-агент-наставник = Phase 5 (расширенный Sigma Assist)

### 4.g — Регламенты в YAML/JSON, горячая замена (план)

Отвязать доменные знания от UI-кода. Сейчас зашиты в TypeScript:

- [src/app/references.ts](src/app/references.ts) — `RegulationNote` по scenarioId (выдержки регламентов НГУ/Кольцово)
- [src/app/components/dashboard-sections.tsx](src/app/components/dashboard-sections.tsx) — `doNotByRisk: Record<RiskKind, string[]>` (запреты по стихии)
- [src/scenarios/catalog.ts](src/scenarios/catalog.ts) — `recommendations`, `explainability`, timeline-события, narrative
- (после 4.c) `interactiveMeta` — ожидаемые действия, `clauseRef`, веса шагов

**Цель:** регламенты меняются заказчиком без пересборки. Операционный дежурный обновляет свой playbook → Sigma его подхватывает при следующей загрузке.

**Направление:**
- Тонкий loader: JSON/YAML → те же TS-типы через zod/valibot схемы и рантайм-валидацию
- Идентификаторы источников / зон / сценариев остаются в коде (связка с иконками и компонентами), меняются только текстовые блоки и регуляторные параметры
- Внешний YAML-редактор с live-preview — референсный проект на Railway у заказчика (готовый блок YAML editor с подсветкой схемы и валидацией). Посмотреть и адаптировать при старте фазы

**Локальный референс:** папка `NSK_OpenData_Bot-main/` (не в репозитории, добавлена в `.gitignore`). Смотреть:
- `config/city_profile_*.yaml` — декларативные профили городов: id, slug, районы, центр, bbox, стоп-слова, features. Паттерн «одна сущность — один YAML».
- `config/canonical_schemas.yaml` — канонические схемы данных, ссылаемые из профилей.
- Модуль `src/city_config.py` — пример loader'a YAML с валидацией и кэшированием.
- `CITY_PROFILE=<name>` env-переменная — горячий переключатель профиля на запуске.

Аналогично для Sigma: `config/scenarios/<scenarioId>.yaml`, `config/regulations/<authorId>.yaml` (НГУ, Кольцово), `config/risk-palette.yaml`. Переключение площадки — по env или URL-параметру.

**Что может жить в YAML:**
```yaml
# scenarios/edds-mode-change.yaml
id: edds-mode-change
venueId: koltsovo-edds
invariantProfile: escalating
references:
  situation:
    title: Режимы функционирования ЕДДС
    source: "Положение о ЕДДС МКУ «СВЕТОЧ», пп. 5.3–5.6"
    body: |
      Служба работает в трёх режимах...
  actions:
    title: Порядок доклада главе поселка
    clauseRef: "6.3–6.4"
doNotByRisk:
  operational:
    - Не переводить службу в режим ЧС без распоряжения главы
    - Не эскалировать на город до подтверждения вторым источником
steps:
  - id: edds-s3-decision
    interactiveMeta:
      expectedActions: [report-to-head, request-forecast]
      maxDecisionTimeSec: 60
      weight: 10
      clauseRef: "8.5.2:анализ-достоверности"
```

**Порядок выполнения:**
- [ ] Определить границу «живое / хардкод»: что идёт в файл, что остаётся в TS (типы, иконки, handler-ы)
- [ ] zod/valibot схема + loader с понятными ошибками при невалидном YAML
- [ ] Переложить `references.ts` первым (самый живой слой)
- [ ] Затем `doNotByRisk` и `interactiveMeta` (после 4.c)
- [ ] Фаза 5: редактор с предпросмотром, diff, версионирование — взять блок из Railway-проекта заказчика

**Почему сейчас только в планах:** до 4.c нет явной потребности — регламенты ещё дописываются. Плюс без scoring-движка (4.d) незачем дёргать `clauseRef`. Но закладываем: все новые сущности в 4.c — проектируем с прицелом «можно вынести в YAML».

---

## Фаза 5 — AI-агент, рандомизация и интеграция ЦУКС (gated)

Активируется после Phase 4.

- **Sigma Assist → настоящий AI-агент.** В Phase 4.b реализован прототип: 3 pre-defined промпта в SigmaAssist, ответы берутся из state (`explainability.causeEffectSummary`, `forecast.withoutSigma`, `forecast.withSigma`). Это заглушка для демо-стенда. В Phase 5 — LLM backend с доступом к:
  - текущему snapshot сценария (зоны, инцидент, explainability, прогноз)
  - регламентам из YAML (см. 4.g)
  - истории действий оператора из тренажёра (4.d)
  Свободный ввод вопроса + сохранение контекста диалога. Раскрытие ответа inline (как сейчас) или в отдельном панельном модуле
- **AI-агент-наставник** в тренажёре: онлайн-подсказки на превышении `maxDecisionTimeSec`, разбор полётов на финальном экране, оценка нестандартных действий (вне `allowedActions`) через LLM-анализ соответствия регламенту
- **Рандомизатор сценариев**: `shuffleNonCriticalSignals`, `jitterTimeWindowSec`, `optionalEvents`. Event-feed показывает сигналы как ленту с элементом случайности
- **Интерактивные чек-листы с развилками**: развитие `RegulationNote` → `ChecklistNode` с массивом выборов. Оператор во время события отмечает «путь 1 / путь 2», сценарий идёт по выбранной ветке с соответствующими рекомендациями. Первый раз всплыло в 4.b как «справка по i-кнопке»; здесь превращается в активный чек-лист с ветвлением `ScenarioStep`-переходов
- **Внешний редактор регламентов** (YAML/JSON live edit) — см. 4.g. В Phase 5 добавляется веб-интерфейс с превью: автор регламента редактирует YAML в браузере, видит изменения в демо в реальном времени. Готовый блок есть в Railway-проекте заказчика, адаптируем
- **Экспорт для ЦУКС**: CSV/XML формат, согласование с ГУ МЧС России по НСО
- **Ролевой UI**: Operator / Leader / Trainer / Observer с предустроенной раскладкой для каждой роли (сейчас дифференцируется только operator/display)
- **Touch-оптимизация видеостены**: тап по карточке → модалка с полным контентом (вместо `DetailReveal` аккордеона). Заложено в скилле [situational-center-ux](.agents/skills/situational-center-ux/SKILL.md) как следующий шаг

---

## Отложенные сценарии

Не делаем сейчас, но держим в бэклоге на случай появления потребности.

### `power-outage`

Каскадный сценарий отключения электроснабжения кампуса с триггером на серверную и лаборатории. Откладывали с Phase 2 — сейчас ещё дальше, потому что Phase 4 открывает реальную потребность ЕДДС-сценариев. Если вернёмся: `RiskKind='power'`, каскад внутри 5 шагов одного сценария, origin=`hybrid`.

### `mass-event-crowd`

Управление потоком людей при массовом мероприятии (Технопром, дни открытых дверей). Расширяет персону пользователя (дежурный ЕДДС → координатор мероприятия). Вероятно отклоняем; активируем только по явному продуктовому решению.

### Новые RiskKind `chemical` / ПОО-сценарии

Из отчёта аналитика по Положению Кольцово: сценарий угрозы на потенциально опасном объекте (АО «Вектор» и другие ПОО Кольцово). Подъём нового RiskKind дорогой (иконки, палитра, токены) — делаем только по реальному запросу заказчика.

---

## Технический долг и идеи

- Bundle size — phosphor импортируется почти целиком (>720 kB). Когда станет критично, перейти на tree-shakable импорты или заменить на lucide одним пасом
- `heroImage` на `VenueProfile` зарезервирован, но пока только fallback-градиент с tab-иконкой. При появлении фотографий — подключить без изменения рендер-слоя
- `MetricTile` используется минимально — стоит чаще для ключевых чисел (расход, влажность, confidence, время до ухудшения, индекс PM2.5)
- Копирайт-пас по `presentText` — словарь подмен разросся; выделить в отдельный файл и покрыть тестом
