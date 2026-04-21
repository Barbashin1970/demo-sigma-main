/// <reference types="node" />

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('repository hygiene', () => {
  it('does not keep Finder metadata files in src', () => {
    expect(existsSync(resolve(process.cwd(), 'src/.DS_Store'))).toBe(false)
  })
})
