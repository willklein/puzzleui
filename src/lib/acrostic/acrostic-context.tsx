'use client'

import { createContext, useContext } from 'react'
import type { UseAcrosticReturn } from './use-acrostic'

const AcrosticContext = createContext<UseAcrosticReturn | null>(null)

export const AcrosticProvider = AcrosticContext.Provider

export function useAcrosticContext(): UseAcrosticReturn {
  const api = useContext(AcrosticContext)
  if (!api) {
    throw new Error('useAcrosticContext must be used within an <Acrostic.Root>')
  }
  return api
}
