'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'

export interface AcrosticLetterProps extends HTMLArkProps<'button'> {
  lineIndex: number
  letterIndex: number
}

export const AcrosticLetter = forwardRef<HTMLButtonElement, AcrosticLetterProps>(
  ({ lineIndex, letterIndex, ...props }, ref) => {
    const acrostic = useAcrosticContext()
    const mergedProps = mergeProps(acrostic.getLetterProps(lineIndex, letterIndex), props)
    return <ark.button {...mergedProps} ref={ref} />
  },
)

AcrosticLetter.displayName = 'Acrostic.Letter'
