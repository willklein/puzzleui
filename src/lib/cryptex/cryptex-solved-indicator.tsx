'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useCryptexContext } from './cryptex-context'

export interface CryptexSolvedIndicatorProps extends HTMLArkProps<'div'> {
  /** Content to render while the puzzle is not yet solved. */
  fallback?: React.ReactNode | undefined
}

export const CryptexSolvedIndicator = forwardRef<HTMLDivElement, CryptexSolvedIndicatorProps>((props, ref) => {
  const cryptex = useCryptexContext()
  const { children, fallback, ...restProps } = props
  const mergedProps = mergeProps(cryptex.getSolvedIndicatorProps(), restProps)
  return (
    <ark.div {...mergedProps} ref={ref}>
      {cryptex.solved ? children : fallback}
    </ark.div>
  )
})

CryptexSolvedIndicator.displayName = 'Cryptex.SolvedIndicator'
