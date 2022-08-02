function matchAll (regex, string) {
  const matches = [];
  while (true) {
    const match = regex.exec(string);
    if (match === null) break;
    matches.push(match)
  }
  return matches
}

const Disabled = Symbol("Disabled");

function formatPath (path) {
  return function (input) {
    if (input === Disabled) {
      return input
    } else {
      return path.resolve(path.normalize(input))
    }
  }
}

function isRoutedQuery (query) {
  return query.hasOwnProperty('bytecode')
}

function processArgv (from) {
  const to = {
    command: from[0],
    main: from[1],
  }

  from.slice(2).forEach((e, i, a) => {
    if (e.startsWith("--")) {
      to[e.slice(2)] = a[i + 1]
    } else if (!from[i + 1].startsWith("--")) {
      to.target = e
    }
  })

  return function (arg, defaultValue, forceDefault) {
    if (arg in to) {
      return to[arg] || defaultValue
    } else {
      return forceDefault ? defaultValue : Disabled
    }
  }
}

function simplifyName (name) {
  return name.toLowerCase().replace("_", "")
}

// Creates an object with their keys sorted alphabetically
function sortObjectKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([key1], [key2]) => key1.localeCompare(key2))
  );
}

export {
  matchAll,
  Disabled,
  formatPath,
  isRoutedQuery,
  processArgv,
  simplifyName,
  sortObjectKeys
}
