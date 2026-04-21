# Sigma Demo

Демо-фронтенд Sigma для показа городского leader-view: городской контур, карточка критического объекта, развитие инцидента по шагам, рекомендации, задачи и прогноз.

## Маршруты

- `/operator/hospital-fire` — совместимый legacy entrypoint, ведет на `thermal-incident`
- `/operator/:scenarioId` — интерактивный режим с пошаговым проигрыванием
- `/display/:scenarioId` — display-only режим без control rail действий

Поддерживаемые `scenarioId`:

- `thermal-incident`
- `heat-inlet-breach`
- `air-quality-co2`

## Сценарная модель

Сценарии описаны data-driven конфигами в [`src/scenarios`](/Users/vadign/sigma-demo/src/scenarios):

- `types.ts` — публичные типы сценарной модели
- `catalog.ts` — сценарные данные и snapshot-фабрики
- `index.ts` — публичный входной модуль и route aliases

Каждый сценарий хранит:

- `cityContext`
- `sources`
- `smartphoneActions`
- `steps`

Каждый шаг сценария хранит snapshot для:

- `objectCard`
- `zones`
- `timeline`
- `incident`
- `tasks`
- `forecast`
- `actuators`

## Playback

Playback хранится в [`src/features/scenario-player`](/Users/vadign/sigma-demo/src/features/scenario-player):

- `playbackStore.ts` — сценарное состояние, шаги, reset и side effects
- `runtime.ts` — React hooks для доступа к store и route sync
- `syncBridge.ts` — синхронизация operator/display между вкладками

Смена вкладки сценария сбрасывает:

- шаг проигрывания
- timeline/event feed
- escalation acknowledgement
- активную панель summary-экрана

## UI

Основной экран расположен в [`src/app/components`](/Users/vadign/sigma-demo/src/app/components):

- leader-view с левой rail-панелью управления
- compact-first summary panels
- русский UI-copy
- отдельный display mode без управляющих действий

## Команды

```bash
npm install
npm run dev
npm run test:run
npm run build
npm run lint
```

## Проверки

В проекте есть:

- route/UI tests
- playback store tests
- storyboard/scenario consistency tests
- repo hygiene test на служебные metadata-файлы
