"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tap = tap;
exports.requestsBanner = requestsBanner;
exports.requestsSucceed = requestsSucceed;
exports.migrationsBanner = migrationsBanner;
exports.migrationsSucceed = migrationsSucceed;
exports.fail = fail;
exports.readFile = readFile;
exports.loadSchema = loadSchema;
exports.compile = compile;
exports.execute = execute;
exports.pack = pack;
exports.intoProtoBuf = intoProtoBuf;
exports.intoSol = intoSol;
exports.writeSol = writeSol;
exports.intoRadon = intoRadon;
exports.writeMigrations = writeMigrations;
exports.writeMigrationsRadons = writeMigrationsRadons;
exports.readSolidityArgs = readSolidityArgs;
exports.readMigrationArgs = readMigrationArgs;
exports.mockSolidityArgs = mockSolidityArgs;
exports.matchAll = matchAll;

var Witnet = _interopRequireWildcard(require("../../.."));

var Babel = _interopRequireWildcard(require("@babel/core/lib/transform"));

var _protocolBuffers = _interopRequireDefault(require("protocol-buffers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * THESE ARE THE DIFFERENT STEPS THAT CAN BE USED IN THE COMPILER SCRIPT.
 */
function tap(x) {
  console.log(x);
  return x;
}

function requestsBanner() {
  console.log("\nCompiling your Witnet requests...\n=================================");
}

function requestsSucceed() {
  console.log("\n> All requests compiled successfully\n");
}

function migrationsBanner() {
  console.log("\nGenerating automatic migrations for your contracts...\n=====================================================");
}

function migrationsSucceed() {
  console.log("\n> All migrations written successfully \x1B[33m(please remember to manually customize them if necessary)\x1B[0m.\n");
}

function fail(error) {
  console.error("\n! \x1B[31mWITNET REQUESTS COMPILATION ERRORS:\x1B[0m\n  - ".concat(error.message));
  process.exitCode = 1;
  throw error;
}

function readFile(path, fs) {
  return fs.readFileSync(path, "utf8");
}

function loadSchema(schemaDir, schemaName, fs) {
  return (0, _protocolBuffers["default"])(readFile("".concat(schemaDir).concat(schemaName, ".proto"), fs));
}

function compile(code) {
  return Babel.transformSync(code, {
    "plugins": [["@babel/plugin-transform-modules-commonjs", {
      "allowTopLevelThis": true
    }]]
  }).code;
}

function execute(code, requestName, dirName, vm) {
  var context = vm.createContext({
    module: {},
    exports: {},
    require: function (_require) {
      function require(_x) {
        return _require.apply(this, arguments);
      }

      require.toString = function () {
        return _require.toString();
      };

      return require;
    }(function (depName) {
      if (["witnet-requests", "witnet-request", "witnet"].indexOf(depName) >= 0) {
        return Witnet;
      } else {
        return require(depName);
      }
    })
  });

  try {
    var request = vm.runInContext(code, context, __dirname);
    console.log("  - The result type of the request is \x1B[36m".concat(Witnet.Types.typeFormat(request.dataPointType), "\x1B[0m"));
    return request;
  } catch (e) {
    var error = e;

    if (e.message.includes("is not a export function")) {
      error = Error("\x1B[1m".concat(requestName, " has one of these issues:\x1B[0m\n    1: \x1B[1mIt is missing the `export` statement\x1B[0m\n       Adding this line at the end of ").concat(requestName, " may help (please replace `request` by the name of your request object):\n      \n         export {request as default}\n\n    2: \x1B[1mThe exported object is not an instance of the `Request` class\x1B[0m\n       Please double-check that ").concat(requestName, " contains an instance of the `Request` class and it is exported as explained in issue 1.\n       New instances of the `Request` class are created like this:\n\n         const request = new Request()\n         \n       The Witnet documentation contains a complete tutorial on how to create requests from scratch:\n       https://docs.witnet.io/tutorials/bitcoin-price-feed/introduction/\n    \n    (Node.js error was: ").concat(e, ")"));
    } else if (e.message.includes("is not defined")) {
      var missing = e.message.match(/(.*) is not defined/)[1];

      if (Witnet.hasOwnProperty(missing)) {
        error = Error("\x1B[1m".concat(requestName, " is missing an import for the `").concat(missing, "` module\x1B[0m\n    Adding this line at the beginning of ").concat(requestName, " may help:\n      \n         import { ").concat(missing, " } from \"witnet-requests\"\n    \n    (Node.js error was: ").concat(e, ")"));
      }
    }

    throw error;
  }
}

function pack(dro) {
  var request = dro.data.data_request;
  var retrieve = request.retrieve.map(function (branch) {
    return _objectSpread(_objectSpread({}, branch), {}, {
      script: branch.encode()
    });
  });
  var aggregate = request.aggregate.pack();
  var tally = request.tally.pack();
  return _objectSpread(_objectSpread({}, dro.data), {}, {
    data_request: _objectSpread(_objectSpread({}, request), {}, {
      retrieve: retrieve,
      aggregate: aggregate,
      tally: tally
    })
  });
}

function intoProtoBuf(request, schema) {
  return schema.DataRequestOutput.encode(request);
}

function intoSol(hex, fileName) {
  var contractName = fileName.replace(/\.js/, "");
  return "// SPDX-License-Identifier: MIT\n\npragma solidity >=0.7.0 <0.9.0;\n\nimport \"witnet-ethereum-bridge/contracts/libs/WitnetData.sol\";\n\n// The bytecode of the ".concat(contractName, " request that will be sent to Witnet\ncontract ").concat(contractName, "Request is WitnetRequest {\n  constructor ()\n    WitnetRequest(\n      hex\"").concat(hex, "\"\n    )\n  {}\n}\n");
}

function writeSol(sol, fileName, requestContractsDir, fs) {
  var solFileName = fileName.replace(/\.js/, ".sol");
  fs.writeFileSync("".concat(requestContractsDir).concat(solFileName), sol);
  return fileName;
}

function intoRadon(hex, fileName, migrationsDir, fs) {}

function writeMigrations(contractNames, userContractsDir, migrationsDir, fs) {
  var artifacts = contractNames.filter(function (fileName) {
    return fileName !== "Migrations.sol";
  }).map(function (fileName) {
    return "".concat(fileName[0].toUpperCase()).concat(fileName.slice(1).replace(".sol", ""));
  });
  var stage2 = "// WARNING: DO NOT DELETE THIS FILE\n// This file was auto-generated by the Witnet compiler, any manual changes will be overwritten.\n\nconst WitnetRequestBoard = artifacts.require(\"WitnetRequestBoardInterface\")\nconst Witnet = artifacts.require(\"Witnet\")\n\nconst realm = process.env.WITNET_EVM_REALM.toLowerCase() || \"default\"\nconst addresses = require(\"../addresses\")[realm]\n\nmodule.exports = function (_deployer, network) {\n  network = network.split(\"-\")[0]\n  if (network in addresses) {\n    Witnet.address = addresses[network][\"Witnet\"]\n    WitnetRequestBoard.address = addresses[network][\"WitnetProxy\"]\n  } else {\n    console.log(\"Info: cannot deploy price feeds if no Witnet addresses are provided.\")\n    process.exit(0)\n  }\n}\n";
  fs.writeFileSync("".concat(migrationsDir, "/scripts/2_witnet_core.js"), stage2);
  var stage3 = "// WARNING: DO NOT DELETE THIS FILE\n// This file was auto-generated by the Witnet compiler, any manual changes will be overwritten.\n\nconst ERC2362PriceFeed = artifacts.require(\"ERC2362PriceFeed\")\nconst Witnet = artifacts.require(\"Witnet\")\nconst WitnetRequestBoard = artifacts.require(\"WitnetRequestBoardInterface\")\n\nconst radons = require(\"../radons\")\n\nmodule.exports = async function (deployer) {\n  await deployer.link(Witnet, [ERC2362PriceFeed])\n    const pricefeeds = Object.keys(radons)\n    for (let i = 0; i < pricefeeds.length; i ++) {\n      const pricefeed = pricefeeds[i]\n      console.log(\"\n> Deploying '\" + pricefeed + \"'...\")\n      const pfc = await ERC2362PriceFeed.new(\n        WitnetRequestBoard.address,\n        radons[pricefeed].ERC2362ID\n      )\n      await pfc.setRadonScript(radons[pricefeed].bytecode)\n      console.log(\"  >> Contract address:\t\", pfc.address)\n      console.log(\"  >> WRB interface:\t\", WitnetRequestBoard.address)\n      console.log(\"  >> RADON address:\t\", await pfc.radonScript.call())\n      console.log(\"  >> ERC2362ID:\t\", radons[pricefeed].ERC2362ID)   \n    }\n  }\n}\n";
  fs.writeFileSync("".concat(migrationsDir, "/scripts/3_price_feeds.js"), stage3);
}

function writeMigrationsRadons(migrationsRadons, migrationsDir, fs) {
  var currentRadons = {};
  var radonsFile = "".concat(migrationsDir, "radons.json");

  if (fs.existsSync(radonsFile)) {
    currentRadons = JSON.parse(readFile(radonsFile, fs));
  }

  if (currentRadons) {
    var prices = Object.keys(migrationsRadons);
    prices.forEach(function (price) {
      if (currentRadons[price] && currentRadons[price]["ERC2362ID"]) {
        migrationsRadons[price]["ERC2362ID"] = currentRadons[price]["ERC2362ID"];
      }
    });
  }

  console.log("\n".concat(migrationsDir, "radons.json:"));
  console.log(migrationsRadons);
  fs.writeFileSync(radonsFile, JSON.stringify(migrationsRadons, null, 4));
}

function readSolidityArgs(artifact, userContractsDir, fs) {
  var content = readFile("".concat(userContractsDir).concat(artifact, ".sol"), fs);
  var regex = /constructor\s*\(([\w\s,]*)/m;
  return content.match(regex)[1];
}

function readMigrationArgs(migrationsDir, fs) {
  fs.closeSync(fs.openSync("".concat(migrationsDir, "3_price_feeds.js"), "a"));
  var content = readFile("".concat(migrationsDir, "3_price_feeds.js"), fs);
  var regex = /^\s*(await)?\s*deployer\.deploy\([\s\n]*(\w+)[^)]*\)/mg;
  return matchAll(regex, content).reduce(function (acc, match) {
    return _objectSpread(_objectSpread({}, acc), {}, _defineProperty({}, match[2], match[0]));
  }, {});
}

function mockSolidityArgs(args, artifacts) {
  var mocks = {
    "uint": 0,
    "uint8": 0,
    "uint16": 0,
    "uint32": 0,
    "uint64": 0,
    "uint128": 0,
    "uint256": 0,
    "int": 0,
    "int8": 0,
    "int16": 0,
    "int32": 0,
    "int64": 0,
    "int128": 0,
    "int256": 0,
    "string": "\"CHANGEME\"",
    "bytes": "\"DEADC0FFEE\"",
    "address": "\"0x0000000000000000000000000000000000000000\"",
    "bool": false
  };
  var simpleArtifactNames = artifacts.reduce(function (acc, artifact) {
    var simpleName = simplifyName(artifact);
    return _objectSpread(_objectSpread({}, acc), {}, _defineProperty({}, simpleName, artifact));
  }, {});
  return args.split(",").map(function (arg) {
    var _arg$trim$split = arg.trim().split(" "),
        _arg$trim$split2 = _slicedToArray(_arg$trim$split, 2),
        type = _arg$trim$split2[0],
        argName = _arg$trim$split2[1];

    var simpleName = simplifyName(argName);

    if (type === "address" && argName === "_wrb") {
      return "WitnetRequestBoard.address";
    } else if (type === "address" && simpleArtifactNames.hasOwnProperty(simpleName)) {
      return "".concat(simpleArtifactNames[simpleName], ".address");
    } else if (mocks.hasOwnProperty(type)) {
      return mocks[type];
    } else {
      return 0;
    }
  });
}

function matchAll(regex, string) {
  var matches = [];

  while (true) {
    var match = regex.exec(string);
    if (match === null) break;
    matches.push(match);
  }

  return matches;
}

function simplifyName(name) {
  return name.toLowerCase().replace("_", "");
}