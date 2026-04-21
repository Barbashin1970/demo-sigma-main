import { ArrowLeft, BookOpen, DownloadSimple, FileCode, FileText } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import regulationsYaml from '../../config/regulations.yaml?raw'
import { regulations } from '../../config/regulations'

import { Eyebrow, Surface } from './dashboard-shared'
import { FullscreenButton } from './fullscreen-button'
import { InfoButton } from './info-button'

const STUDIO_HELP = {
  title: 'Как устроен просмотрщик регламентов',
  body: `Это витрина всех регламентов, которые подтягиваются в UI по кнопке «i» и в секцию «Чего не делать» карточки инцидента.

Источник истины — один YAML-файл: src/config/regulations.yaml. Он проверяется zod-схемой при загрузке; неверный YAML валит билд.

Что можно прямо сейчас:
• Прочитать все выдержки регламентов по сценариям (ЕДДС Кольцово, Инструкция НГУ по пожару и подозрительным предметам, демо-регламенты по протечке, проникновению, СКУД, лесопарку).
• Прочитать «Чего не делать» по пяти типам риска (термический, вода, воздух, безопасность, операционный).
• Скачать оригинальный YAML-файл — для отправки заказчику, коммита в Git или ручной правки.
• Скачать ту же структуру в виде JSON — для интеграций с внешними системами (АИС ЦУКС, тренажёрные платформы).

Что появится в следующей фазе:
• Редактирование прямо в браузере, валидация схемы в реальном времени, live-preview изменений на других экранах (через localStorage).
• Полноценная Studio по образцу NSK OpenData Bot: textarea с подсветкой, табы YAML / Дерево / Справка, кнопки «Проверить» и «Сохранить».

Пока для правки используйте локальную копию файла и обычный git-workflow.`,
  source: 'Phase 4.g · src/config/regulations.yaml',
}

export const RegulationsScreen = () => {
  const navigate = useNavigate()

  const { scenarios: scenariosMap, doNotByRisk } = regulations
  const scenarioEntries = useMemo(
    () =>
      Object.entries(scenariosMap).sort(([a], [b]) => a.localeCompare(b, 'ru')),
    [scenariosMap],
  )

  const doNotEntries = useMemo(
    () =>
      Object.entries(doNotByRisk).sort(([a], [b]) => a.localeCompare(b, 'ru')),
    [doNotByRisk],
  )

  const downloadBlob = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleDownloadYaml = () => {
    downloadBlob('sigma-regulations.yaml', regulationsYaml, 'application/x-yaml')
  }

  const handleDownloadJson = () => {
    downloadBlob(
      'sigma-regulations.json',
      JSON.stringify(regulations, null, 2),
      'application/json',
    )
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#f3f0e8] px-4 py-5 text-zinc-950 md:px-6 lg:px-8">
      <FullscreenButton />
      <div className="mx-auto max-w-[1280px] space-y-5" data-testid="regulations-shell">
        <header className="flex flex-col gap-3 rounded-[2rem] border border-zinc-200/80 bg-white/90 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Регламенты Sigma · Phase 4.g
              </p>
              <InfoButton note={STUDIO_HELP} testId="regulations-help" />
            </div>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-950">
              <BookOpen size={22} weight="duotone" className="text-sky-600" />
              Справочник и запреты
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Всё, что подсвечивается в кнопке «i» и в секции «Чего не делать» —
              живёт в одном YAML. Можно прочитать или скачать целиком.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              aria-label="Скачать регламенты в формате YAML"
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-500 bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-600"
              data-testid="download-yaml"
              onClick={handleDownloadYaml}
              type="button"
            >
              <DownloadSimple size={14} weight="bold" /> YAML
            </button>
            <button
              aria-label="Скачать регламенты в формате JSON"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:border-zinc-400"
              data-testid="download-json"
              onClick={handleDownloadJson}
              type="button"
            >
              <FileCode size={14} weight="duotone" /> JSON
            </button>
            <button
              aria-label="Вернуться в рабочий режим оператора"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-950 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
              onClick={() => navigate('/operator/thermal-incident')}
              type="button"
            >
              <ArrowLeft size={14} weight="bold" /> В оператора
            </button>
          </div>
        </header>

        <Surface className="space-y-4" data-testid="regulations-do-not">
          <div>
            <Eyebrow>«Чего не делать» по стихии риска</Eyebrow>
            <p className="mt-1 text-xs text-zinc-500">
              Отображается в розовой карточке под инцидентом. Ключ — RiskKind сценария.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {doNotEntries.map(([riskKind, rules]) => (
              <article
                key={riskKind}
                className="rounded-[1rem] border border-rose-200 bg-rose-50/60 p-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-rose-800">
                  {riskKind}
                </p>
                <ul className="mt-2 space-y-2">
                  {rules.map((rule) => (
                    <li
                      key={rule}
                      className="rounded-[0.8rem] border border-rose-100 bg-white/80 px-3 py-2 text-xs leading-relaxed text-zinc-700"
                    >
                      {rule}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Surface>

        <Surface className="space-y-4" data-testid="regulations-scenarios">
          <div>
            <Eyebrow>Справочные блоки по сценариям</Eyebrow>
            <p className="mt-1 text-xs text-zinc-500">
              `situation` — справа от заголовка «Обстановка». `actions` — справа от
              «Рекомендуемые действия». Обе секции опциональны.
            </p>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            {scenarioEntries.map(([scenarioId, entry]) => (
              <article
                key={scenarioId}
                className="rounded-[1rem] border border-zinc-200 bg-white p-4"
                data-testid={`regulations-entry-${scenarioId}`}
              >
                <header className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {scenarioId}
                  </p>
                  <span className="flex gap-1 text-[10px] text-zinc-400">
                    {entry.situation ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">
                        situation
                      </span>
                    ) : null}
                    {entry.actions ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                        actions
                      </span>
                    ) : null}
                  </span>
                </header>
                <div className="mt-3 space-y-3">
                  {entry.situation ? (
                    <section className="rounded-[0.8rem] border border-sky-100 bg-sky-50/70 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-sky-700">
                        <FileText size={12} weight="duotone" />
                        Обстановка
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-zinc-950">
                        {entry.situation.title}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-zinc-700">
                        {entry.situation.body}
                      </p>
                      {entry.situation.source ? (
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-sky-700">
                          {entry.situation.source}
                        </p>
                      ) : null}
                    </section>
                  ) : null}
                  {entry.actions ? (
                    <section className="rounded-[0.8rem] border border-emerald-100 bg-emerald-50/70 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-emerald-700">
                        <FileText size={12} weight="duotone" />
                        Рекомендуемые действия
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-zinc-950">
                        {entry.actions.title}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-zinc-700">
                        {entry.actions.body}
                      </p>
                      {entry.actions.source ? (
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-700">
                          {entry.actions.source}
                        </p>
                      ) : null}
                    </section>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </Surface>

        <Surface className="space-y-3" data-testid="regulations-raw-yaml">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Eyebrow>Исходный YAML</Eyebrow>
              <p className="mt-1 text-xs text-zinc-500">
                Read-only предпросмотр. Правки — в{' '}
                <code className="rounded bg-zinc-100 px-1 font-mono">
                  src/config/regulations.yaml
                </code>{' '}
                или через скачивание.
              </p>
            </div>
          </div>
          <textarea
            className="w-full resize-y rounded-[1rem] border border-zinc-200 bg-zinc-50/80 p-4 font-mono text-xs leading-relaxed text-zinc-800"
            data-testid="regulations-yaml-textarea"
            readOnly
            spellCheck={false}
            style={{ height: '420px' }}
            value={regulationsYaml}
          />
        </Surface>
      </div>
    </div>
  )
}
