'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'

export interface AcrosticBoxProps extends HTMLArkProps<'input'> {
  lineIndex: number
  boxIndex: number
}

/** One blank, directly-typeable letter box within a line's guess. */
export const AcrosticBox = forwardRef<HTMLInputElement, AcrosticBoxProps>(
  ({ lineIndex, boxIndex, ...props }, ref) => {
    const acrostic = useAcrosticContext()
    const mergedProps = mergeProps(acrostic.getBoxProps(lineIndex, boxIndex), props)
    return <ark.input {...mergedProps} ref={ref} />
  },
)

AcrosticBox.displayName = 'Acrostic.Box'
