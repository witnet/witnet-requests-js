#!/usr/bin/env node

import {readCompileEncodeWriteSolScript} from "../lib/rad2sol/scripts";
import * as Utils from "../utils";

import fs from "node:fs";
import glob from "glob";
import path from "node:path";
import vm from "node:vm";

const argv = Utils.processArgv(process.argv);
const asPath = Utils.formatPath(path);

import {
  fail, loadSchema, queriesBanner, queriesSucceed, writeMigrations, writeQueriesToJson
} from "../lib/rad2sol/steps.js";

const verbose = process.argv.includes('--verbose')

const queryDir = argv("target", "./witnet", true);
const contractsDir = argv("contracts", "./contracts", true);

const writeContracts = asPath(argv("write-contracts", "./contracts/witnet"));
const writeUserMigrations = asPath(argv("write-user-migrations", "./migrations"));
const writeWitnetMigrations = asPath(argv("write-witnet-migrations", "./migrations"));
const writeJson = asPath(argv("write-json", "./migrations"));

const schemaDir = path.resolve(__dirname, "../../assets");
const schema = loadSchema(fs, path, schemaDir, "witnet");

function addQuery(acc, rawPath) {
  let resolvedPath = path.resolve(rawPath);
  let queryName = path.basename(rawPath).split('.')[0];

  const existing = acc[queryName];
  if (existing) {
    const error =  Error(`Duplicated query name "${queryName}. Please rename one of the following files:\n  - First occurrence at ${existing.path}\n  - Found repetition at ${resolvedPath}`);
    fail(error, process, true);
  } else {
    acc[queryName] = { bytecode: null, path: rawPath };
  }
}

const queries = glob.sync(queryDir, {}).reduce((acc, rawPath) => {
  if ((fs.lstatSync(rawPath)).isFile()) {
    addQuery(acc, rawPath)
  } else {
    glob.sync(path.resolve(rawPath, "*.js")).forEach(rawPath => addQuery(acc, rawPath));
  }
  return acc;
}, {});

const script = readCompileEncodeWriteSolScript(fs, path, vm, schema, writeContracts, queries);

queriesBanner();

Promise.all(script.reduce(
  (prev, step) => prev.map((p, i) => p.then(v => step(v, i))),
  Object.values(queries).map(fileName => Promise.resolve(fileName))))
    .then(() => queriesSucceed(path, writeContracts, writeJson))
    .then(() => { if (writeJson !== Utils.Disabled) { writeQueriesToJson(fs, path, queries, writeJson) } })
    .then(() => writeMigrations(fs, path, contractsDir, writeUserMigrations, writeWitnetMigrations))
    .catch((error) => fail(error, process, verbose));
