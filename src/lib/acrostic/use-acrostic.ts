'use client'

import { normalizeProps, useMachine, type PropTypes } from '@zag-js/react'
import { machine } from './acrostic.machine'
import { connect } from './acrostic.connect'
import type { AcrosticApi, AcrosticProps } from './acrostic.types'

export interface UseAcrosticProps extends AcrosticProps {}
export interface UseAcrosticReturn extends AcrosticApi<PropTypes> {}

export function useAcrostic(props: UseAcrosticProps): UseAcrosticReturn {
  const service = useMachine(machine, props)
  return connect(service, normalizeProps)
}
