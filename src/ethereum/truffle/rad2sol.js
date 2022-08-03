#!/usr/bin/env node

import {writeRequestsList} from "./steps";

const fs = require("fs");
const vm = require("vm");

const {
  compile, execute, fail, intoProtoBuf, intoSol, loadSchema, migrationsBanner, migrationsSucceed, pack, readFile,
  requestsBanner, requestsSucceed, writeMigrations, writeSol
} = require("../../../dist/ethereum/truffle/steps");

const verbose = process.argv.includes('--verbose')

const requestsDir = "./requests/";
const requestContractsDir = "./contracts/requests/";
const userContractsDir = "./contracts/";
const migrationsDir = "./migrations/";
const schemaDir = `${process.cwd()}/node_modules/witnet-requests/assets/`;

const schema = loadSchema(schemaDir, "witnet", fs);

const requestNames = fs.readdirSync(requestsDir)
  .filter(fileName => fileName.match(/.*\.js$/));

const contractNames = fs.readdirSync(userContractsDir)
  .filter(exampleName => exampleName.match(/.*\.sol$/));

let requestsList = {}

const generateRequestsContracts = !process.argv.includes('--disable-requests-contracts') && true
const generateRequestsList = !process.argv.includes('--disable-requests-list') && true
const generateUserContractsMigrations = !process.argv.includes('--disable-user-contracts-migrations') && true
const generateWitnetMigrations = !process.argv.includes('--disable-witnet-migrations') && true

const steps = [
  fileName => `${requestsDir}${fileName}`,
  path => { console.log(`> Compiling ${path}`); return path },
  path => readFile(path, fs),
  compile,
  (code, i) => execute(code, requestNames[i], process.env.PWD, vm),
  pack,
  (request) => intoProtoBuf(request, schema),
  buff => buff.toString("hex"),
  (hex, i) => {
    requestsList[requestNames[i].replace(/\.js/, "")] = { bytecode: `0x${hex}` }
    return hex
  },
  (hex, i) => intoSol(hex, requestNames[i]),
  (sol, i) => { if (generateRequestsContracts) { writeSol(sol, requestNames[i], requestContractsDir, fs) } },
];

requestsBanner();

Promise.all(steps.reduce(
  (prev, step) => prev.map((p, i) => p.then(v => step(v, i))),
  requestNames.map(fileName => Promise.resolve(fileName))))
    .then(requestsSucceed)
    .then(migrationsBanner)
    .then(() => writeMigrations(contractNames, userContractsDir, migrationsDir, { generateUserContractsMigrations, generateWitnetMigrations }, fs))
    .then(() => { if (generateRequestsList) { writeRequestsList(requestsList, migrationsDir, fs) } })
    .then(() => { if (generateUserContractsMigrations || generateWitnetMigrations) { migrationsSucceed() } })
    .catch((error) => fail(error, process, verbose));
