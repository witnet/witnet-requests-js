import {FILTERS, REDUCERS} from "./types";

class Request {
  constructor () {
    this.data = {
      data_request: {
        retrieve: [],
        aggregate: null,
        tally: null,
      },
      value: 0,
      witnesses: 2,
      commit_and_reveal_fee: 0,
      collateral: 1000000000,
      min_consensus_percentage: 51
    };
    this.dataPointType = null;
  }
  addSource (source) {
    this.data.data_request.retrieve.push(source);
    this.dataPointType = source.lastType;

    return this
  }
  setAggregator (aggregator) {
    if (aggregator instanceof Function) aggregator = aggregator();

    // Reject unsupported reducers
    if (!(Object.values(REDUCERS).includes(aggregator.reducer))) {
      throw Error(`Aggregator error. Reducer ${aggregator.reducer} is not supported. Please choose one of: ${["", ...Object.keys(REDUCERS)].join(`\n    - Witnet.Types.REDUCERS.`)}`)
    }

    for (let [index, filter] of aggregator.filters.entries()) {
      // Sanitize malformed filters
      if (!(Array.isArray(filter))) {
        filter = aggregator.filters[index] = [filter]
      }
      // Reject unsupported filters
      if (!(Object.values(FILTERS).includes(filter[0]))) {
        throw Error(`Aggregator error. Filter ${filter[0]} is not supported. Please choose one of: ${["", ...Object.keys(FILTERS)].join(`\n    - Witnet.Types.FILTERS.`)}`)
      }
    }

    this.data.data_request.aggregate = aggregator;

    return this
  }
  setTally (tally) {
    if (tally instanceof Function) tally = tally();

    // Reject unsupported reducers
    if (!(Object.values(REDUCERS).includes(tally.reducer))) {
      throw Error(`Tally error. Reducer ${tally.reducer} is not supported. Please choose one of: ${["", ...Object.keys(REDUCERS)].join(`\n    - Witnet.Types.REDUCERS.`)}`)
    }

    for (let [index, filter] of tally.filters.entries()) {
      // Sanitize malformed filters
      if (!(Array.isArray(filter))) {
        filter = tally.filters[index] = [filter]
      }
      // Reject unsupported filters
      if (!(Object.values(FILTERS).includes(filter[0]))) {
        throw Error(`Tally error. Filter ${filter[0]} is not supported. Please choose one of: ${["", ...Object.keys(FILTERS)].join(`\n    - Witnet.Types.FILTERS.`)}`)
      }
    }
    this.data.data_request.tally = tally;

    return this
  }
  setQuorum (witnesses, min_consensus_percentage) {
    this.data.witnesses = witnesses || this.data.witnesses;

    if (min_consensus_percentage < 51 || min_consensus_percentage > 99) {
      throw RangeError("`min_consensus_percentage` needs to be > 50 and < 100")
    }
    this.data.min_consensus_percentage = min_consensus_percentage || this.data.min_consensus_percentage;

    return this
  }
  setCollateral (collateral) {
    if (collateral >= 1000000000){
      this.data.collateral = collateral;
    } else {
      throw RangeError("`collateral (in nanoWits)` needs to be >= 1 WIT");
    }
    return this
  }
  setFees (reward, commit_and_reveal_fee) {
    this.data.witness_reward = reward || this.data.value;
    this.data.commit_and_reveal_fee = commit_and_reveal_fee || this.data.commit_and_reveal_fee;
    return this
  }
  schedule (timestamp) {
    this.data.data_request.time_lock = timestamp || this.data.data_request.time_lock;

    return this
  }
  setTimestamp (timestamp) {
    return this.schedule(timestamp)
  }
  asJson () {
    return this.data
  }
}

export {
  Request
}
