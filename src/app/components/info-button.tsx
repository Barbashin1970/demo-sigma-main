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
          'inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-900',
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
        className="w-full max-w-md rounded-[1.6rem] border border-white/60 bg-white p-6 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.32)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Справка</p>
            <h3 className="mt-2 text-lg font-semibold leading-tight text-zinc-950">{note.title}</h3>
          </div>
          <button
            aria-label="Закрыть справку"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-900"
            data-testid="info-modal-close"
            onClick={onClose}
            type="button"
          >
            <X size={14} weight="bold" />
          </button>
        </header>
        <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
          {note.body}
        </div>
        {note.source ? (
          <p className="mt-5 border-t border-zinc-200 pt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            {note.source}
          </p>
        ) : null}
      </section>
    </div>
  )
}
