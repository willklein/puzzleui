'use client'

import { forwardRef, useLayoutEffect } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'
import { AcrosticClue } from './acrostic-clue'
import { AcrosticWord } from './acrostic-word'
import type { AcrosticLine as AcrosticLineData } from './acrostic.types'

export interface AcrosticLineProps extends HTMLArkProps<'div'> {
  /** Which line this renders, `0`-indexed. */
  index: number
  /**
   * This line's own clue + layout, as an alternative to including it in
   * Root's `lines` array. Overrides that array's entry at `index` if both
   * are given.
   */
  line?: AcrosticLineData | undefined
}

/** One clue + row of directly-typeable letter boxes. */
export const AcrosticLine = forwardRef<HTMLDivElement, AcrosticLineProps>(({ index, line, ...props }, ref) => {
  const acrostic = useAcrosticContext()
  const mergedProps = mergeProps(acrostic.getLineProps(index), props)

  useLayoutEffect(() => {
    if (!line) return undefined
    acrostic.registerLine(index, line)
    return () => acrostic.unregisterLine(index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, line?.clue, line?.longWordLength, line?.smallWordStart, line?.smallWordEnd])

  return (
    <ark.div {...mergedProps} ref={ref}>
      <AcrosticClue index={index} />
      <AcrosticWord index={index} />
    </ark.div>
  )
})

AcrosticLine.displayName = 'Acrostic.Line'
