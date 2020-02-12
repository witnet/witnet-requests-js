"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Script = void 0;

var CBOR = _interopRequireWildcard(require("cbor"));

var _types = require("./types");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function unpackArgs(args) {
  return args.map(function (arg) {
    if (arg instanceof Script) {
      arg = arg.script;
    }

    return arg;
  });
}

var Script =
/*#__PURE__*/
function () {
  function Script(firstType) {
    _classCallCheck(this, Script);

    this.script = [];
    this.lastType = firstType;
    var proxy = new Proxy(this, {
      get: function get(target, propKey) {
        return target[propKey] || target.apply(propKey);
      }
    });
    Object.defineProperty(this, "proxy", {
      value: proxy
    });
    return this.proxy;
  }

  _createClass(Script, [{
    key: "apply",
    value: function apply(operator) {
      var _this = this;

      return function () {
        for (var _len = arguments.length, rawArgs = new Array(_len), _key = 0; _key < _len; _key++) {
          rawArgs[_key] = arguments[_key];
        }

        var args = unpackArgs(rawArgs);
        var lastType = _this.lastType;
        var next = _types.typeSystem[lastType[0]][operator];

        if (next !== undefined) {
          var _JSON$parse = JSON.parse(JSON.stringify(next)),
              _JSON$parse2 = _slicedToArray(_JSON$parse, 2),
              nextOpCode = _JSON$parse2[0],
              nextType = _JSON$parse2[1];

          var nextCall = args.length > 0 ? [nextOpCode].concat(_toConsumableArray(args)) : nextOpCode;

          _this.script.push(nextCall);

          if (nextType[0] === _types.PSEUDOTYPES.INNER) {
            // Unwrap the inner type
            nextType = _this.lastType.slice(1);
          } else if (nextType[0] === _types.PSEUDOTYPES.MATCH) {
            // Take the return type from the arguments
            var firstBranch = Object.values(args[0])[0];
            nextType = [{
              "number": _types.TYPES.FLOAT,
              "string": _types.TYPES.STRING,
              "boolean": _types.TYPES.BOOLEAN,
              "undefined": undefined
            }[_typeof(firstBranch)] || _types.TYPES.BYTES];
          } else if (nextType[0] === _types.PSEUDOTYPES.SUBSCRIPT) {
            nextType = [lastType[0]].concat(_toConsumableArray(rawArgs[0].lastType));
          } else if (nextType[0] === _types.PSEUDOTYPES.SAME) {
            nextType = lastType;
          } else if (nextType[1] === _types.PSEUDOTYPES.SAME) {
            // Pop up the innermost type
            nextType = [_this.lastType[0], _this.lastType[2]];
          } else if (nextType[1] === _types.PSEUDOTYPES.INNER) {
            // Pass down the inner type
            nextType = [nextType[0]].concat(_toConsumableArray(_this.lastType.slice(1)));
          }

          _this.lastType = nextType;
        } else {
          throw TypeError("Method `".concat((0, _types.typeFormat)(lastType), "::").concat(operator, "()` does not exist.        \nAvailable `").concat((0, _types.typeFormat)(lastType), "` methods are:").concat(Object.entries(_types.typeSystem[lastType]).map(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                opName = _ref2[0],
                opInfo = _ref2[1];

            return "\n\t- ".concat(opName, "(): ").concat((0, _types.typeFormat)(opInfo[1]));
          }).join("")));
        }

        return _this.proxy;
      };
    }
  }, {
    key: "encode",
    value: function encode() {
      return CBOR.encode(this.script);
    }
  }]);

  return Script;
}();

exports.Script = Script;