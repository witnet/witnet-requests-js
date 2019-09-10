"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Script = void 0;

var _radonTypes = require("./radon-types");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Script =
/*#__PURE__*/
function () {
  function Script(firstType) {
    _classCallCheck(this, Script);

    this.script = [];
    this.lastType = firstType;
    this.proxy = new Proxy(this, {
      get: function get(target, propKey) {
        return target[propKey] || target.apply(propKey);
      }
    });
    return this.proxy;
  }

  _createClass(Script, [{
    key: "apply",
    value: function apply(operator) {
      var _this = this;

      return function () {
        var lastType = _this.lastType;
        var next = _radonTypes.typeSystem[lastType[0]][operator];

        if (next !== undefined) {
          var _next = _slicedToArray(next, 2),
              nextOpCode = _next[0],
              nextType = _next[1];

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var nextCall = args.length > 0 ? [nextOpCode].concat(args) : nextOpCode;

          _this.script.push(nextCall);

          if (nextType[0] === _radonTypes.PSEUDOTYPES.INNER) {
            // Unwrap the inner type
            nextType = [_this.lastType[1]];
          } else if (nextType[0] === _radonTypes.PSEUDOTYPES.ARGUMENT) {
            // Take the return type from the arguments
            var firstBranch = args[0][0][1];
            nextType = [{
              "number": _radonTypes.TYPES.FLOAT,
              "string": _radonTypes.TYPES.STRING,
              "boolean": _radonTypes.TYPES.BOOLEAN,
              "undefined": undefined
            }[_typeof(firstBranch)] || _radonTypes.TYPES.BYTES];
          } else if (nextType[1] === _radonTypes.PSEUDOTYPES.PASSTHROUGH) {
            // Pop up the innermost type
            nextType = [_this.lastType[0], _this.lastType[2]];
          } else if (nextType[1] === _radonTypes.PSEUDOTYPES.INNER) {
            // Pass down the inner type
            nextType[1] = _this.lastType[1];
          }

          _this.lastType = nextType;
        } else {
          console.error("Method ".concat((0, _radonTypes.typeFormat)(lastType), "::").concat(operator, " is not implemented"));
        }

        return _this.proxy;
      };
    }
  }]);

  return Script;
}();

exports.Script = Script;