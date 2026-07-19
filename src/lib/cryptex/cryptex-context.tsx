'use client'

import { createContext, useContext } from 'react'
import type { UseCryptexReturn } from './use-cryptex'

const CryptexContext = createContext<UseCryptexReturn | null>(null)

export const CryptexProvider = CryptexContext.Provider

export function useCryptexContext(): UseCryptexReturn {
  const api = useContext(CryptexContext)
  if (!api) {
    throw new Error('useCryptexContext must be used within a <Cryptex.Root>')
  }
  return api
}
