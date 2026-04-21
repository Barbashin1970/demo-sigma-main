# Scenario Blueprint

Шаблон для авторинга полного сценария Sigma. Заполнить перед редактированием [src/scenarios/catalog.ts](../../../../src/scenarios/catalog.ts).

## 0. Идентификация

- `scenarioId`:
- Title / headline / tabLabel / subtitle:
- `scenarioNumber`:
- Risk type: thermal | water | air | energy | security | other
- Venue profile (площадка, адрес, критический объект, режим работы, численность людей)
- URL alias (если есть legacy):

## 1. Городской контекст

- Ключевые соседние объекты, которые попадают в радиус влияния
- Критические маршруты (подъезд пожарных, скорой, эвакуация)
- Внешние условия (погода, трафик, время суток) — влияют ли на развитие

## 2. Источники сигналов

Перечислить все `SignalSource`:

| id | kind | описание | задержка | доверие | режимы отказа |
|---|---|---|---|---|---|
| … | sensor / external / manual / virtual / actuator | | мс/сек | high/med/low | что ломается |

Минимум 1 пара независимых источников для подтверждения `elevated`.

## 3. Лестница критичности для этого сценария

| Уровень | Конкретный триггер на этих источниках | Что видит аналитик | Условие снижения |
|---|---|---|---|
| normal | | фоновая панель | — |
| watch | | подсветка зоны | 10 мин стабильных значений |
| elevated | | карточка объекта + задачи | actuator подтвердил локализацию |
| high | | эскалация | подтверждение объекта + actuator |
| critical | | leader view + публичные каналы | отдельная процедура, не в рамках одного шага |

## 4. Зоны (A / B / C)

- Zone A: локус риска (где физически проявляется)
- Zone B: ближайшая зона распространения
- Zone C: буфер / пути эвакуации / контур безопасности

По каждой зоне — датчики, статус, что может измениться на каждом шаге.

## 5. Шаги (ровно 5)

### Step 0 — baseline
- Narrative (одна фраза из журнала):
- Timeline-события:
- Incident: `none`
- Tasks: —
- Forecast: штатный режим

### Step 1 — signal
- Источник первого отклонения:
- Narrative:
- Timeline: signal-событие со ссылкой на источник
- Incident: `watch`
- Explainability: почему watch, какая гипотеза
- Recommendations: запрос подтверждения / перекрёстная проверка

### Step 2 — decision
- Что подтвердило гипотезу:
- Narrative:
- Timeline: event + decision
- Incident: `elevated`
- Explainability: какие источники совпали, какие отвергнуты
- Tasks: первые задачи службам (pending)
- Forecast: с/без вмешательства

### Step 3 — action
- Какие actuator'ы сработали:
- Narrative:
- Timeline: action-события с получателями
- Incident: `high` (если оправдано)
- Tasks: переведены в `in-progress`, появляется эскалация (pending)
- Explainability: обновление после вмешательства

### Step 4 — outcome
- Что зафиксировано в actuator'ах и объектом:
- Narrative:
- Timeline: forecast-событие + итог
- Incident: уровень по факту (может остаться `high` или снизиться)
- Tasks: `done` / отложенные follow-up
- Forecast: финальная разница with/without Sigma
- Smartphone pult: какие действия доступны руководителю

## 6. Эскалация

- Кто подтверждает вручную (role, не имя)
- Через какой канал (smartphone pult, voice, SCADA)
- Что появляется в `timeline` после подтверждения
- Какие `tasks` получают статус `in-progress` → `done` по deriveTasks

## 7. Acceptance checklist

- [ ] Каждое повышение критичности подкреплено фактом из ≥2 источников
- [ ] Каждая задача имеет получателя / канал / SLA / условие приёмки
- [ ] Explainability читается как заметка аналитика
- [ ] Forecast сопоставим по единицам
- [ ] Narrative — деловой регистр, без штампов
- [ ] Storyboard kinds соответствуют шагам (baseline → signal → decision → action → outcome)
- [ ] `consistency.test.ts` и `storyboard.test.ts` проходят
