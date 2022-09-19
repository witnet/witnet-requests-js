#!/usr/bin/env node

import {readCompileEncodeWriteSolScript} from "../lib/rad2sol/scripts";
import * as Utils from "../utils";

const fs = require("fs");
const glob = require("glob");
const path = require("path");
const vm = require("vm");

const argv = Utils.processArgv(process.argv);
const asPath = Utils.formatPath(path);

const {fail, loadSchema, queriesBanner, queriesSucceed, writeMigrations, writeQueriesToJson} = require("../lib/rad2sol/steps");

const verbose = process.argv.includes('--verbose')

const queryDir = argv("target", "./witnet", true);
const contractsDir = argv("contracts", "./contracts", true);

const writeContracts = asPath(argv("write-contracts", "./contracts/witnet"));
const writeUserMigrations = asPath(argv("write-user-migrations", "./migrations"));
const writeWitnetMigrations = asPath(argv("write-witnet-migrations", "./migrations"));
const writeJson = asPath(argv("write-json", "./migrations"));

const schemaDir = path.resolve(__dirname, "../../assets");
const schema = loadSchema(fs, path, schemaDir, "witnet");

const queriesNames = glob.sync(queryDir, {}).reduce((acc, queryPath) => {
  if ((fs.lstatSync(queryPath)).isFile()) {
    acc.push(path.resolve(queryPath));
    return acc;
  } else {
    return acc.concat(glob.sync(`${queryPath}*.js`).map(x => path.resolve(x)));
  }
}, []);
const queriesList = {}

const script = readCompileEncodeWriteSolScript(fs, path, vm, schema, writeContracts, queriesList, queriesNames);

queriesBanner();

Promise.all(script.reduce(
  (prev, step) => prev.map((p, i) => p.then(v => step(v, i))),
  queriesNames.map(fileName => Promise.resolve(fileName))))
    .then(() => queriesSucceed(path, writeContracts, writeJson))
    .then(() => { if (writeJson !== Utils.Disabled) { writeQueriesToJson(fs, path, queriesList, writeJson) } })
    .then(() => writeMigrations(fs, path, contractsDir, writeUserMigrations, writeWitnetMigrations))
    .catch((error) => fail(error, process, verbose));
