import type { Ref, RefCallback } from 'react'

/** Combines multiple refs (object or callback) into a single ref callback. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as { current: T | null }).current = node
      }
    }
  }
}
