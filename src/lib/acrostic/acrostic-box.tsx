'use client'

import { forwardRef, useLayoutEffect, useRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'
import { mergeRefs } from '../shared/refs'

export interface AcrosticBoxProps extends HTMLArkProps<'input'> {
  lineIndex: number
  boxIndex: number
}

/**
 * One blank, directly-typeable letter box within a line's guess. Typing a
 * letter auto-advances focus to the next box (and into the next line, once
 * past the last box of the current one).
 */
export const AcrosticBox = forwardRef<HTMLInputElement, AcrosticBoxProps>(({ lineIndex, boxIndex, ...props }, ref) => {
  const acrostic = useAcrosticContext()
  const boxRef = useRef<HTMLInputElement>(null)
  const mergedProps = mergeProps(acrostic.getBoxProps(lineIndex, boxIndex), props)

  useLayoutEffect(() => {
    if (acrostic.focusTarget === `${lineIndex}:${boxIndex}`) {
      boxRef.current?.focus()
    }
  }, [acrostic.focusTarget, lineIndex, boxIndex])

  return <ark.input {...mergedProps} ref={mergeRefs(ref, boxRef)} />
})

AcrosticBox.displayName = 'Acrostic.Box'
