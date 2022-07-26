import * as CBOR from "cbor"
import { Script } from ".."
import { RETRIEVAL_METHODS, TYPES } from "../radon/types"

class Source extends Script {
  constructor(kind, firstType) {
    super(firstType);
    this.kind = kind;
  }
}

class HttpGetSource extends Source {
  constructor (url, headers) {
    super(RETRIEVAL_METHODS.HttpGet, [TYPES.STRING]);
    this.url = url;
    this.headers = headers && Object.entries(headers).map(([key, value]) => ({ left: key, right: value }));
  }
}

class HttpPostSource extends Source {
  constructor (url, body, headers) {
    super(RETRIEVAL_METHODS.HttpPost, [TYPES.STRING]);
    this.url = url;
    this.body = body;
    this.headers = headers && Object.entries(headers).map(([key, value]) => ({ left: key, right: value }));
  }
}

class GraphQLSource extends HttpPostSource {
  constructor (url, query, headers) {
    super(url, JSON.stringify({ query }), headers);
  }
}

class RandomSource extends Source {
  constructor () {
    super(RETRIEVAL_METHODS.Rng, [TYPES.BYTES]);
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
  GraphQLSource,
  HttpGetSource,
  HttpPostSource,
  RandomSource,
  Tally,
};
