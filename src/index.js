import { Script } from "./radon/script"
import { Aggregator, HttpGetSource, HttpPostSource, RandomSource, Tally } from "./witnet/stages"
import { Request } from "./witnet/request"
import * as Types from "./radon/types"
import * as Ethereum from "./ethereum"

const TYPES = Types.TYPES;

export {
  Aggregator,
  Ethereum,
  HttpGetSource,
  HttpPostSource,
  RandomSource,
  Request,
  Script,
  HttpGetSource as Source,
  Tally,
  Types,
  TYPES,
}
