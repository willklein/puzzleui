/** Renders a boolean as the presence/absence of a `data-*` attribute, Zag-style. */
export function dataAttr(condition: boolean | undefined): true | undefined {
  return condition ? true : undefined
}
