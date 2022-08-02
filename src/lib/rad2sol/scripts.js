import {compile, execute, intoProtoBuf, intoSol, pack, readFile, writeSol} from "./steps";
import {Disabled} from "../../utils";

function readScript (fs, path, queryDir) {
  return [
    fileName => path.resolve(queryDir, fileName),
    filePath => { console.log(`> Compiling ${filePath}`); return filePath },
    filePath => readFile(filePath, fs),
  ];
}

function compileScript (vm, requestNames) {
  return [
    compile,
    (code, i) => execute(code, requestNames[i], process.env.PWD, vm),
    pack,
  ];
}

function encodeScript (schema, requestsList, requestsNames) {
  return [
    (request) => intoProtoBuf(request, schema),
    buff => buff.toString("hex"),
    (hex, i) => {
      requestsList[requestsNames[i].replace(/\.js/, "")] = { bytecode: `0x${hex}` }
      return hex
    }
  ];
}

function writeSolScript (fs, path, requestsNames, writeContracts) {
  return [
    (hex, i) => intoSol(hex, requestsNames[i]),
    (sol, i) => { if (writeContracts !== Disabled) { writeSol(fs, path, sol, requestsNames[i], writeContracts) } },
  ];
}

function readCompileEncodeScript (fs, path, vm, schema, queryDir, requestsNames, requestsList) {
  return [
    ...readScript(fs, path, queryDir),
    ...compileScript(vm, requestsNames),
    ...encodeScript(schema, requestsList, requestsNames),
  ];
}

function readCompileEncodeWriteSolScript (fs, path, vm, schema, queryDir, writeContracts, requestsList, requestsNames) {
  return [
    ...readScript(fs, path, queryDir),
    ...compileScript(vm, requestsNames),
    ...encodeScript(schema, requestsList, requestsNames),
    ...writeSolScript(fs, path, requestsNames, writeContracts),
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
