#!/usr/bin/env node

/*
 Imports
 */
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/stable");

require("regenerator-runtime/runtime");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _wrapRegExp() { _wrapRegExp = function _wrapRegExp(re, groups) { return new BabelRegExp(re, undefined, groups); }; var _super = RegExp.prototype; var _groups = new WeakMap(); function BabelRegExp(re, flags, groups) { var _this = new RegExp(re, flags); _groups.set(_this, groups || _groups.get(re)); return _setPrototypeOf(_this, BabelRegExp.prototype); } _inherits(BabelRegExp, RegExp); BabelRegExp.prototype.exec = function (str) { var result = _super.exec.call(this, str); if (result) result.groups = buildGroups(result, this); return result; }; BabelRegExp.prototype[Symbol.replace] = function (str, substitution) { if (typeof substitution === "string") { var groups = _groups.get(this); return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) { return "$" + groups[name]; })); } else if (typeof substitution === "function") { var _this = this; return _super[Symbol.replace].call(this, str, function () { var args = arguments; if (_typeof(args[args.length - 1]) !== "object") { args = [].slice.call(args); args.push(buildGroups(args, _this)); } return substitution.apply(this, args); }); } else { return _super[Symbol.replace].call(this, str, substitution); } }; function buildGroups(result, re) { var g = _groups.get(re); return Object.keys(g).reduce(function (groups, name) { groups[name] = result[g[name]]; return groups; }, Object.create(null)); } return _wrapRegExp.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var cbor = require('cbor');

var fs = require('fs');

var os = require('os');

var path = require('path');

var readline = require('readline');

var _require = require('witnet-radon-js'),
    Radon = _require.Radon;

var request = require('request');

var _require2 = require("child_process"),
    exec = _require2.exec;
/*
 Constants
 */


var toolkitDownloadUrlBase = "https://github.com/witnet/witnet-rust/releases/download/1.4.3/";
var toolkitFileNames = {
  win32: function win32(arch) {
    return "witnet_toolkit-".concat(arch, "-pc-windows-msvc.exe");
  },
  linux: function linux(arch) {
    return "witnet_toolkit-".concat(arch, "-unknown-linux-gnu").concat(arch.includes("arm") ? "eabihf" : "");
  },
  darwin: function darwin(arch) {
    return "witnet_toolkit-".concat(arch, "-apple-darwin");
  }
};
var archsMap = {
  x64: 'x86_64'
};
/*
 Environment acquisition
 */

var args = process.argv;
var binDir = __dirname;
/*
 Helpers
 */

function guessPlatform() {
  return os.platform();
}

function guessArch() {
  var rawArch = os.arch();
  return archsMap[rawArch] || rawArch;
}

function guessToolkitFileName(platform, arch) {
  return (toolkitFileNames[platform] || toolkitFileNames['linux'])(arch);
}

function guessToolkitBinPath(toolkitDirPath, platform, arch) {
  var fileName = guessToolkitFileName(platform, arch);
  return path.resolve(toolkitDirPath, fileName);
}

function checkToolkitIsDownloaded(toolkitBinPath) {
  return fs.existsSync(toolkitBinPath);
}

function prompt(_x) {
  return _prompt.apply(this, arguments);
}

function _prompt() {
  _prompt = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(question) {
    var readlineInterface;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            readlineInterface = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });
            return _context.abrupt("return", new Promise(function (resolve, _) {
              readlineInterface.question("".concat(question, " "), function (response) {
                readlineInterface.close();
                resolve(response.trim());
              });
            }));

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _prompt.apply(this, arguments);
}

function guessDownloadUrl(toolkitFileName) {
  return "".concat(toolkitDownloadUrlBase).concat(toolkitFileName);
}

function downloadToolkit(_x2, _x3, _x4, _x5) {
  return _downloadToolkit.apply(this, arguments);
}

function _downloadToolkit() {
  _downloadToolkit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(toolkitFileName, toolkitBinPath, platform, arch) {
    var downloadUrl, file, req;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            downloadUrl = guessDownloadUrl(toolkitFileName);
            console.log('Downloading', downloadUrl, 'into', toolkitBinPath);
            file = fs.createWriteStream(toolkitBinPath);
            req = request.get(downloadUrl, {
              followAllRedirects: true
            });
            req.on('response', function (_) {
              req.pipe(file);
            });
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              file.on('finish', function () {
                file.close(function () {
                  if (file.bytesWritten > 1000000) {
                    fs.chmodSync(toolkitBinPath, 493);
                    resolve();
                  } else {
                    reject("No suitable witnet_toolkit binary found. Maybe your OS (".concat(platform, ") or architecture (").concat(arch, ") are not yet supported. Feel free to complain about it in the Witnet community on Discord: https://discord.gg/2rTFYXHmPm "));
                  }
                });
              });

              var errorHandler = function errorHandler(err) {
                fs.unlink(downloadUrl, function () {
                  reject(err);
                });
              };

              file.on('error', errorHandler);
              req.on('error', errorHandler);
            }));

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _downloadToolkit.apply(this, arguments);
}

function toolkitRun(_x6, _x7) {
  return _toolkitRun.apply(this, arguments);
}

function _toolkitRun() {
  _toolkitRun = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(settings, args) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", new Promise(function (resolve, reject) {
              exec("".concat(settings.paths.toolkitBinPath, " ").concat(args.join(' ')), function (error, stdout, stderr) {
                if (error) {
                  reject(error);
                }

                if (stderr) {
                  reject(stderr);
                }

                resolve(stdout);
              });
            }));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _toolkitRun.apply(this, arguments);
}

function formatRadonValue(call) {
  var radonType = Object.keys(call)[0];
  var value = JSON.stringify(call[radonType]);

  if (radonType === 'RadonInteger') {
    value = parseInt(value.replace('\"', ''));
  } else if (radonType === 'RadonError') {
    value = red(value.replace( /*#__PURE__*/_wrapRegExp(/.*Inner:[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]`Some\((.*)\)`.*/g, {
      inner: 1
    }), '$<inner>').replace(/UnsupportedReducerInAT\s\{\soperator\:\s0\s\}/g, 'MissingReducer'));
  }

  return [radonType.replace('Radon', ''), value];
}

function blue(string) {
  return "\x1B[34m".concat(string, "\x1B[0m");
}

function green(string) {
  return "\x1B[32m".concat(string, "\x1B[0m");
}

function red(string) {
  return "\x1B[31m".concat(string, "\x1B[0m");
}

function yellow(string) {
  return "\x1B[33m".concat(string, "\x1B[0m");
}
/*
 Command handlers
 */


function installCommand(_x8) {
  return _installCommand.apply(this, arguments);
}

function _installCommand() {
  _installCommand = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(settings) {
    var will;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (settings.checks.toolkitIsDownloaded) {
              _context4.next = 10;
              break;
            }

            console.log("The witnet_toolkit native binary hasn't been downloaded yet (this is a requirement).");
            _context4.next = 4;
            return prompt("Do you want to download it now? (Y/n)");

          case 4:
            will = _context4.sent;

            if (!['', 'y'].includes(will.toLowerCase())) {
              _context4.next = 9;
              break;
            }

            return _context4.abrupt("return", downloadToolkit(settings.paths.toolkitFileName, settings.paths.toolkitBinPath, settings.system.platform, settings.system.arch)["catch"](function (err) {
              console.error("Error downloading witnet_toolkit binary:", err);
            }));

          case 9:
            console.error('Aborted download of witnet_toolkit native binary.');

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _installCommand.apply(this, arguments);
}

function updateCommand(_x9) {
  return _updateCommand.apply(this, arguments);
}

function _updateCommand() {
  _updateCommand = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(settings) {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            return _context5.abrupt("return", downloadToolkit(settings.paths.toolkitFileName, settings.paths.toolkitBinPath, settings.system.platform, settings.system.arch)["catch"](function (err) {
              console.error("Error updating witnet_toolkit binary:", err);
            }));

          case 1:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _updateCommand.apply(this, arguments);
}

function decodeScriptsAndArguments(mir) {
  var decoded = mir.data_request;
  decoded.retrieve = decoded.retrieve.map(function (source) {
    var decodedScript = cbor.decode(Buffer.from(source.script));
    return _objectSpread(_objectSpread({}, source), {}, {
      script: decodedScript
    });
  });
  decoded.aggregate.filters = decoded.aggregate.filters.map(function (filter) {
    var decodedArgs = cbor.decode(Buffer.from(filter.args));
    return _objectSpread(_objectSpread({}, filter), {}, {
      args: decodedArgs
    });
  });
  decoded.tally.filters = decoded.tally.filters.map(function (filter) {
    var decodedArgs = cbor.decode(Buffer.from(filter.args));
    return _objectSpread(_objectSpread({}, filter), {}, {
      args: decodedArgs
    });
  });
  return decoded;
}

function decodeDataRequestCommand(_x10, _x11) {
  return _decodeDataRequestCommand.apply(this, arguments);
}

function _decodeDataRequestCommand() {
  _decodeDataRequestCommand = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(settings, args) {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            return _context6.abrupt("return", fallbackCommand(settings, args).then(JSON.parse).then(decodeScriptsAndArguments).then(function (decoded) {
              return JSON.stringify(decoded, null, 4);
            }));

          case 1:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _decodeDataRequestCommand.apply(this, arguments);
}

function tryDataRequestCommand(_x12, _x13) {
  return _tryDataRequestCommand.apply(this, arguments);
}

function _tryDataRequestCommand() {
  _tryDataRequestCommand = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(settings, args) {
    var request, radon, tasks;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            tasks = [args];

            if (args[1] === '--from-solidity') {
              // If no path is provided, fallback to default data request path
              if (args[2] === undefined) {
                args[2] = './contracts/requests/';
              } // If the path is a directory, find `.sol` files within, and use those as tasks


              if (fs.lstatSync(args[2]).isDirectory()) {
                tasks = fs.readdirSync(args[2]).filter(function (filename) {
                  return filename.match(/.+.sol$/g);
                }).map(function (filename) {
                  return [args[0], args[1], path.join(args[2], filename)];
                });
              }
            }

            return _context8.abrupt("return", Promise.all(tasks.map( /*#__PURE__*/function () {
              var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(task) {
                var request_json, mir, output, report, dataSourcesCount, dataSourcesInterpolation, aggregationExecuted, aggregationExecutionTime, aggregationResult, tallyExecuted, tallyExecutionTime, tallyResult, filenameInterpolation, filename, retrievalInterpolation, aggregationExecutionTimeInterpolation, aggregationInterpolation, tallyExecutionTimeInterpolation, tallyInterpolation;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.next = 2;
                        return toolkitRun(settings, ['decode-data-request'].concat(_toConsumableArray(task.slice(1))));

                      case 2:
                        request_json = _context7.sent;
                        mir = JSON.parse(request_json);
                        request = decodeScriptsAndArguments(mir);
                        radon = new Radon(request);
                        _context7.next = 8;
                        return fallbackCommand(settings, task);

                      case 8:
                        output = _context7.sent;
                        _context7.prev = 9;
                        report = JSON.parse(output);
                        _context7.next = 16;
                        break;

                      case 13:
                        _context7.prev = 13;
                        _context7.t0 = _context7["catch"](9);
                        return _context7.abrupt("return");

                      case 16:
                        dataSourcesCount = report.retrieve.length;
                        dataSourcesInterpolation = report.retrieve.map(function (source, sourceIndex, sources) {
                          var executionTime;

                          try {
                            executionTime = (source.context.completion_time.nanos_since_epoch - source.context.start_time.nanos_since_epoch) / 1000000;
                          } catch (_) {
                            executionTime = 0;
                          }

                          var cornerChar = sourceIndex < sources.length - 1 ? '├' : '└';
                          var sideChar = sourceIndex < sources.length - 1 ? '│' : ' ';
                          var traceInterpolation;

                          try {
                            if ((source.partial_results || []).length === 0) {
                              source.partial_results = [source.result];
                            }

                            traceInterpolation = source.partial_results.map(function (radonValue, callIndex) {
                              var formattedRadonValue = formatRadonValue(radonValue);
                              var operator = radon ? (callIndex === 0 ? blue(radon.retrieve[sourceIndex].kind) : ".".concat(blue(radon.retrieve[sourceIndex].script.operators[callIndex - 1].operatorInfo.name + '(')).concat(radon.retrieve[sourceIndex].script.operators[callIndex - 1].mirArguments.join(', ') + blue(')'))) + ' ->' : '';
                              return " \u2502   ".concat(sideChar, "    [").concat(callIndex, "] ").concat(operator, " ").concat(yellow(formattedRadonValue[0]), ": ").concat(formattedRadonValue[1]);
                            }).join('\n');
                          } catch (e) {
                            traceInterpolation = " |   ".concat(sideChar, "  ").concat(red('[ERROR] Cannot decode execution trace information'));
                          }

                          var urlInterpolation = request ? "\n |   ".concat(sideChar, "  Method: ").concat(radon.retrieve[sourceIndex].kind, "\n |   ").concat(sideChar, "  Complete URL: ").concat(radon.retrieve[sourceIndex].url) : '';
                          var formattedRadonResult = formatRadonValue(source.result);
                          var resultInterpolation = "".concat(yellow(formattedRadonResult[0]), ": ").concat(formattedRadonResult[1]);
                          return " \u2502   ".concat(cornerChar, "\u2500").concat(green('['), " Source #").concat(sourceIndex, " ").concat(request ? "(".concat(new URL(request.retrieve[sourceIndex].url).hostname, ")") : '', " ").concat(green(']')).concat(urlInterpolation, "\n |   ").concat(sideChar, "  Number of executed operators: ").concat(source.context.call_index + 1 || 0, "\n |   ").concat(sideChar, "  Execution time: ").concat(executionTime > 0 ? executionTime + ' ms' : 'unknown', "\n |   ").concat(sideChar, "  Execution trace:\n").concat(traceInterpolation, "\n |   ").concat(sideChar, "  Result: ").concat(resultInterpolation);
                        }).join('\n |   │\n');

                        try {
                          aggregationExecuted = report.aggregate.context.completion_time !== null;
                          aggregationExecutionTime = aggregationExecuted && (report.aggregate.context.completion_time.nanos_since_epoch - report.aggregate.context.start_time.nanos_since_epoch) / 1000000;
                          aggregationResult = formatRadonValue(report.aggregate.result);
                        } catch (error) {
                          aggregationExecuted = false;
                        }

                        try {
                          tallyExecuted = report.tally.context.completion_time !== null;
                          tallyExecutionTime = tallyExecuted && (report.tally.context.completion_time.nanos_since_epoch - report.tally.context.start_time.nanos_since_epoch) / 1000000;
                          tallyResult = formatRadonValue(report.tally.result);
                        } catch (error) {
                          tallyExecuted = false;
                        }

                        filenameInterpolation = '';

                        if (args.includes('--from-solidity')) {
                          filename = task[2].split('/').pop();
                          filenameInterpolation = "\n\u2551 ".concat(green(filename)).concat(' '.repeat(42 - filename.length), " \u2551");
                        }

                        retrievalInterpolation = " \u2502\n \u2502  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n \u251C\u2500\u2500\u2524 Retrieval stage                                \u2502\n \u2502  \u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n \u2502  \u2502 Number of retrieved data sources: ".concat(dataSourcesCount).concat(" ".repeat(13 - dataSourcesCount.toString().length), "\u2502\n \u2502  \u2514\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n \u2502   \u2502\n").concat(dataSourcesInterpolation);
                        aggregationExecutionTimeInterpolation = aggregationExecuted ? "\n \u2502  \u2502 Execution time: ".concat(aggregationExecutionTime, " ms").concat(" ".repeat(28 - aggregationExecutionTime.toString().length), "\u2502") : '';
                        aggregationInterpolation = " \u2502\n \u2502  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n \u251C\u2500\u2500\u2524 Aggregation stage                              \u2502\n \u2502  \u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524".concat(aggregationExecutionTimeInterpolation, "\n \u2502  \u2502 Result is ").concat(yellow(aggregationResult[0]), ": ").concat(aggregationResult[1]).concat(" ".repeat(Math.max(0, (aggregationResult[0] === 'Error' ? 44 : 35) - aggregationResult[0].toString().length - aggregationResult[1].toString().length)), "\u2502\n \u2502  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518");
                        tallyExecutionTimeInterpolation = tallyExecuted ? "\n    \u2502 Execution time: ".concat(tallyExecutionTime, " ms").concat(" ".repeat(28 - tallyExecutionTime.toString().length), "\u2502") : '';
                        tallyInterpolation = " \u2502  \n \u2502  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n \u2514\u2500\u2500\u2524 Tally stage                                    \u2502\n    \u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524".concat(tallyExecutionTimeInterpolation, "\n    \u2502 Result is ").concat(yellow(tallyResult[0]), ": ").concat(tallyResult[1]).concat(" ".repeat(Math.max(0, (tallyResult[0] === 'Error' ? 44 : 35) - tallyResult[0].toString().length - tallyResult[1].toString().length)), "\u2502\n    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518");
                        return _context7.abrupt("return", "\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551 Witnet data request local execution report \u2551".concat(filenameInterpolation, "\n\u255A\u2564\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n").concat(retrievalInterpolation, "\n").concat(aggregationInterpolation, "\n").concat(tallyInterpolation));

                      case 28:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7, null, [[9, 13]]);
              }));

              return function (_x16) {
                return _ref.apply(this, arguments);
              };
            }())).then(function (outputs) {
              return outputs.join('\n');
            }));

          case 3:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _tryDataRequestCommand.apply(this, arguments);
}

function fallbackCommand(_x14, _x15) {
  return _fallbackCommand.apply(this, arguments);
}
/*
 Router
 */


function _fallbackCommand() {
  _fallbackCommand = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(settings, args) {
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            return _context9.abrupt("return", toolkitRun(settings, args)["catch"](function (err) {
              var errorMessage = err.message.split('\n').slice(1).join('\n').trim();

              var errorRegex = /*#__PURE__*/_wrapRegExp(/.*^error: (.*)$.*/gm, {
                message: 1
              });

              var matched = errorRegex.exec(err.message);

              if (matched) {
                errorMessage = matched.groups.message;
              }

              console.error(errorMessage);
            }));

          case 1:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _fallbackCommand.apply(this, arguments);
}

var router = {
  'decode-data-request': decodeDataRequestCommand,
  'fallback': fallbackCommand,
  'install': installCommand,
  'try-data-request': tryDataRequestCommand,
  'update': updateCommand
};
/*
 Paths derivation
 */

var toolkitDirPath = path.resolve(binDir, '../../assets/');
var platform = guessPlatform();
var arch = guessArch();
var toolkitFileName = guessToolkitFileName(platform, arch);
var toolkitBinPath = guessToolkitBinPath(toolkitDirPath, platform, arch);
var toolkitIsDownloaded = checkToolkitIsDownloaded(toolkitBinPath);
/*
 Settings composition
 */

var settings = {
  paths: {
    toolkitBinPath: toolkitBinPath,
    toolkitDirPath: toolkitDirPath,
    toolkitFileName: toolkitFileName
  },
  checks: {
    toolkitIsDownloaded: toolkitIsDownloaded
  },
  system: {
    platform: platform,
    arch: arch
  }
};
/*
 Main logic
 */

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    var commandName, command, output;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            commandName = args[2];
            command = router[commandName] || router['fallback']; // Always run base command before anything else, mainly to ensure that the witnet_toolkit binary
            // has been downloaded

            _context10.next = 4;
            return router['install'](settings);

          case 4:
            // Make sure that commands with --help are always passed through
            if (args.includes("--help")) {
              command = router['fallback'];
            } // Run the invoked command, if any


            if (!command) {
              _context10.next = 10;
              break;
            }

            _context10.next = 8;
            return command(settings, args.slice(2));

          case 8:
            output = _context10.sent;

            if (output) {
              console.log(output.trim());
            }

          case 10:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _main.apply(this, arguments);
}

main();