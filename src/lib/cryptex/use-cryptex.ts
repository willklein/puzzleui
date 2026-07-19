'use client'

import { normalizeProps, useMachine, type PropTypes } from '@zag-js/react'
import { machine } from './cryptex.machine'
import { connect } from './cryptex.connect'
import type { CryptexApi, CryptexProps } from './cryptex.types'

export interface UseCryptexProps extends CryptexProps {}
export interface UseCryptexReturn extends CryptexApi<PropTypes> {}

export function useCryptex(props: UseCryptexProps): UseCryptexReturn {
  const service = useMachine(machine, props)
  return connect(service, normalizeProps)
}
