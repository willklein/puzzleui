/** Merges two prop types, with `U`'s keys overriding `T`'s on conflict. */
export type Assign<T, U> = Omit<T, keyof U> & U
