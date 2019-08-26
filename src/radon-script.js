import { PSEUDOTYPES, TYPES, typeSystem } from "./radon-types";

class Script {
  constructor (firstType) {
    this.script = []
    this.lastType = firstType

    this.proxy = new Proxy(this, {
      get (target, propKey) {
        return target[propKey] || target.apply(propKey)
      },
    })

    return this.proxy
  }

  apply (operator) {
    return (...args) => {
      let lastType = this.lastType
      const next = typeSystem[lastType[0]][operator]
      if (next !== undefined) {
        let [nextOpCode, nextType] = next
        let nextCall = args.length > 0 ? [nextOpCode, ...args] : nextOpCode

        this.script.push(nextCall)
        if (nextType[0] === PSEUDOTYPES.INNER) {
          // Unwrap the inner type
          nextType = [this.lastType[1]]
        } else if (nextType[0] === PSEUDOTYPES.ARGUMENT) {
          // Take the return type from the arguments
          let firstBranch = args[0][0][1]
          nextType = [{
            "number": TYPES.FLOAT,
            "string": TYPES.STRING,
            "boolean": TYPES.BOOLEAN,
            "undefined": undefined,
          }[typeof firstBranch] || TYPES.BYTES]
        } else if (nextType[1] === PSEUDOTYPES.PASSTHROUGH) {
          // Pop up the innermost type
          nextType = [this.lastType[0], this.lastType[2]]
        } else if (nextType[1] === PSEUDOTYPES.INNER) {
          // Pass down the inner type
          nextType[1] = this.lastType[1]
        }
        this.lastType = nextType
      } else {
        console.error(`Method ${typeFormat(lastType)}::${operator} is not implemented`)
      }

      return this.proxy
    }
  }
}

export {
  Script
}
