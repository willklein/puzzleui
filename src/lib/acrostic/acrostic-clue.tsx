'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'

export interface AcrosticClueProps extends HTMLArkProps<'div'> {
  index: number
}

export const AcrosticClue = forwardRef<HTMLDivElement, AcrosticClueProps>(({ index, children, ...props }, ref) => {
  const acrostic = useAcrosticContext()
  const mergedProps = mergeProps(acrostic.getClueProps(index), props)
  return (
    <ark.div {...mergedProps} ref={ref}>
      {children ?? acrostic.lines[index]?.clue}
    </ark.div>
  )
})

AcrosticClue.displayName = 'Acrostic.Clue'
