"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Request = void 0;

var _radonTypes = require("./radon-types");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Request =
/*#__PURE__*/
function () {
  function Request() {
    _classCallCheck(this, Request);

    this.data = {
      notBefore: Math.floor(Date.now() / 1000),
      retrieve: [],
      aggregate: {
        script: []
      },
      tally: {
        script: []
      }
    };
    this.lastTypes = {
      retrieve: [],
      aggregate: [],
      tally: []
    };
  }

  _createClass(Request, [{
    key: "addSource",
    value: function addSource(source) {
      this.data.retrieve.push({
        url: source.url,
        script: source.script
      });

      if (this.lastTypes.retrieve.length > 0) {
        var aTypeSig = (0, _radonTypes.typeFormat)(this.lastTypes.retrieve);
        var bTypeSig = (0, _radonTypes.typeFormat)(source.lastType);

        if (aTypeSig !== bTypeSig) {
          console.error("Mismatching output types between different retrieve branches:\nA: ".concat(aTypeSig, "\nB: ").concat(bTypeSig));
        }
      } else {
        this.lastTypes.retrieve = source.lastType;
      }

      return this;
    }
  }, {
    key: "setAggregator",
    value: function setAggregator(aggregator) {
      this.data.aggregate.script = aggregator.script;
      this.lastTypes.aggregate = aggregator.lastType;
      return this;
    }
  }, {
    key: "setTally",
    value: function setTally(tally) {
      this.data.tally.script = tally.script;
      this.lastTypes.tally = tally.lastType;
      return this;
    }
  }, {
    key: "schedule",
    value: function schedule(timestamp) {
      this.data.notBefore = timestamp;
      return this;
    }
  }, {
    key: "asJson",
    value: function asJson(witnesses, backup, commitFee, revealFee, tallyFee) {
      return {
        data_request: this.data,
        witnesses: witnesses,
        backup: backup,
        commit_fee: commitFee || 0,
        reveal_fee: revealFee || 0,
        tally_fee: tallyFee || 0
      };
    }
  }]);

  return Request;
}();

exports.Request = Request;