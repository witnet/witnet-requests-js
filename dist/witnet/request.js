"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Request = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Request =
/*#__PURE__*/
function () {
  function Request() {
    _classCallCheck(this, Request);

    this.data = {
      data_request: {
        time_lock: Math.floor(Date.now() / 1000),
        retrieve: [],
        aggregate: null,
        tally: null
      },
      value: 0,
      witnesses: 2,
      backup_witnesses: 1,
      extra_commit_rounds: 1,
      extra_reveal_rounds: 1,
      commit_fee: 0,
      reveal_fee: 0,
      tally_fee: 0,
      min_consensus_percentage: 51
    };
    this.dataPointType = null;
  }

  _createClass(Request, [{
    key: "addSource",
    value: function addSource(source) {
      this.data.data_request.retrieve.push(source);
      this.dataPointType = source.lastType;
      return this;
    }
  }, {
    key: "setAggregator",
    value: function setAggregator(aggregator) {
      this.data.data_request.aggregate = aggregator || this.data.data_request.aggregate;
      return this;
    }
  }, {
    key: "setTally",
    value: function setTally(tally) {
      this.data.data_request.tally = tally || this.data.data_request.tally;
      return this;
    }
  }, {
    key: "setQuorum",
    value: function setQuorum(witnesses, backup_witnesses, extra_commit_rounds, extra_reveal_rounds, min_consensus_percentage) {
      this.data.witnesses = witnesses || this.data.witnesses;
      this.data.backup_witnesses = backup_witnesses || this.data.backup_witnesses;
      this.data.extra_commit_rounds = extra_commit_rounds || this.data.extra_commit_rounds;
      this.data.extra_reveal_rounds = extra_reveal_rounds || this.data.extra_reveal_rounds;

      if (min_consensus_percentage < 51 || min_consensus_percentage > 99) {
        throw RangeError("`min_consensus_percentage` needs to be > 50 and < 100");
      }

      this.data.min_consensus_percentage = min_consensus_percentage || this.data.min_consensus_percentage;
      return this;
    }
  }, {
    key: "setFees",
    value: function setFees(reward, commit_fee, reveal_fee, tally_fee) {
      this.data.witness_reward = reward || this.data.value;
      this.data.commit_fee = commit_fee || this.data.commit_fee;
      this.data.reveal_fee = reveal_fee || this.data.reveal_fee;
      this.data.tally_fee = tally_fee || this.data.tally_fee;
      return this;
    }
  }, {
    key: "schedule",
    value: function schedule(timestamp) {
      this.data.data_request.time_lock = timestamp || this.data.data_request.time_lock;
      return this;
    }
  }, {
    key: "setTimestamp",
    value: function setTimestamp(timestamp) {
      return this.schedule(timestamp);
    }
  }, {
    key: "asJson",
    value: function asJson() {
      return this.data;
    }
  }]);

  return Request;
}();

exports.Request = Request;