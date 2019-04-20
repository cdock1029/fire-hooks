# fire-hooks

> React hooks for firebase

[![NPM](https://img.shields.io/npm/v/@cdock/fire-hooks.svg)](https://www.npmjs.com/package/@cdock/fire-hooks)

## Install

```bash
npm install --save @cdock/fire-hooks
```

## Usage

```tsx
import * as React from 'react'
import firebase from '../firebase'
import { useCollectionData } from '@cdock/fire-hooks'

interface Cat {
  name: string
  breed: string
}

function CatList({ ownerId }) {
  const cats = useCollectionData<Cat>(() => {
    if (ownerId) {
      return firebase
        .collection('pets')
        .doc(ownerId)
        .collection('cats')
    }
  }, [ownerId])

  if (typeof cats === 'undefined') {
    return <span>Loading...</span>
  }
  return cats ? (
    <ul>
      {cats.map(c => (
        <li key={c.id}>
          Name: {c.name}, Breed: {c.breed}
        </li>
      ))}
    </ul>
  ) : (
    <h1>No cats found</h1>
  )
}

function App() {
  const user = useAuthState(firebase.auth(), { withClaims: true })
  if (typeof user === 'undefined') {
    return <span>Loading...</span>
  }
  return user ? (
    <ErrorBoundary>
      <CatList ownerId={user.claims.ownerId} />
    </ErrorBoundary>
  ) : (
    <Login />
  )
}
```

### License

MIT © [cdock1029](https://github.com/cdock1029)
