"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typeFormat = typeFormat;
exports.typeSystem = exports.TYPES = exports.REDUCERS = exports.PSEUDOTYPES = exports.FILTERS = void 0;

var _typeSystem;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Type names
var TYPES = {
  BOOLEAN: "Boolean",
  INTEGER: "Integer",
  FLOAT: "Float",
  STRING: "String",
  ARRAY: "Array",
  MAP: "Map",
  BYTES: "Bytes",
  RESULT: "Result" // Pseudo-type names

};
exports.TYPES = TYPES;
var PSEUDOTYPES = {
  INNER: "Inner",
  MATCH: "Match",
  PASSTHROUGH: "Passthrough",
  SUBSCRIPT: "Subscript"
};
exports.PSEUDOTYPES = PSEUDOTYPES;
var REDUCERS = {
  min: 0x00,
  max: 0x01,
  mode: 0x02,
  averageMean: 0x03,
  averageMeanWeighted: 0x04,
  averageMedian: 0x05,
  averageMedianWeighted: 0x06,
  deviationStandard: 0x07,
  deviationAverage: 0x08,
  deviationMedian: 0x09,
  deviationMaximum: 0x0A
};
exports.REDUCERS = REDUCERS;
var FILTERS = {
  greaterThan: 0x00,
  lessThan: 0x01,
  equals: 0x02,
  deviationAbsolute: 0x03,
  deviationRelative: 0x04,
  deviationStandard: 0x05,
  top: 0x06,
  bottom: 0x07,
  lessOrEqualThan: 0x80,
  greaterOrEqualThan: 0x81,
  notEquals: 0x82,
  notDeviationAbsolute: 0x83,
  notDeviationRelative: 0x84,
  notDeviationStandard: 0x85,
  notTop: 0x86,
  notBottom: 0x87
};
exports.FILTERS = FILTERS;
var typeSystem = (_typeSystem = {}, _defineProperty(_typeSystem, TYPES.BOOLEAN, {
  match: [0x10, [PSEUDOTYPES.MATCH]],
  negate: [0x11, [TYPES.BOOLEAN]],
  asString: [0x12, [TYPES.STRING]]
}), _defineProperty(_typeSystem, TYPES.INTEGER, {
  absolute: [0x20, [TYPES.INTEGER]],
  asBytes: [0x21, [TYPES.BYTES]],
  asFloat: [0x22, [TYPES.FLOAT]],
  asString: [0x23, [TYPES.STRING]],
  greaterThan: [0x24, [TYPES.BOOLEAN]],
  lessThan: [0x25, [TYPES.BOOLEAN]],
  match: [0x26, [PSEUDOTYPES.MATCH]],
  modulo: [0x27, [TYPES.INTEGER]],
  multiply: [0x28, [TYPES.INTEGER]],
  negate: [0x29, [TYPES.INTEGER]],
  power: [0x2A, [TYPES.INTEGER]],
  reciprocal: [0x2B, [TYPES.FLOAT]],
  sum: [0x2C, [TYPES.INTEGER]]
}), _defineProperty(_typeSystem, TYPES.FLOAT, {
  absolute: [0x30, [TYPES.INTEGER]],
  asBytes: [0x31, [TYPES.BYTES]],
  asString: [0x32, [TYPES.STRING]],
  ceiling: [0x33, [TYPES.INTEGER]],
  graterThan: [0x34, [TYPES.BOOLEAN]],
  floor: [0x35, [TYPES.INTEGER]],
  lessThan: [0x36, [TYPES.BOOLEAN]],
  modulo: [0x37, [TYPES.FLOAT]],
  multiply: [0x38, [TYPES.FLOAT]],
  negate: [0x39, [TYPES.FLOAT]],
  power: [0x3A, [TYPES.FLOAT]],
  reciprocal: [0x3B, [TYPES.FLOAT]],
  round: [0x3C, [TYPES.INTEGER]],
  sum: [0x3D, [TYPES.FLOAT]],
  truncate: [0x3E, [TYPES.INTEGER]]
}), _defineProperty(_typeSystem, TYPES.STRING, {
  asBytes: [0x40, [TYPES.BYTES]],
  asFloat: [0x41, [TYPES.FLOAT]],
  asInteger: [0x42, [TYPES.INTEGER]],
  length: [0x43, [TYPES.INTEGER]],
  match: [0x44, [PSEUDOTYPES.MATCH]],
  parseJSON: [0x45, [TYPES.BYTES]],
  parseXML: [0x46, [TYPES.MAP]],
  asBoolean: [0x47, [TYPES.BOOLEAN]],
  toLowerCase: [0x48, [TYPES.STRING]],
  toUpperCase: [0x49, [TYPES.STRING]]
}), _defineProperty(_typeSystem, TYPES.ARRAY, {
  asBytes: [0x50, [TYPES.BYTES]],
  count: [0x51, [TYPES.INTEGER]],
  every: [0x52, [TYPES.BOOLEAN]],
  filter: [0x53, [TYPES.ARRAY, PSEUDOTYPES.INNER]],
  flatten: [0x54, [TYPES.ARRAY, PSEUDOTYPES.PASSTHROUGH]],
  get: [0x55, [PSEUDOTYPES.INNER]],
  map: [0x56, [PSEUDOTYPES.SUBSCRIPT]],
  reduce: [0x57, [PSEUDOTYPES.INNER]],
  some: [0x58, [TYPES.BOOLEAN]],
  sort: [0x59, [TYPES.ARRAY, PSEUDOTYPES.INNER]],
  take: [0x5A, [TYPES.ARRAY, PSEUDOTYPES.INNER]]
}), _defineProperty(_typeSystem, TYPES.MAP, {
  entries: [0x60, [TYPES.ARRAY, TYPES.ARRAY, PSEUDOTYPES.BYTES]],
  get: [0x61, [PSEUDOTYPES.INNER]],
  keys: [0x62, [TYPES.ARRAY, TYPES.STRING]],
  values: [0x63, [TYPES.ARRAY, PSEUDOTYPES.INNER]]
}), _defineProperty(_typeSystem, TYPES.BYTES, {
  asArray: [0x70, [TYPES.ARRAY, TYPES.BYTES]],
  asBoolean: [0x71, [TYPES.BOOLEAN]],
  asFloat: [0x72, [TYPES.FLOAT]],
  asInteger: [0x73, [TYPES.INTEGER]],
  asMap: [0x74, [TYPES.MAP, TYPES.BYTES]],
  asString: [0x75, [TYPES.STRING]],
  hash: [0x75, [TYPES.BYTES]]
}), _defineProperty(_typeSystem, TYPES.RESULT, {
  get: [0x80, [PSEUDOTYPES.INNER]],
  getOr: [0x81, [PSEUDOTYPES.INNER]],
  isOk: [0x82, [TYPES.BOOLEAN]]
}), _typeSystem); // Helper function that helps pretty-printing RADON types

exports.typeSystem = typeSystem;

function typeFormat(type) {
  if (type.length > 1) {
    return "".concat(type[0], "<").concat(typeFormat(type.slice(1)), ">");
  } else {
    return type[0];
  }
}