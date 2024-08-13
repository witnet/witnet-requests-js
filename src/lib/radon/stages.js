import { encode } from 'cbor2';
import { Script } from "./script.js";
import { FILTERS, REDUCERS, RETRIEVAL_METHODS, TYPES } from "./types.js";
import { graphQlSanitize } from "../../utils.js";

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
  constructor (url, rawQuery, headers) {
    const query = graphQlSanitize(rawQuery);
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
        return { op, args:  encode(args) }
      }),
      reducer: this.reducer,
    }
  }

  static deviationAndMean (deviation) {
    return new Joiner([[FILTERS.deviationStandard, deviation]], REDUCERS.averageMean)
  }

  static deviationAndMedian (deviation) {
    return new Joiner([[FILTERS.deviationStandard, deviation]], REDUCERS.averageMedian)
  }

  static mode () {
    return new Joiner([[FILTERS.mode]], REDUCERS.mode)
  }
}

class Aggregator extends Joiner {
  constructor (filters, reducer) {
    if (typeof filters === "object") {
      reducer = filters["reducer"]
      filters = filters["filters"]
    }
    super(filters, reducer);
  }

  static default () {
    return Aggregator.deviationAndMean()
  }

  static deviationAndMean (deviation = 1.5) {
    return super.deviationAndMean(deviation)
  }

  static deviationAndMedian (deviation = 1.5) {
    return super.deviationAndMedian(deviation)
  }
}

class Tally extends Joiner {
  constructor (filters, reducer) {
    if (typeof filters === "object") {
      reducer = filters["reducer"]
      filters = filters["filters"]
    }
    super(filters, reducer);
  }

  static default () {
    return Tally.deviationAndMean()
  }

  static deviationAndMean (deviation = 2.5) {
    return super.deviationAndMean(deviation)
  }

  static deviationAndMedian (deviation = 2.5) {
    return super.deviationAndMedian(deviation)
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
