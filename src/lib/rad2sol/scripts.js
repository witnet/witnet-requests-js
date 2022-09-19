import {compile, execute, intoProtoBuf, intoSol, pack, readFile, writeSol} from "./steps";
import {Disabled} from "../../utils";

function readScript (fs) {
  return [
    filePath => { console.log(`> Compiling ${filePath}`); return filePath },
    filePath => readFile(filePath, fs),
  ];
}

function compileScript (vm, requestPaths) {
  return [
    compile,
    (code, i) => execute(code, requestPaths[i], process.env.PWD, vm),
    pack,
  ];
}

function encodeScript (path, schema, requestsList, requestPaths) {
  return [
    (request) => intoProtoBuf(request, schema),
    buff => buff.toString("hex"),
    (hex, i) => {
      requestsList[path.basename(requestPaths[i]).replace(/\.js/, "")] = { bytecode: `0x${hex}` }
      return hex
    }
  ];
}

function writeSolScript (fs, path, requestPaths, writeContracts) {
  return [
    (hex, i) => intoSol(hex, path.basename(requestPaths[i])),
    (sol, i) => { if (writeContracts !== Disabled) { writeSol(fs, path, sol, path.basename(requestPaths[i]), writeContracts) } },
  ];
}

function readCompileEncodeScript (fs, path, vm, schema, requestPaths, requestsList) {
  return [
    ...readScript(fs, path, queryDir),
    ...compileScript(vm, requestPaths),
    ...encodeScript(path, schema, requestsList, requestPaths),
  ];
}

function readCompileEncodeWriteSolScript (fs, path, vm, schema, writeContracts, requestsList, requestsPaths) {
  return [
    ...readScript(fs),
    ...compileScript(vm, requestsPaths),
    ...encodeScript(path, schema, requestsList, requestsPaths),
    ...writeSolScript(fs, path, requestsPaths, writeContracts),
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
