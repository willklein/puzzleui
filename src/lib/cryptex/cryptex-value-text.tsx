'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useCryptexContext } from './cryptex-context'

export interface CryptexValueTextProps extends HTMLArkProps<'div'> {}

export const CryptexValueText = forwardRef<HTMLDivElement, CryptexValueTextProps>((props, ref) => {
  const cryptex = useCryptexContext()
  const { children, ...restProps } = props
  const mergedProps = mergeProps(cryptex.getValueTextProps(), restProps)
  return (
    <ark.div {...mergedProps} ref={ref}>
      {children ?? cryptex.guess.padEnd(cryptex.count, '_').split('').join(' ')}
    </ark.div>
  )
})

CryptexValueText.displayName = 'Cryptex.ValueText'
