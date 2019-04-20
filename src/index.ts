import * as React from 'react'
import {} from 'firebase/app'
const { useState, useEffect } = React

interface CollectionState {
  snap: firebase.firestore.QuerySnapshot | undefined
  error: Error | null
}
export function useCollection(
  queryBuilder: () => firebase.firestore.Query | undefined,
  deps: any[] = [],
  { get } = { get: false },
): firebase.firestore.QuerySnapshot | undefined {
  const [state, setState] = useState<CollectionState>({
    snap: undefined,
    error: null,
  })
  if (state.error) {
    throw state.error
  }
  useEffect(() => {
    const query = queryBuilder()
    if (query) {
      if (get) {
        try {
          query
            .get()
            .then(snap => setState({ snap, error: null }))
            .catch(reason => {
              console.log('** Reason Message: **', reason)
              setState({ snap: undefined, error: reason })
            })
        } catch (e) {
          console.log('*** caught e:' + e.message, e)
        }
        return
      }
      const unsub = query.onSnapshot(
        snap => setState({ snap, error: null }),
        error => setState({ snap: undefined, error }),
      )
      return () => (console.log('unsub col'), unsub())
    } else {
      setState({ snap: undefined, error: null })
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, get])
  return state.snap
}

export function useCollectionData<T extends object>(
  queryBuilder: () => firebase.firestore.Query | undefined,
  deps: any[] = [],
): Array<T & { id: string }> | undefined {
  const snap = useCollection(queryBuilder, deps)
  return snap
    ? snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }))
    : undefined
}

interface DocumentState {
  snap: firebase.firestore.DocumentSnapshot | undefined
  error: Error | null
}
export function useDocument(
  refBuilder: () => firebase.firestore.DocumentReference | undefined,
  deps: any[] = [],
): firebase.firestore.DocumentSnapshot | undefined {
  const [state, setState] = useState<DocumentState>({
    snap: undefined,
    error: null,
  })
  if (state.error) {
    throw state.error
  }
  useEffect(() => {
    const ref = refBuilder()
    if (ref) {
      const unsub = ref.onSnapshot(
        snap => setState({ snap, error: null }),
        error => {
          setState({ snap: undefined, error })
        },
      )
      return () => (console.log('unsub doc'), unsub())
    } else {
      setState({ snap: undefined, error: null })
    }
    return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return state.snap
}

export function useDocumentData<T extends object>(
  refBuilder: () => firebase.firestore.DocumentReference | undefined,
  deps: any[] = [],
): T & { id: string } | null | undefined {
  const snap = useDocument(refBuilder, deps)
  return snap
    ? snap.exists
      ? { id: snap.id, ...(snap.data() as T) }
      : null
    : undefined
}

export interface UserWithClaims extends firebase.User {
  claims: { [key: string]: any }
}
export function useAuthState(
  auth: firebase.auth.Auth,
  { withClaims } = { withClaims: false },
): UserWithClaims | null | undefined {
  let curr = undefined as UserWithClaims | null | undefined
  // if withClaims, then we'll have to load, so keep as undefined
  if (auth.currentUser && !withClaims) {
    curr = Object.assign(auth.currentUser, { claims: {} })
  }
  const [user, setUser] = useState(curr)
  useEffect(() => {
    auth.onAuthStateChanged(async u => {
      if (withClaims && u) {
        const token = await u.getIdTokenResult(true)
        const userWithClaims: UserWithClaims = Object.assign(u, {
          claims: token.claims,
        })
        setUser(userWithClaims)
      } else if (u) {
        const userWithClaims: UserWithClaims = Object.assign(u, { claims: {} })
        setUser(userWithClaims)
      } else {
        setUser(null)
      }
    })
  }, [auth, withClaims])
  return user
}
