import { Script } from "./radon-script"
import { TYPES } from "./radon-types"

class Source extends Script {
  constructor (url) {
    super([TYPES.BYTES])
    this.url = url
  }
}

class Aggregator extends Script {
  constructor (sources) {
    super([TYPES.ARRAY, TYPES.RESULT, ...sources[0].lastType])
  }
}

class Tally extends Script {
  constructor (aggregate) {
    super([TYPES.ARRAY, TYPES.RESULT, ...aggregate.lastType])
  }
}

export {
  Aggregator,
  Source,
  Tally,
}
