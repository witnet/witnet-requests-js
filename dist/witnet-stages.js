"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tally = exports.Source = exports.Aggregator = void 0;

var _radonScript = require("./radon-script");

var _radonTypes = require("./radon-types");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Source =
/*#__PURE__*/
function (_Script) {
  _inherits(Source, _Script);

  function Source(url) {
    var _this;

    _classCallCheck(this, Source);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Source).call(this, [_radonTypes.TYPES.BYTES]));
    _this.url = url;
    return _this;
  }

  return Source;
}(_radonScript.Script);

exports.Source = Source;

var Aggregator =
/*#__PURE__*/
function (_Script2) {
  _inherits(Aggregator, _Script2);

  function Aggregator(sources) {
    _classCallCheck(this, Aggregator);

    return _possibleConstructorReturn(this, _getPrototypeOf(Aggregator).call(this, [_radonTypes.TYPES.ARRAY, _radonTypes.TYPES.RESULT].concat(_toConsumableArray(sources[0].lastType))));
  }

  return Aggregator;
}(_radonScript.Script);

exports.Aggregator = Aggregator;

var Tally =
/*#__PURE__*/
function (_Script3) {
  _inherits(Tally, _Script3);

  function Tally(aggregate) {
    _classCallCheck(this, Tally);

    return _possibleConstructorReturn(this, _getPrototypeOf(Tally).call(this, [_radonTypes.TYPES.ARRAY, _radonTypes.TYPES.RESULT].concat(_toConsumableArray(aggregate.lastType))));
  }

  return Tally;
}(_radonScript.Script);

exports.Tally = Tally;