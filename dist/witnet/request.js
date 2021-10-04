"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Request = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Request = /*#__PURE__*/function () {
  function Request() {
    _classCallCheck(this, Request);

    this.data = {
      data_request: {
        retrieve: [],
        aggregate: null,
        tally: null
      },
      value: 0,
      witnesses: 2,
      commit_and_reveal_fee: 0,
      collateral: 1000000000,
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
    value: function setQuorum(witnesses, min_consensus_percentage) {
      this.data.witnesses = witnesses || this.data.witnesses;

      if (min_consensus_percentage < 51 || min_consensus_percentage > 99) {
        throw RangeError("`min_consensus_percentage` needs to be > 50 and < 100");
      }

      this.data.min_consensus_percentage = min_consensus_percentage || this.data.min_consensus_percentage;
      return this;
    }
  }, {
    key: "setCollateral",
    value: function setCollateral(collateral) {
      if (collateral >= 1000000000) {
        this.data.collateral = collateral;
      } else {
        throw RangeError("`collateral (in nanoWits)` needs to be >= 1 WIT");
      }

      return this;
    }
  }, {
    key: "setFees",
    value: function setFees(reward, commit_and_reveal_fee) {
      this.data.witness_reward = reward || this.data.value;
      this.data.commit_and_reveal_fee = commit_and_reveal_fee || this.data.commit_and_reveal_fee;
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