import {compile, execute, intoProtoBuf, intoSol, pack, readFile, writeSol} from "./steps";
import {Disabled} from "../../utils";

function readScript (fs) {
  return [
    query => { console.log(`> Compiling ${query.path}`); return query },
    query => readFile(query.path, fs),
  ];
}

function compileScript (vm, queryNames) {
  return [
    compile,
    (code, i) => execute(code, queryNames[i], process.env.PWD, vm),
    pack,
  ];
}

function encodeScript (path, schema, queries) {
  const queryNames = Object.keys(queries);
  return [
    (request) => intoProtoBuf(request, schema),
    buff => buff.toString("hex"),
    (hex, i) => {
      queries[queryNames[i]].bytecode = `0x${hex}`
      return hex
    }
  ];
}

function writeSolScript (fs, path, writeContracts, queries) {
  const queryNames = Object.keys(queries);
  return [
    (query, i) => intoSol(queryNames[i], query),
    (sol, i) => { if (writeContracts !== Disabled) { writeSol(fs, path, sol, writeContracts, queryNames[i]) } },
  ];
}

function readCompileEncodeScript (fs, path, vm, schema, queries) {
  const queryNames = Object.keys(queries)
  return [
    ...readScript(fs, path),
    ...compileScript(vm, queryNames),
    ...encodeScript(path, schema, queries),
  ];
}

function readCompileEncodeWriteSolScript (fs, path, vm, schema, writeContracts, queries) {
  return [
    ...readScript(fs),
    ...compileScript(vm, queries),
    ...encodeScript(path, schema, queries),
    ...writeSolScript(fs, path, writeContracts, queries),
  ];
}

export {
  readScript,
  compileScript,
  encodeScript,
  writeSolScript,
  readCompileEncodeScript,
  readCompileEncodeWriteSolScript
};
