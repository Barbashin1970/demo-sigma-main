import { CornersIn, CornersOut } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

/**
 * Кнопка для входа и выхода из браузерного fullscreen-режима. Полезна на
 * видеостенах и тач-экранах — одним нажатием убирает адресную строку браузера
 * и освобождает всю площадь под UI. На устройствах без Fullscreen API кнопка
 * не рендерится, чтобы не вводить в заблуждение.
 */
export const FullscreenButton = ({ className }: { className?: string }) => {
  const supported = typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!supported) return
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [supported])

  if (!supported) return null

  const toggle = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  }

  return (
    <button
      aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'}
      className={clsx(
        'fixed top-4 right-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 backdrop-blur-sm shadow-[0_10px_24px_-12px_rgba(15,23,42,0.35)] transition',
        isFullscreen
          ? 'border-sky-400 text-sky-700 hover:bg-sky-50'
          : 'border-zinc-200 text-zinc-700 hover:border-sky-400 hover:text-sky-700',
        className,
      )}
      data-testid="fullscreen-toggle"
      onClick={toggle}
      type="button"
    >
      {isFullscreen ? <CornersIn size={18} weight="duotone" /> : <CornersOut size={18} weight="duotone" />}
    </button>
  )
}
