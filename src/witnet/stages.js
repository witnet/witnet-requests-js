import * as CBOR from "cbor"
import { Script } from "../radon/script"
import { TYPES } from "../radon/types"

class Source extends Script {
  constructor (url) {
    super([TYPES.STRING]);
    this.kind = 1;
    this.url = url;
  }
}

class Joiner {
  constructor (filters, reducer) {
    this.filters = filters;
    this.reducer = reducer;
  }

  pack () {
    return {
      filters: this.filters.map(([op, ...raw_args]) => {
        let raw_args_len = raw_args.length;
        let args = raw_args_len > 0 ? raw_args_len > 1 ? raw_args : raw_args[0] : [];
        return { op, args:  CBOR.encode(args) }
      }),
      reducer: this.reducer,
    }
  }
}

class Aggregator extends Joiner {
  constructor ({ filters = [], reducer }) {
    super(filters, reducer);
  }
}

class Tally extends Joiner {
  constructor ({ filters = [], reducer }) {
    super(filters, reducer);
  }
}

export {
  Aggregator,
  Source,
  Tally,
}
