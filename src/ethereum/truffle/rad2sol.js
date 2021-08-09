#!/usr/bin/env node

const fs = require("fs");
const vm = require("vm");

const {
  compile, execute, fail, intoProtoBuf, intoSol, loadSchema, migrationsBanner, migrationsSucceed, pack, readFile,
  requestsBanner, requestsSucceed, writeMigrations, writeSol
} = require("../../../dist/ethereum/truffle/steps");

const requestsDir = "./requests/";
const requestContractsDir = "./contracts/requests/";
const userContractsDir = "./contracts/";
const migrationsDir = "./migrations/scripts/";
const schemaDir = `${process.cwd()}/node_modules/witnet-requests/assets/`;

const schema = loadSchema(schemaDir, "witnet", fs);

const requestNames = fs.readdirSync(requestsDir)
  .filter(fileName => fileName.match(/.*\.js$/));

const contractNames = fs.readdirSync(userContractsDir)
  .filter(exampleName => exampleName.match(/.*\.sol$/));

const steps = [
  fileName => `${requestsDir}${fileName}`,
  path => { console.log(`> Compiling ${path}`); return path },
  path => readFile(path, fs),
  compile,
  (code, i) => execute(code, requestNames[i], process.env.PWD, vm),
  pack,
  (request) => intoProtoBuf(request, schema),
  buff => buff.toString("hex"),
  (hex, i) => intoSol(hex, requestNames[i]),
  (sol, i) => writeSol(sol, requestNames[i], requestContractsDir, fs),
];

requestsBanner();

Promise.all(steps.reduce(
  (prev, step) => prev.map((p, i) => p.then(v => step(v, i))),
  requestNames.map(fileName => Promise.resolve(fileName))))
  .then(requestsSucceed)
  .then(migrationsBanner)
  .then(() => writeMigrations(contractNames, userContractsDir, migrationsDir, fs))
  .then(migrationsSucceed)
  .catch(fail);
