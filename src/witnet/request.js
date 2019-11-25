import { typeFormat } from "../radon/types";

class Request {
  constructor () {
    this.data = {
      data_request: {
        time_lock: Math.floor(Date.now() / 1000),
        retrieve: [],
        aggregate: {
          script: [],
        },
        tally: {
          script: [],
        },
      },
      value: 0,
      witnesses: 2,
      backup_witnesses: 1,
      extra_reveal_rounds: 1,
      commit_fee: 0,
      reveal_fee: 0,
      tally_fee: 0,
    };
    this.lastTypes = {
      retrieve: [],
      aggregate: [],
      tally: [],
    }
  }
  addSource (source) {
    this.data.data_request.retrieve.push(source);

    if (this.lastTypes.retrieve.length > 0) {
      const aTypeSig = typeFormat(this.lastTypes.retrieve);
      const bTypeSig = typeFormat(source.lastType);
      if (aTypeSig !== bTypeSig) {
        console.error(`Mismatching output types between different retrieve branches:\nA: ${aTypeSig}\nB: ${bTypeSig}`)
      }
    } else {
      this.lastTypes.retrieve = source.lastType
    }

    return this
  }
  setAggregator (aggregator) {
    this.data.data_request.aggregate = aggregator || this.data.data_request.aggregate;
    this.lastTypes.aggregate = aggregator.lastType;
    return this
  }
  setTally (tally) {
    this.data.data_request.tally = tally || this.data.data_request.tally;
    this.lastTypes.tally = tally.lastType;
    return this
  }
  setQuorum (witnesses, backup_witnesses, extra_reveal_rounds) {
    this.data.witnesses = witnesses || this.data.witnesses;
    this.data.backup_witnesses = backup_witnesses || this.data.backup_witnesses;
    this.data.extra_reveal_rounds = extra_reveal_rounds || this.data.extra_reveal_rounds;
    return this
  }
  setFees (reward, commit_fee, reveal_fee, tally_fee) {
    this.data.value = reward || this.data.value;
    this.data.commit_fee = commit_fee || this.data.commit_fee;
    this.data.reveal_fee = reveal_fee || this.data.reveal_fee;
    this.data.tally_fee = tally_fee || this.data.tally_fee;
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
