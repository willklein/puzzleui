'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'
import { AcrosticLetter } from './acrostic-letter'

export interface AcrosticWordProps extends HTMLArkProps<'div'> {
  index: number
}

export const AcrosticWord = forwardRef<HTMLDivElement, AcrosticWordProps>(({ index, ...props }, ref) => {
  const acrostic = useAcrosticContext()
  const mergedProps = mergeProps(acrostic.getWordProps(index), props)
  const word = acrostic.lines[index]?.word ?? ''

  return (
    <ark.div {...mergedProps} ref={ref}>
      {word.split('').map((letter, letterIndex) => (
        <AcrosticLetter key={letterIndex} lineIndex={index} letterIndex={letterIndex}>
          {letter}
        </AcrosticLetter>
      ))}
    </ark.div>
  )
})

AcrosticWord.displayName = 'Acrostic.Word'
