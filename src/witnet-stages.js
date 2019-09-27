import { Script } from "./radon-script"
import { TYPES } from "./radon-types"

class Source extends Script {
  constructor (url) {
    super([TYPES.STRING])
    this.url = url
  }
}

class Aggregator extends Script {
  constructor (sources) {
    super([TYPES.ARRAY, ...sources[0].lastType])
  }
}

class Tally extends Script {
  constructor (aggregate) {
    super([TYPES.ARRAY, ...aggregate.lastType])
  }
}

export {
  Aggregator,
  Source,
  Tally,
}
