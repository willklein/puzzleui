'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useAcrosticContext } from './acrostic-context'

export interface AcrosticAnswerProps extends HTMLArkProps<'div'> {}

export const AcrosticAnswer = forwardRef<HTMLDivElement, AcrosticAnswerProps>((props, ref) => {
  const acrostic = useAcrosticContext()
  const { children, ...restProps } = props
  const mergedProps = mergeProps(acrostic.getAnswerProps(), restProps)
  return (
    <ark.div {...mergedProps} ref={ref}>
      {children ?? acrostic.answer.split('').join(' ')}
    </ark.div>
  )
})

AcrosticAnswer.displayName = 'Acrostic.Answer'
