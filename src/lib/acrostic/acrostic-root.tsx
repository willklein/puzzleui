'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrostic, type UseAcrosticProps } from './use-acrostic'
import { AcrosticProvider } from './acrostic-context'
import type { Assign } from '../shared/types'

export interface AcrosticRootProps extends Assign<HTMLArkProps<'div'>, UseAcrosticProps> {}

export const AcrosticRoot = forwardRef<HTMLDivElement, AcrosticRootProps>((props, ref) => {
  const {
    lines,
    solution,
    lettersInNextWord,
    guesses,
    defaultGuesses,
    disabled,
    id,
    onAnswerChange,
    onSolvedChange,
    ...localProps
  } = props

  const acrostic = useAcrostic({
    lines,
    solution,
    lettersInNextWord,
    guesses,
    defaultGuesses,
    disabled,
    id,
    onAnswerChange,
    onSolvedChange,
  })
  const mergedProps = mergeProps(acrostic.getRootProps(), localProps)

  return (
    <AcrosticProvider value={acrostic}>
      <ark.div {...mergedProps} ref={ref} />
    </AcrosticProvider>
  )
})

AcrosticRoot.displayName = 'Acrostic.Root'
