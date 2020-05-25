class Request {
  constructor () {
    this.data = {
      data_request: {
        time_lock: Math.floor(Date.now() / 1000),
        retrieve: [],
        aggregate: null,
        tally: null,
      },
      value: 0,
      witnesses: 2,
      backup_witnesses: 1,
      extra_commit_rounds: 1,
      extra_reveal_rounds: 1,
      commit_fee: 0,
      reveal_fee: 0,
      tally_fee: 0,
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
    this.data.data_request.aggregate = aggregator || this.data.data_request.aggregate;

    return this
  }
  setTally (tally) {
    this.data.data_request.tally = tally || this.data.data_request.tally;

    return this
  }
  setQuorum (witnesses, backup_witnesses, extra_commit_rounds, extra_reveal_rounds, min_consensus_percentage) {
    this.data.witnesses = witnesses || this.data.witnesses;
    this.data.backup_witnesses = backup_witnesses || this.data.backup_witnesses;
    this.data.extra_commit_rounds = extra_commit_rounds || this.data.extra_commit_rounds;
    this.data.extra_reveal_rounds = extra_reveal_rounds || this.data.extra_reveal_rounds;

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
      throw RangeError("`collateral` needs to be > 1 WIT");
    }  
    return this
  }
  setFees (reward, commit_fee, reveal_fee, tally_fee) {
    this.data.witness_reward = reward || this.data.value;
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
