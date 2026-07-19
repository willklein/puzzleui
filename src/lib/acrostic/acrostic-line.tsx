'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'
import { AcrosticClue } from './acrostic-clue'
import { AcrosticWord } from './acrostic-word'

export interface AcrosticLineProps extends HTMLArkProps<'div'> {
  /** Which line (clue + outer word) this renders, `0`-indexed. */
  index: number
}

/**
 * One clue + outer word row. Renders the clue and the outer word's letters;
 * click (or click-drag) two letters of the word to mark the hidden word
 * spanning them.
 */
export const AcrosticLine = forwardRef<HTMLDivElement, AcrosticLineProps>(({ index, ...props }, ref) => {
  const acrostic = useAcrosticContext()
  const mergedProps = mergeProps(acrostic.getLineProps(index), props)

  return (
    <ark.div {...mergedProps} ref={ref}>
      <AcrosticClue index={index} />
      <AcrosticWord index={index} />
    </ark.div>
  )
})

AcrosticLine.displayName = 'Acrostic.Line'
