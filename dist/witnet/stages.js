"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tally = exports.Source = exports.Aggregator = void 0;

var CBOR = _interopRequireWildcard(require("cbor"));

var _script = require("../radon/script");

var _types = require("../radon/types");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Source).call(this, [_types.TYPES.STRING]));
    _this.url = url;
    return _this;
  }

  return Source;
}(_script.Script);

exports.Source = Source;

var Joiner =
/*#__PURE__*/
function () {
  function Joiner(filters, reducer) {
    _classCallCheck(this, Joiner);

    this.filters = filters;
    this.reducer = reducer;
  }

  _createClass(Joiner, [{
    key: "pack",
    value: function pack() {
      return {
        filters: this.filters.map(function (_ref) {
          var _ref2 = _toArray(_ref),
              op = _ref2[0],
              raw_args = _ref2.slice(1);

          var raw_args_len = raw_args.length;
          var args = raw_args_len > 0 ? raw_args_len > 1 ? raw_args : raw_args[0] : [];
          return {
            op: op,
            args: CBOR.encode(args)
          };
        }),
        reducer: this.reducer
      };
    }
  }]);

  return Joiner;
}();

var Aggregator =
/*#__PURE__*/
function (_Joiner) {
  _inherits(Aggregator, _Joiner);

  function Aggregator(_ref3) {
    var _ref3$filters = _ref3.filters,
        filters = _ref3$filters === void 0 ? [] : _ref3$filters,
        reducer = _ref3.reducer;

    _classCallCheck(this, Aggregator);

    return _possibleConstructorReturn(this, _getPrototypeOf(Aggregator).call(this, filters, reducer));
  }

  return Aggregator;
}(Joiner);

exports.Aggregator = Aggregator;

var Tally =
/*#__PURE__*/
function (_Joiner2) {
  _inherits(Tally, _Joiner2);

  function Tally(_ref4) {
    var _ref4$filters = _ref4.filters,
        filters = _ref4$filters === void 0 ? [] : _ref4$filters,
        reducer = _ref4.reducer;

    _classCallCheck(this, Tally);

    return _possibleConstructorReturn(this, _getPrototypeOf(Tally).call(this, filters, reducer));
  }

  return Tally;
}(Joiner);

exports.Tally = Tally;