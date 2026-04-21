import { Info, X } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import type { RegulationNote } from '../references'

interface InfoButtonProps {
  note: RegulationNote | null | undefined
  className?: string
  testId?: string
}

/**
 * Маленькая кнопка «i» + модалка со справкой.
 * Используется возле заголовков секций, где есть привязка к регламенту/СОП.
 * Не рендерит ничего, если справочные данные не заданы.
 */
export const InfoButton = ({ note, className, testId = 'info-button' }: InfoButtonProps) => {
  const [open, setOpen] = useState(false)

  if (!note) return null

  return (
    <>
      <button
        aria-label={`Справка: ${note.title}`}
        className={clsx(
          'inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:border-sky-400 hover:bg-sky-100 hover:text-sky-700',
          className,
        )}
        data-testid={testId}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Info size={13} weight="bold" />
      </button>
      {open ? <InfoModal note={note} onClose={() => setOpen(false)} /> : null}
    </>
  )
}

const InfoModal = ({ note, onClose }: { note: RegulationNote; onClose: () => void }) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      aria-label={`Справка: ${note.title}`}
      aria-modal
      className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/30 px-4 py-6 backdrop-blur-sm"
      data-testid="info-modal"
      onClick={onClose}
      role="dialog"
    >
      <section
        className="w-full max-w-md rounded-[1.6rem] border border-sky-200/90 bg-sky-50/95 p-6 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.32)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span aria-hidden className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sky-600 shadow-[0_6px_16px_-10px_rgba(14,165,233,0.45)]">
              <Info size={18} weight="duotone" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-700">Справка</p>
              <h3 className="mt-1 text-lg font-semibold leading-tight text-zinc-950">{note.title}</h3>
            </div>
          </div>
          <button
            aria-label="Закрыть справку"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-600 transition hover:border-sky-400 hover:text-sky-700"
            data-testid="info-modal-close"
            onClick={onClose}
            type="button"
          >
            <X size={14} weight="bold" />
          </button>
        </header>
        <div className="mt-4 rounded-[1.1rem] border border-sky-100/80 bg-white/80 p-4 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
          {note.body}
        </div>
        {note.source ? (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-sky-700">
            {note.source}
          </p>
        ) : null}
      </section>
    </div>
  )
}
