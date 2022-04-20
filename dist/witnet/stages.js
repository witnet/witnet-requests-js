"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tally = exports.RandomSource = exports.HttpPostSource = exports.HttpGetSource = exports.Aggregator = void 0;

var CBOR = _interopRequireWildcard(require("cbor"));

var _ = require("..");

var _types = require("../radon/types");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Source = /*#__PURE__*/function (_Script) {
  _inherits(Source, _Script);

  var _super = _createSuper(Source);

  function Source(kind, firstType) {
    var _this;

    _classCallCheck(this, Source);

    _this = _super.call(this, firstType);
    _this.kind = kind;
    return _this;
  }

  return Source;
}(_.Script);

var HttpGetSource = /*#__PURE__*/function (_Source) {
  _inherits(HttpGetSource, _Source);

  var _super2 = _createSuper(HttpGetSource);

  function HttpGetSource(url) {
    var _this2;

    _classCallCheck(this, HttpGetSource);

    _this2 = _super2.call(this, _types.RETRIEVAL_METHODS.HttpGet, [_types.TYPES.STRING]);
    _this2.url = url;
    return _this2;
  }

  return HttpGetSource;
}(Source);

exports.HttpGetSource = HttpGetSource;

var HttpPostSource = /*#__PURE__*/function (_Source2) {
  _inherits(HttpPostSource, _Source2);

  var _super3 = _createSuper(HttpPostSource);

  function HttpPostSource(url) {
    var _this3;

    _classCallCheck(this, HttpPostSource);

    _this3 = _super3.call(this, _types.RETRIEVAL_METHODS.HttpPost, [_types.TYPES.STRING]);
    _this3.url = url;
    return _this3;
  }

  return HttpPostSource;
}(Source);

exports.HttpPostSource = HttpPostSource;

var RandomSource = /*#__PURE__*/function (_Source3) {
  _inherits(RandomSource, _Source3);

  var _super4 = _createSuper(RandomSource);

  function RandomSource() {
    _classCallCheck(this, RandomSource);

    return _super4.call(this, _types.RETRIEVAL_METHODS.Rng, [_types.TYPES.BYTES]);
  }

  return RandomSource;
}(Source);

exports.RandomSource = RandomSource;

var Joiner = /*#__PURE__*/function () {
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

var Aggregator = /*#__PURE__*/function (_Joiner) {
  _inherits(Aggregator, _Joiner);

  var _super5 = _createSuper(Aggregator);

  function Aggregator(_ref3) {
    var _ref3$filters = _ref3.filters,
        filters = _ref3$filters === void 0 ? [] : _ref3$filters,
        reducer = _ref3.reducer;

    _classCallCheck(this, Aggregator);

    return _super5.call(this, filters, reducer);
  }

  return Aggregator;
}(Joiner);

exports.Aggregator = Aggregator;

var Tally = /*#__PURE__*/function (_Joiner2) {
  _inherits(Tally, _Joiner2);

  var _super6 = _createSuper(Tally);

  function Tally(_ref4) {
    var _ref4$filters = _ref4.filters,
        filters = _ref4$filters === void 0 ? [] : _ref4$filters,
        reducer = _ref4.reducer;

    _classCallCheck(this, Tally);

    return _super6.call(this, filters, reducer);
  }

  return Tally;
}(Joiner);

exports.Tally = Tally;