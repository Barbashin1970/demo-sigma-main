import type { IconWeight } from '@phosphor-icons/react'
import { createElement } from 'react'

import type { IconComponent } from './icons'

type IconGlyphProps = {
  of: IconComponent
  size?: number
  weight?: IconWeight
  className?: string
}

export const IconGlyph = ({ of, size = 16, weight = 'duotone', className }: IconGlyphProps) =>
  createElement(of, { size, weight, className })
