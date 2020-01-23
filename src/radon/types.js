// Type names
const TYPES = {
  BOOLEAN: "Boolean",
  INTEGER: "Integer",
  FLOAT: "Float",
  STRING: "String",
  ARRAY: "Array",
  MAP: "Map",
  BYTES: "Bytes",
  RESULT: "Result",
};

// Pseudo-type names
const PSEUDOTYPES = {
  ANY: "Any",
  INNER: "Inner",
  MATCH: "Match",
  SAME: "Same",
  SUBSCRIPT: "Subscript",
};

const REDUCERS = {
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
  deviationMaximum: 0x0A,
};

const FILTERS = {
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
  notBottom: 0x87,
};

const typeSystem = {
  [TYPES.ANY]: {
    identity: [0x00, [PSEUDOTYPES.SAME]],
  },
  [TYPES.ARRAY]: {
    count: [0x10, [TYPES.INTEGER]],
    filter: [0x11, [PSEUDOTYPES.SAME]],
    flatten: [0x12, [PSEUDOTYPES.INNER]],
    getArray: [0x13, [PSEUDOTYPES.INNER]],
    getBoolean: [0x14, [TYPES.BOOLEAN]],
    getBytes: [0x15, [TYPES.BYTES]],
    getFloat: [0x16, [TYPES.FLOAT]],
    getInteger: [0x17, [TYPES.INTEGER]],
    getMap: [0x18, [TYPES.MAP]],
    getString: [0x19, [TYPES.STRING]],
    map: [0x1A, [PSEUDOTYPES.SUBSCRIPT]],
    reduce: [0x1B, [PSEUDOTYPES.INNER]],
    some: [0x1C, [TYPES.BOOLEAN]],
    sort: [0x1D, [PSEUDOTYPES.SAME]],
    take: [0x1E, [PSEUDOTYPES.SAME]],
  },
  [TYPES.BOOLEAN]: {
    asString: [0x20, [TYPES.STRING]],
    match: [0x21, [PSEUDOTYPES.MATCH]],
    negate: [0x22, [TYPES.BOOLEAN]]
  },
  [TYPES.BYTES]: {
    asString: [0x30, [TYPES.STRING]],
    hash: [0x31, [TYPES.BYTES]]
  },
  [TYPES.INTEGER]: {
    absolute: [0x40, [TYPES.INTEGER]],
    asFloat: [0x41, [TYPES.FLOAT]],
    asString: [0x42, [TYPES.STRING]],
    greaterThan: [0x43, [TYPES.BOOLEAN]],
    lessThan: [0x44, [TYPES.BOOLEAN]],
    match: [0x45, [PSEUDOTYPES.MATCH]],
    modulo: [0x46, [TYPES.INTEGER]],
    multiply: [0x47, [TYPES.INTEGER]],
    negate: [0x48, [TYPES.INTEGER]],
    power: [0x49, [TYPES.INTEGER]],
    reciprocal: [0x4A, [TYPES.FLOAT]],
    sum: [0x4B, [TYPES.INTEGER]]
  },
  [TYPES.FLOAT]: {
    absolute: [0x50, [TYPES.FLOAT]],
    asString: [0x51, [TYPES.STRING]],
    ceiling: [0x52, [TYPES.INTEGER]],
    greaterThan: [0x53, [TYPES.BOOLEAN]],
    floor: [0x54, [TYPES.INTEGER]],
    lessThan: [0x55, [TYPES.BOOLEAN]],
    modulo: [0x56, [TYPES.FLOAT]],
    multiply: [0x57, [TYPES.FLOAT]],
    negate: [0x58, [TYPES.FLOAT]],
    power: [0x59, [TYPES.FLOAT]],
    reciprocal: [0x5A, [TYPES.FLOAT]],
    round: [0x5B, [TYPES.INTEGER]],
    sum: [0x5C, [TYPES.FLOAT]],
    truncate: [0x5d, [TYPES.INTEGER]],
  },
  [TYPES.MAP]: {
    // `entries` needs to be deprecated
    entries: [0x60, [PSEUDOTYPES.SAME]],
    getArray: [0x61, [TYPES.ARRAY]],
    getBoolean: [0x62, [TYPES.BOOLEAN]],
    getBytes: [0x63, [TYPES.BYTES]],
    getFloat: [0x64, [TYPES.FLOAT]],
    getInteger: [0x65, [TYPES.INTEGER]],
    getMap: [0x66, [TYPES.MAP]],
    getString: [0x67, [TYPES.STRING]],
    keys: [0x68, [TYPES.ARRAY, TYPES.STRING]],
    valuesAsArray: [0x69, [TYPES.ARRAY, TYPES.ARRAY]],
    valuesAsBoolean: [0x6A, [TYPES.ARRAY, TYPES.BOOLEAN]],
    valuesAsBytes: [0x6B, [TYPES.ARRAY, TYPES.BYTES]],
    valuesAsInteger: [0x6C, [TYPES.ARRAY, TYPES.INTEGER]],
    valuesAsFloat: [0x6D, [TYPES.ARRAY, TYPES.FLOAT]],
    valuesAsMap: [0x6E, [TYPES.ARRAY, TYPES.MAP]],
    valuesAsString: [0x6F, [TYPES.ARRAY, TYPES.STRING]],
  },
  [TYPES.STRING]: {
    asBoolean: [0x70, [TYPES.BOOLEAN]],
    asBytes: [0x71, [TYPES.BYTES]],
    asFloat: [0x72, [TYPES.FLOAT]],
    asInteger: [0x73, [TYPES.INTEGER]],
    length: [0x74, [TYPES.INTEGER]],
    match: [0x75, [PSEUDOTYPES.MATCH]],
    parseArrayJSON: [0x76, [TYPES.ARRAY]],
    parseMapJSON: [0x77, [TYPES.MAP]],
    parseXML: [0x78, [TYPES.MAP]],
    toLowerCase: [0x79, [TYPES.STRING]],
    toUpperCase: [0x7A, [TYPES.STRING]],
  }
};


// Helper function that helps pretty-printing RADON types
function typeFormat (type) {
  if (type.length > 1) {
    return `${type[0]}<${typeFormat(type.slice(1))}>`
  } else {
    return type[0]
  }
}

export {
  FILTERS,
  PSEUDOTYPES,
  REDUCERS,
  TYPES,
  typeFormat,
  typeSystem,
}
