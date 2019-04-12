/**
 * @class ExampleComponent
 */
import * as React from 'react'
import {} from 'firebase/app'
const { useState, useEffect } = React

export interface CollectionResult {
  error?: Error
  snap?: firebase.firestore.QuerySnapshot
}
export function useCollection(
  queryBuilder: () => firebase.firestore.Query | undefined,
  deps: any[] = [],
  { get } = { get: false },
): CollectionResult {
  const [state, setState] = useState({
    error: undefined,
    snap: undefined,
  } as CollectionResult)
  useEffect(() => {
    const query = queryBuilder()
    if (query) {
      if (get) {
        query
          .get()
          .then(snap => setState({ error: undefined, snap }))
          .catch(error => setState({ error, snap: undefined }))
        return
      }
      const unsub = query.onSnapshot(
        snap => setState({ error: undefined, snap }),
        error => setState({ error, snap: undefined }),
      )
      return () => (console.log('unsub col'), unsub())
    } else {
      setState({ error: undefined, snap: undefined })
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, get])
  return state
}

export interface CollectionDataResult<T> {
  error?: Error
  data?: Array<T & { id: string }>
}
export function useCollectionData<T>(
  queryBuilder: () => firebase.firestore.Query | undefined,
  deps: any[] = [],
): CollectionDataResult<T> {
  const { error, snap } = useCollection(queryBuilder, deps)
  return {
    error,
    data: snap
      ? snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }))
      : undefined,
  }
}

interface DocumentResult {
  error?: Error
  snap?: firebase.firestore.DocumentSnapshot
}
export function useDocument(
  refBuilder: () => firebase.firestore.DocumentReference | undefined,
  deps: any[] = [],
): DocumentResult {
  const [state, setState] = useState({
    error: undefined,
    snap: undefined,
  } as DocumentResult)
  useEffect(() => {
    const ref = refBuilder()
    if (ref) {
      const unsub = ref.onSnapshot(
        snap => setState({ error: undefined, snap }),
        error => setState({ error, snap: undefined }),
      )
      return () => (console.log('unsub doc'), unsub())
    } else {
      setState({ error: undefined, snap: undefined })
    }
    return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return state
}

type DocumentDataResult<T> = T & { id: string } | null | undefined
export function useDocumentData<T>(
  refBuilder: () => firebase.firestore.DocumentReference | undefined,
  deps: any[] = [],
): DocumentDataResult<T> {
  const { error, snap } = useDocument(refBuilder, deps)
  if (error) {
    throw error
  }
  return snap
    ? snap.exists
      ? { id: snap.id, ...(snap.data() as T) }
      : null
    : undefined
}

export function useAuthState(
  auth: firebase.auth.Auth,
): firebase.User | null | undefined {
  const [user, setUser] = useState((auth.currentUser || undefined) as (
    | firebase.User
    | null
    | undefined))
  useEffect(() => {
    console.log('run auth effect')
    auth.onAuthStateChanged(u => setUser(u))
  }, [auth])
  return user
}
