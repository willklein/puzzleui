'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { ark } from '@ark-ui/react/factory'
import { useCryptexContext } from './cryptex-context'

export interface CryptexWheelProps {
  /** Which wheel (word position) this renders, `0`-indexed. */
  index: number
  /** The candidate letters for this wheel, top-to-bottom. */
  letters: string[]
  className?: string
}

/**
 * One rotating "wheel" of the cryptex: a reel of candidate letters for a
 * single position in the word. Only one wheel is in the tab order at a
 * time (roving tabindex) — arrow up/down dials through this wheel's
 * candidates, arrow left/right moves focus to the neighboring wheel.
 */
export const CryptexWheel = forwardRef<HTMLDivElement, CryptexWheelProps>(({ index, letters, className }, ref) => {
  const cryptex = useCryptexContext()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wheelProps = cryptex.getWheelProps(index)
  const current = cryptex.value[index]

  useEffect(() => {
    if (cryptex.focusedIndex === index && document.activeElement !== buttonRef.current) {
      buttonRef.current?.focus()
    }
  }, [cryptex.focusedIndex, index])

  const currentPos = Math.max(letters.indexOf(current), 0)
  const prevLetter = letters[(currentPos - 1 + letters.length) % letters.length]
  const nextLetter = letters[(currentPos + 1) % letters.length]

  return (
    <div ref={ref} className={className} data-scope="cryptex" data-part="wheel-track">
      <button
        type="button"
        data-scope="cryptex"
        data-part="wheel-step"
        data-direction="up"
        aria-label="Previous letter"
        tabIndex={-1}
        disabled={cryptex.disabled}
        onClick={() => cryptex.stepValueAtIndex(index, -1)}
      >
        ▲
      </button>

      <div data-scope="cryptex" data-part="wheel-reel">
        <span data-scope="cryptex" data-part="wheel-letter" data-position="prev" aria-hidden="true">
          {prevLetter}
        </span>
        <ark.button {...wheelProps} ref={buttonRef}>
          {current}
        </ark.button>
        <span data-scope="cryptex" data-part="wheel-letter" data-position="next" aria-hidden="true">
          {nextLetter}
        </span>
      </div>

      <button
        type="button"
        data-scope="cryptex"
        data-part="wheel-step"
        data-direction="down"
        aria-label="Next letter"
        tabIndex={-1}
        disabled={cryptex.disabled}
        onClick={() => cryptex.stepValueAtIndex(index, 1)}
      >
        ▼
      </button>
    </div>
  )
})

CryptexWheel.displayName = 'Cryptex.Wheel'
