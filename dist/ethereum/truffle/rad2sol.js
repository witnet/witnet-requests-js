#!/usr/bin/env node
"use strict";

var fs = require("fs");

var vm = require("vm");

var _require = require("../../../dist/ethereum/truffle/steps"),
    compile = _require.compile,
    execute = _require.execute,
    fail = _require.fail,
    intoProtoBuf = _require.intoProtoBuf,
    intoSol = _require.intoSol,
    loadSchema = _require.loadSchema,
    migrationsBanner = _require.migrationsBanner,
    migrationsSucceed = _require.migrationsSucceed,
    pack = _require.pack,
    readFile = _require.readFile,
    requestsBanner = _require.requestsBanner,
    requestsSucceed = _require.requestsSucceed,
    writeMigrations = _require.writeMigrations,
    writeMigrationsRadons = _require.writeMigrationsRadons,
    writeSol = _require.writeSol;

var requestsDir = "./requests/";
var requestContractsDir = "./contracts/requests/";
var userContractsDir = "./contracts/";
var migrationsDir = "./migrations/";
var schemaDir = "".concat(process.cwd(), "/node_modules/witnet-requests/assets/");
var schema = loadSchema(schemaDir, "witnet", fs);
var requestNames = fs.readdirSync(requestsDir).filter(function (fileName) {
  return fileName.match(/.*\.js$/);
});
var contractNames = fs.readdirSync(userContractsDir).filter(function (exampleName) {
  return exampleName.match(/.*\.sol$/);
});
var migrationsRadons = {};
var steps = [function (fileName) {
  return "".concat(requestsDir).concat(fileName);
}, function (path) {
  console.log("> Compiling ".concat(path));
  return path;
}, function (path) {
  return readFile(path, fs);
}, compile, function (code, i) {
  return execute(code, requestNames[i], process.env.PWD, vm);
}, pack, function (request) {
  return intoProtoBuf(request, schema);
}, function (buff) {
  return buff.toString("hex");
}, function (hex, i) {
  var priceName = requestNames[i].replace(/\.js/, "");
  migrationsRadons["".concat(priceName, "Feed")] = {
    ERC2362ID: "Price-".concat(priceName.replace("Price", "").split(/(?=[A-Z])/).map(function (s) {
      return s.toUpperCase();
    }).join("/"), "-3"),
    bytecode: "0x" + hex
  };
  return hex;
}, function (hex, i) {
  return intoSol(hex, requestNames[i]);
}, function (sol, i) {
  return writeSol(sol, requestNames[i], requestContractsDir, fs);
}];
requestsBanner();
Promise.all(steps.reduce(function (prev, step) {
  return prev.map(function (p, i) {
    return p.then(function (v) {
      return step(v, i);
    });
  });
}, requestNames.map(function (fileName) {
  return Promise.resolve(fileName);
}))).then(requestsSucceed).then(migrationsBanner) // .then(() => writeMigrations(contractNames, userContractsDir, migrationsDir, fs))
.then(function () {
  return writeMigrationsRadons(migrationsRadons, migrationsDir, fs);
}).then(migrationsSucceed)["catch"](fail);