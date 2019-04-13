/**
 * @class ExampleComponent
 */
import * as React from 'react'
import {} from 'firebase/app'
const { useState, useEffect } = React

export function useCollection(
  queryBuilder: () => firebase.firestore.Query | undefined,
  deps: any[] = [],
  { get } = { get: false },
): firebase.firestore.QuerySnapshot | undefined {
  const [snap, setSnap] = useState<
    firebase.firestore.QuerySnapshot | undefined
  >(undefined)
  useEffect(() => {
    const query = queryBuilder()
    if (query) {
      if (get) {
        query
          .get()
          .then(snap => setSnap(snap))
          .catch(error => {
            setSnap(undefined)
            throw error
          })
        return
      }
      const unsub = query.onSnapshot(
        snap => setSnap(snap),
        error => {
          setSnap(undefined)
          throw error
        },
      )
      return () => (console.log('unsub col'), unsub())
    } else {
      setSnap(undefined)
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, get])
  return snap
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

export function useDocument(
  refBuilder: () => firebase.firestore.DocumentReference | undefined,
  deps: any[] = [],
): firebase.firestore.DocumentSnapshot | undefined {
  const [snap, setSnap] = useState<
    firebase.firestore.DocumentSnapshot | undefined
  >(undefined)
  useEffect(() => {
    const ref = refBuilder()
    if (ref) {
      const unsub = ref.onSnapshot(
        snap => setSnap(snap),
        error => {
          setSnap(undefined)
          throw error
        },
      )
      return () => (console.log('unsub doc'), unsub())
    } else {
      setSnap(undefined)
    }
    return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return snap
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
