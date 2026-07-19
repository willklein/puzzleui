'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'
import { AcrosticBox } from './acrostic-box'

export interface AcrosticWordProps extends HTMLArkProps<'div'> {
  index: number
}

export const AcrosticWord = forwardRef<HTMLDivElement, AcrosticWordProps>(({ index, ...props }, ref) => {
  const acrostic = useAcrosticContext()
  const mergedProps = mergeProps(acrostic.getWordProps(index), props)
  const length = acrostic.lines[index]?.longWordLength ?? 0

  return (
    <ark.div {...mergedProps} ref={ref}>
      {Array.from({ length }, (_, boxIndex) => (
        <AcrosticBox key={boxIndex} lineIndex={index} boxIndex={boxIndex} />
      ))}
    </ark.div>
  )
})

AcrosticWord.displayName = 'Acrostic.Word'
