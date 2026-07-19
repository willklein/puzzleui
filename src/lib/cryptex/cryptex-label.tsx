'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useCryptexContext } from './cryptex-context'

export interface CryptexLabelProps extends HTMLArkProps<'div'> {}

export const CryptexLabel = forwardRef<HTMLDivElement, CryptexLabelProps>((props, ref) => {
  const cryptex = useCryptexContext()
  const mergedProps = mergeProps(cryptex.getLabelProps(), props)
  return <ark.div {...mergedProps} ref={ref} />
})

CryptexLabel.displayName = 'Cryptex.Label'
