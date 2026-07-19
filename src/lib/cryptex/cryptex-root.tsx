'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useCryptex, type UseCryptexProps } from './use-cryptex'
import { CryptexProvider } from './cryptex-context'
import type { Assign } from '../shared/types'

export interface CryptexRootProps extends Assign<HTMLArkProps<'div'>, UseCryptexProps> {}

export const CryptexRoot = forwardRef<HTMLDivElement, CryptexRootProps>((props, ref) => {
  const { letters, solution, value, defaultValue, disabled, id, onValueChange, onSolvedChange, ...localProps } =
    props

  const cryptex = useCryptex({ letters, solution, value, defaultValue, disabled, id, onValueChange, onSolvedChange })
  const mergedProps = mergeProps(cryptex.getRootProps(), localProps)

  return (
    <CryptexProvider value={cryptex}>
      <ark.div {...mergedProps} ref={ref} />
    </CryptexProvider>
  )
})

CryptexRoot.displayName = 'Cryptex.Root'
