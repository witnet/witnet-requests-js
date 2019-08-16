class Request {
  constructor () {
    this.data = {
      notBefore: Math.floor(Date.now() / 1000),
      retrieve: [],
      aggregate: {
        script: [],
      },
      tally: {
        script: [],
      },
    }
    this.lastTypes = {
      retrieve: [],
      aggregate: [],
      tally: [],
    }
  }
  addSource (source) {
    this.data.retrieve.push({
      url: source.url,
      script: source.script,
    })

    if (this.lastTypes.retrieve.length > 0) {
      const aTypeSig = typeFormat(this.lastTypes.retrieve)
      const bTypeSig = typeFormat(source.lastType)
      if (aTypeSig !== bTypeSig) {
        console.error(`Mismatching output types between different retrieve branches:\nA: ${aTypeSig}\nB: ${bTypeSig}`)
      }
    } else {
      this.lastTypes.retrieve = source.lastType
    }

    return this
  }
  setAggregator (aggregator) {
    this.data.aggregate.script = aggregator.script
    this.lastTypes.aggregate = aggregator.lastType
    return this
  }
  setTally (tally) {
    this.data.tally.script = tally.script
    this.lastTypes.tally = tally.lastType
    return this
  }
  schedule (timestamp) {
    this.data.notBefore = timestamp
    return this
  }
  compile (witnesses, backup, commitFee, revealFee, tallyFee) {
    return {
      data_request: this.data,
      witnesses,
      backup,
      commit_fee: commitFee || 0,
      reveal_fee: revealFee || 0,
      tally_fee: tallyFee || 0,
    }
  }
}

export {
  Request
}
