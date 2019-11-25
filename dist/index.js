"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Script", {
  enumerable: true,
  get: function get() {
    return _script.Script;
  }
});
Object.defineProperty(exports, "Source", {
  enumerable: true,
  get: function get() {
    return _stages.Source;
  }
});
Object.defineProperty(exports, "Aggregator", {
  enumerable: true,
  get: function get() {
    return _stages.Aggregator;
  }
});
Object.defineProperty(exports, "Tally", {
  enumerable: true,
  get: function get() {
    return _stages.Tally;
  }
});
Object.defineProperty(exports, "Request", {
  enumerable: true,
  get: function get() {
    return _request.Request;
  }
});
exports.Ethereum = exports.Types = exports.TYPES = void 0;

var _script = require("./radon/script");

var _stages = require("./witnet/stages");

var _request = require("./witnet/request");

var Types = _interopRequireWildcard(require("./radon/types"));

exports.Types = Types;

var Ethereum = _interopRequireWildcard(require("./ethereum"));

exports.Ethereum = Ethereum;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

var TYPES = Types.TYPES;
exports.TYPES = TYPES;