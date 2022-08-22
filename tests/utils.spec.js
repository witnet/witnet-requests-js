import {graphQlSanitize, sortObjectKeys} from '../src/utils'

describe('utils', () => {
  describe('graphQlSanitize', () => {
    const input = "{\n      pair\t (id: \"0x81e11a9374033d11cc7e7485a7192ae37d0795d6\") {\n        token1Price\r      }"
    const expected = "{pair(id:\"0x81e11a9374033d11cc7e7485a7192ae37d0795d6\"){token1Price}"
    const result = graphQlSanitize(input)

    expect(result).toStrictEqual(expected)
  })

  describe('sortObjectKeys', () => {
    it('sort the keys of an object', () => {
      const obj = { b: 'b', c: 'c', a: 'a' }

      const sorted = sortObjectKeys(obj)

      const result = { a: 'a', b: 'b', c: 'c' }
      expect(sorted).toStrictEqual(result)
    })
  })
})
