'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'

export interface AcrosticSolvedIndicatorProps extends HTMLArkProps<'div'> {
  fallback?: React.ReactNode | undefined
}

export const AcrosticSolvedIndicator = forwardRef<HTMLDivElement, AcrosticSolvedIndicatorProps>((props, ref) => {
  const acrostic = useAcrosticContext()
  const { children, fallback, ...restProps } = props
  const mergedProps = mergeProps(acrostic.getSolvedIndicatorProps(), restProps)
  return (
    <ark.div {...mergedProps} ref={ref}>
      {acrostic.solved ? children : fallback}
    </ark.div>
  )
})

AcrosticSolvedIndicator.displayName = 'Acrostic.SolvedIndicator'
