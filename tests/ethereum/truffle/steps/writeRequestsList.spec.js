
import { Steps } from '../../../../src/ethereum/truffle'

const writeRequestsList = Steps.writeRequestsList

describe('writeRequestsList', () => {
  describe('when requests file NOT exists', () => {
    it('should write a file in the specified route with the given price feeds', () => {
      const requests = {
        AdaUsdPrice: {
          bytecode: '0x000',
          base: 'ADA',
          quote: 'USD',
          decimals: 6
        },
      }
      const fsMock = {
        existsSync: jest.fn(() => false),
        writeFileSync: jest.fn(),
        readFileSync: jest.fn()
      }

      writeRequestsList(requests, './', fsMock)

      expect(fsMock.writeFileSync).toBeCalledWith('./witnet.requests.json', JSON.stringify(requests, null, 4))
    })
  })

  describe('when requests file exists and contains requests', () => {
    it('should overwrite the fields that both requests have and add missing fields with the new ones', () => {
      const oldRequests = {
        AdaUsdPrice: {
          bytecode: '0xaaa',
          base: 'ADA',
          quote: 'USD',
          decimals: 6
        },
        WbtcUsd: {
          bytecode: '0xbbb',
          base: 'WBTC',
          quote: 'USD',
          decimals: 6
        }
      }
      const newRequests = {
        AdaUsdPrice: {
          bytecode: '0x000',
          base: 'ADA',
          quote: 'USD',
          decimals: 6
        },
        WbtcUsd: {
          bytecode: '0xbbb',
          decimals: 9
        },
        XlmUsdPrice: {
          bytecode: '0xccc',
          base: 'XLM',
          quote: 'USD',
          decimals: 9
        }
      }
      const fsMock = {
        existsSync: jest.fn(() => true),
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(() => JSON.stringify(oldRequests))
      }

      writeRequestsList(newRequests, './', fsMock)

      const resultRequests = {
        AdaUsdPrice: {
          bytecode: '0x000',
          base: 'ADA',
          quote: 'USD',
          decimals: 6
        },
        WbtcUsd: {
          bytecode: '0xbbb',
          base: 'WBTC',
          quote: 'USD',
          decimals: 9
        },
        XlmUsdPrice: {
          bytecode: '0xccc',
          base: 'XLM',
          quote: 'USD',
          decimals: 9
        }
      }
      expect(fsMock.writeFileSync).toBeCalledWith('./witnet.requests.json', JSON.stringify(resultRequests, null, 4))
    })

    it('should overwrite bytecode field if the new request is routed', () => {
      const oldRequests = {
        GlintUsdPrice: {
          bytecode: '0xfabada',
          base: 'GLINT',
          quote: 'USD',
          decimals: 6
        }

      }
      const newRequests = {
        GlintUsdPrice: {
          base: 'GLINT',
          quote: 'USD',
          decimals: 6
        }
      }
      const fsMock = {
        existsSync: jest.fn(() => true),
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(() => JSON.stringify(oldRequests))
      }

      writeRequestsList(newRequests, './', fsMock)

      const resultRequests = {
        GlintUsdPrice: {
          base: 'GLINT',
          quote: 'USD',
          decimals: 6
        }
      }
      expect(fsMock.writeFileSync).toBeCalledWith('./witnet.requests.json', JSON.stringify(resultRequests, null, 4))
    })
  })

  describe('when requests file exists but it is empty', () => {
    it('should not use existing requests', () => {
      const requests = {
        AdaUsdPrice: {
          bytecode: '0x000',
          base: 'ADA',
          quote: 'USD',
          decimals: 6
        },
      }
      const fsMock = {
        existsSync: jest.fn(() => false),
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(() => '""')
      }

      writeRequestsList(requests, './', fsMock)

      expect(fsMock.writeFileSync).toBeCalledWith('./witnet.requests.json', JSON.stringify(requests, null, 4))
    })
  })
})
