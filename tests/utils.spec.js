import { sortObjectKeys } from '../src/utils'

describe('utils', () => {
  describe('sortObjectKeys', () => {
    it('sort the keys of an object', () => {
      const obj = { b: 'b', c: 'c', a: 'a' }

      const sorted = sortObjectKeys(obj)

      const result = { a: 'a', b: 'b', c: 'c' }
      expect(sorted).toStrictEqual(result)
    })
  })
})
