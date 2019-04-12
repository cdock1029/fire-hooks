import * as React from 'react'
import { useDocumentData } from '.'

interface Example {
  a: string
  b: number
}

function Comp() {
  const thing = useDocumentData<Example>(() => undefined)
  if (thing) {
    console.log(typeof thing.a === 'string')
  }
  return <div>rendered</div>
}

describe('ExampleComponent', () => {
  it('is truthy', () => {
    const c = <Comp />
    if (c === null) {
      console.log('no')
    }
    expect(1 + 1).toBe(2)
  })
})
