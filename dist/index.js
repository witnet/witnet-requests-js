"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Script", {
  enumerable: true,
  get: function get() {
    return _radonScript.Script;
  }
});
Object.defineProperty(exports, "Source", {
  enumerable: true,
  get: function get() {
    return _witnetStages.Source;
  }
});
Object.defineProperty(exports, "Aggregator", {
  enumerable: true,
  get: function get() {
    return _witnetStages.Aggregator;
  }
});
Object.defineProperty(exports, "Tally", {
  enumerable: true,
  get: function get() {
    return _witnetStages.Tally;
  }
});
Object.defineProperty(exports, "Request", {
  enumerable: true,
  get: function get() {
    return _witnetRequest.Request;
  }
});
exports.Types = void 0;

var _radonScript = require("./radon-script");

var _witnetStages = require("./witnet-stages");

var _witnetRequest = require("./witnet-request");

var Types = _interopRequireWildcard(require("./radon-types"));

exports.Types = Types;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }