#!/usr/bin/env node

/*
 Imports
 */
import "core-js/stable"
import "regenerator-runtime/runtime"
import {loadSchema} from "../lib/rad2sol/steps";
import {readCompileEncodeScript} from "../lib/rad2sol/scripts";
const cbor = require('cbor')
const fs = require('fs')
const os = require('os')
const path = require('path')
const vm = require('vm')
const readline = require('readline')
const { Radon } = require('witnet-radon-js')
const request = require('request')
const { exec } = require("child_process")


/*
 Constants
 */
const toolkitDownloadUrlBase = "https://github.com/witnet/witnet-rust/releases/download/1.5.2/"
const toolkitFileNames = {
  win32: (arch) => `witnet_toolkit-${arch}-pc-windows-msvc.exe`,
  linux: (arch) => `witnet_toolkit-${arch}-unknown-linux-gnu${arch.includes("arm") ? "eabihf" : ""}`,
  darwin: (arch) => `witnet_toolkit-${arch}-apple-darwin`,
}
const archsMap = {
  x64: 'x86_64'
}

/*
 Environment acquisition
 */
let args = process.argv
const binDir = __dirname

/*
 Helpers
 */
function guessPlatform () {
  return os.platform()
}

function guessArch () {
  const rawArch = os.arch()

  return archsMap[rawArch] || rawArch
}

function guessToolkitFileName (platform, arch) {
  return (toolkitFileNames[platform] || toolkitFileNames['linux'])(arch)
}

function guessToolkitBinPath (toolkitDirPath, platform, arch) {
  const fileName = guessToolkitFileName(platform, arch)

  return path.resolve(toolkitDirPath, fileName)
}

function checkToolkitIsDownloaded (toolkitBinPath) {
  return fs.existsSync(toolkitBinPath)
}

async function prompt (question) {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve, _) => {
    readlineInterface.question(`${question} `, (response) => {
      readlineInterface.close()
      resolve(response.trim())
    })
  })
}

function guessDownloadUrl(toolkitFileName) {
  return `${toolkitDownloadUrlBase}${toolkitFileName}`
}

async function downloadToolkit (toolkitFileName, toolkitBinPath, platform, arch) {
  const downloadUrl = guessDownloadUrl(toolkitFileName)
  console.log('Downloading', downloadUrl, 'into', toolkitBinPath)

  const file = fs.createWriteStream(toolkitBinPath)
  const req = request.get(downloadUrl, { followAllRedirects: true })

  req.on('response', (_) => {
    req.pipe(file)
  })

  return new Promise((resolve, reject) => {
    file.on('finish', () => {
      file.close(() => {
        if (file.bytesWritten > 1000000) {
          fs.chmodSync(toolkitBinPath, 0o755)
          resolve()
        } else {
          reject(`No suitable witnet_toolkit binary found. Maybe your OS (${platform}) or architecture \
(${arch}) are not yet supported. Feel free to complain about it in the Witnet community on Discord: \
https://discord.gg/2rTFYXHmPm `)
        }
      })
    })

    const errorHandler = (err) => {
      fs.unlink(downloadUrl, () => {
        reject(err)
      })
    }

    file.on('error', errorHandler)
    req.on('error', errorHandler)
  })
}

async function toolkitRun(settings, args) {
  const cmd = `${settings.paths.toolkitBinPath} ${args.join(' ')}`
  if (settings.verbose) {
    console.log('Running >', cmd)
  }

  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      }
      if (stderr) {
        if (settings.verbose) {
          console.log('STDERR <', stderr)
        }
        reject(stderr)
      }
      if (settings.verbose) {
        console.log('STDOUT <', stdout)
      }
      resolve(stdout)
    })
  })
}

function formatRadonValue (call) {
  const radonType = Object.keys(call)[0]
  let value = JSON.stringify(call[radonType])

  if (radonType === 'RadonInteger') {
    value = parseInt(value.replace('\"', ''))
  } else if (radonType === 'RadonError') {
    value = red(
      value
        .replace(/.*Inner\:\s`Some\((?<inner>.*)\)`.*/g, '$<inner>')
        .replace(/UnsupportedReducerInAT\s\{\soperator\:\s0\s\}/g, 'MissingReducer')
    )
  }

  return [radonType.replace('Radon', ''), value]
}

function blue (string) {
  return `\x1b[34m${string}\x1b[0m`
}

function green (string) {
  return `\x1b[32m${string}\x1b[0m`
}

function red (string) {
  return `\x1b[31m${string}\x1b[0m`
}

function yellow (string) {
  return `\x1b[33m${string}\x1b[0m`
}

/*
 Command handlers
 */
async function installCommand (settings) {
  if (!settings.checks.toolkitIsDownloaded) {
    console.log(`The witnet_toolkit native binary hasn't been downloaded yet (this is a requirement).`)
    const will = await prompt("Do you want to download it now? (Y/n)")

    if (['', 'y'].includes(will.toLowerCase())) {
      return downloadToolkit(
        settings.paths.toolkitFileName,
        settings.paths.toolkitBinPath,
        settings.system.platform,
        settings.system.arch
      )
        .catch((err) => {
          console.error(`Error downloading witnet_toolkit binary:`, err)
        })
    } else {
      console.error('Aborted download of witnet_toolkit native binary.')
    }
  }
}

async function updateCommand (settings) {
  return downloadToolkit(
    settings.paths.toolkitFileName,
    settings.paths.toolkitBinPath,
    settings.system.platform,
    settings.system.arch
  )
    .catch((err) => {
      console.error(`Error updating witnet_toolkit binary:`, err)
    })
}

function decodeFilters (mir) {
  return mir.map((filter) => {
    if (filter.args.length > 0) {
      const decodedArgs = cbor.decode(Buffer.from(filter.args))
      return {...filter, args: decodedArgs}
    } else {
      return filter
    }
  })
}

function decodeScriptsAndArguments (mir) {
  let decoded = mir.data_request
  decoded.retrieve = decoded.retrieve.map((source) => {
    const decodedScript = cbor.decode(Buffer.from(source.script))
    return {...source, script: decodedScript}
  })
  decoded.aggregate.filters = decodeFilters(decoded.aggregate.filters)
  decoded.tally.filters = decodeFilters(decoded.tally.filters)

  return decoded
}

async function fromJavascriptTaskToHexTask (task, _i, _a) {
  const schemaDir = path.resolve(__dirname, "../../assets");
  const schema = loadSchema(fs, path, schemaDir, "witnet");
  const queryDir = path.dirname(task[2])
  const fileName = path.basename(task[2])
  const script = readCompileEncodeScript(fs, path, vm, schema, queryDir, [fileName], [])
  const hex = (await Promise.all(script.reduce((prev, step) => prev.map((p, i) => p.then(v => step(v, i))), [Promise.resolve(fileName)])))[0]

  return [task[0], '--hex', hex]
}

function tasksFromMatchingFiles (args, matcher) {
  return fs.readdirSync(args[2])
    .filter((filename) => filename.match(matcher))
    .map((filename) => [args[0], args[1], path.join(args[2], filename)])
}

async function tasksFromArgs (args) {
  let tasks = [args]
  if (args[1] === '--from-solidity') {
    // If no path is provided, fallback to default compiled queries directory
    if (args[2] === undefined) {
      args[2] = './contracts/queries/'
    }
    // If the path is a directory, find `.sol` files within, and use those as tasks
    if (fs.lstatSync(args[2]).isDirectory()) {
      tasks = tasksFromMatchingFiles(args, /.+.sol$/g)
    }
  } else if (args[1] === '--from-javascript') {
    // If no path is provided, fallback to default source queries
    if (args[2] === undefined) {
      args[2] = './queries/'
    }
    // If the path is a directory, find `.js` files within, and use those as tasks
    if (fs.lstatSync(args[2]).isDirectory()) {
      tasks = tasksFromMatchingFiles(args, /.+.js$/g)
    }
    tasks = await Promise.all(tasks.map(fromJavascriptTaskToHexTask))
  }
  // Ensure that no task contains arguments starting with `0x`
  tasks.forEach(args => args[2] = args[2].replace(/^0x/gm, ''))

  return tasks
}

async function decodeQueryCommand (settings, args) {
  const tasks = await tasksFromArgs(args)
  const promises = Promise.all(tasks.map(async (task) => {
    return fallbackCommand(settings, ['decode-query', ...task.slice(1)])
      .then(JSON.parse)
      .then(decodeScriptsAndArguments)
      .then((decoded) => JSON.stringify(decoded, null, 4))
  }))

  return (await promises).join()
}

async function tryQueryCommand (settings, args) {
  let query, radon
  const tasks = await tasksFromArgs(args)

  return Promise.all(tasks.map(async (task) => {
    const queryJson = await fallbackCommand(settings, ['decode-query', ...task.slice(1)])
    const mir = JSON.parse(queryJson)
    query = decodeScriptsAndArguments(mir)
    radon = new Radon(query)
    const output = await fallbackCommand(settings, task)

    let report;
    try {
      report = JSON.parse(output)
    } catch {
      return
    }
    const dataSourcesCount = report.retrieve.length

    const dataSourcesInterpolation = report.retrieve.map((source, sourceIndex, sources) => {
      let executionTime
      try {
        executionTime =
          (source.context.completion_time.nanos_since_epoch - source.context.start_time.nanos_since_epoch) / 1000000
      } catch (_) {
        executionTime = 0
      }

      const cornerChar = sourceIndex < sources.length - 1 ? '├' : '└'
      const sideChar = sourceIndex < sources.length - 1 ? '│' : ' '

      let traceInterpolation
      try {
        if ((source.partial_results || []).length === 0) {
          source.partial_results = [source.result]
        }
        traceInterpolation = source.partial_results.map((radonValue, callIndex) => {
          const formattedRadonValue = formatRadonValue(radonValue)

          const operator = radon
            ? (callIndex === 0
            ? blue(radon.retrieve[sourceIndex].kind)
            : `.${blue(radon.retrieve[sourceIndex].script.operators[callIndex - 1].operatorInfo.name + '(')}${radon.retrieve[sourceIndex].script.operators[callIndex - 1].mirArguments.join(', ') + blue(')')}`) + ' ->'
            : ''

          return ` │   ${sideChar}    [${callIndex}] ${operator} ${yellow(formattedRadonValue[0])}: ${formattedRadonValue[1]}`
        }).join('\n')
      } catch (e) {
        traceInterpolation = ` |   ${sideChar}  ${red('[ERROR] Cannot decode execution trace information')}`
      }

      let urlInterpolation = query ? `
 |   ${sideChar}  Method: ${radon.retrieve[sourceIndex].kind}
 |   ${sideChar}  Complete URL: ${radon.retrieve[sourceIndex].url}` : ''

      // TODO: take headers info from `radon` instead of `query` once POST is supported in `witnet-radon-js`
      const headers = query.retrieve[sourceIndex].headers
      if (headers) {
        const headersInterpolation = headers.map(([key, value]) => `
 |   ${sideChar}    "${key}": "${value}"`).join()
        urlInterpolation += `
 |   ${sideChar}  Headers: ${headersInterpolation}`
      }

      // TODO: take body info from `radon` instead of `query` once POST is supported in `witnet-radon-js`
      const body = query.retrieve[sourceIndex].body
      if (body) {
        urlInterpolation += `
 |   ${sideChar}  Body: ${Buffer.from(body)}`
      }

      const formattedRadonResult = formatRadonValue(source.result)
      const resultInterpolation = `${yellow(formattedRadonResult[0])}: ${formattedRadonResult[1]}`

      return ` │   ${cornerChar}─${green('[')} Source #${sourceIndex} ${ query ? `(${new URL(query.retrieve[sourceIndex].url).hostname})` : ''} ${green(']')}${urlInterpolation}
 |   ${sideChar}  Number of executed operators: ${source.context.call_index + 1 || 0}
 |   ${sideChar}  Execution time: ${executionTime > 0 ? executionTime + ' ms' : 'unknown'}
 |   ${sideChar}  Execution trace:\n${traceInterpolation}
 |   ${sideChar}  Result: ${resultInterpolation}`
    }).join('\n |   │\n')

    let aggregationExecuted, aggregationExecutionTime, aggregationResult, tallyExecuted, tallyExecutionTime, tallyResult

    try {
      aggregationExecuted = report.aggregate.context.completion_time !== null
      aggregationExecutionTime = aggregationExecuted &&
        (report.aggregate.context.completion_time.nanos_since_epoch - report.aggregate.context.start_time.nanos_since_epoch) / 1000000
      aggregationResult = formatRadonValue(report.aggregate.result);
    } catch (error) {
      aggregationExecuted = false
    }

    try {
      tallyExecuted = report.tally.context.completion_time !== null
      tallyExecutionTime = tallyExecuted &&
        (report.tally.context.completion_time.nanos_since_epoch - report.tally.context.start_time.nanos_since_epoch) / 1000000
      tallyResult = formatRadonValue(report.tally.result);
    } catch (error) {
      tallyExecuted = false
    }

    let filenameInterpolation = ''
    if (args.includes('--from-solidity')) {
      const filename = task[2].split('/').pop()
      filenameInterpolation = `\n║ ${green(filename)}${' '.repeat(42 - filename.length)} ║`
    }

    const retrievalInterpolation = ` │
 │  ┌────────────────────────────────────────────────┐
 ├──┤ Retrieval stage                                │
 │  ├────────────────────────────────────────────────┤
 │  │ Number of retrieved data sources: ${dataSourcesCount}${` `.repeat(13 - dataSourcesCount.toString().length)}│
 │  └┬───────────────────────────────────────────────┘
 │   │
${dataSourcesInterpolation}`

    const aggregationExecutionTimeInterpolation = aggregationExecuted ? `
 │  │ Execution time: ${aggregationExecutionTime} ms${` `.repeat(28 - aggregationExecutionTime.toString().length)}│` : ''
    const aggregationInterpolation = ` │
 │  ┌────────────────────────────────────────────────┐
 ├──┤ Aggregation stage                              │
 │  ├────────────────────────────────────────────────┤${aggregationExecutionTimeInterpolation}
 │  │ Result is ${yellow(aggregationResult[0])}: ${aggregationResult[1]}${` `.repeat(Math.max(0, (aggregationResult[0] === 'Error' ? 44 : 35) - aggregationResult[0].toString().length - aggregationResult[1].toString().length))}│
 │  └────────────────────────────────────────────────┘`

    const tallyExecutionTimeInterpolation = tallyExecuted ? `
    │ Execution time: ${tallyExecutionTime} ms${` `.repeat(28 - tallyExecutionTime.toString().length)}│` : ''
    const tallyInterpolation = ` │  
 │  ┌────────────────────────────────────────────────┐
 └──┤ Tally stage                                    │
    ├────────────────────────────────────────────────┤${tallyExecutionTimeInterpolation}
    │ Result is ${yellow(tallyResult[0])}: ${tallyResult[1]}${` `.repeat(Math.max(0, (tallyResult[0] === 'Error' ? 44 : 35) - tallyResult[0].toString().length - tallyResult[1].toString().length))}│
    └────────────────────────────────────────────────┘`

    return `╔════════════════════════════════════════════╗
║ Witnet query local execution report        ║${filenameInterpolation}
╚╤═══════════════════════════════════════════╝
${retrievalInterpolation}
${aggregationInterpolation}
${tallyInterpolation}`
  })).then((outputs) => outputs.join('\n'))
}

async function fallbackCommand (settings, args) {
  // For compatibility reasons, map query methods to data-request methods
  if (args.length > 0) {
    args = [args[0].replace('-query', '-data-request'), ...args.slice(1)]
  }

  return toolkitRun(settings, args)
    .catch((err) => {
      let errorMessage = err.message.split('\n').slice(1).join('\n').trim()
      const errorRegex = /.*^error: (?<message>.*)$.*/gm
      const matched = errorRegex.exec(err.message)
      if (matched) {
        errorMessage = matched.groups.message
      }
      console.error(errorMessage || err)
    })
}

/*
 Router
 */
const router = {
  'decode-query': decodeQueryCommand,
  'fallback': fallbackCommand,
  'install': installCommand,
  'try-query': tryQueryCommand,
  'update': updateCommand,
}

/*
 Paths derivation
 */
const toolkitDirPath = path.resolve(binDir, '../../assets/')
const platform = guessPlatform()
const arch = guessArch()
const toolkitFileName = guessToolkitFileName(platform, arch)
const toolkitBinPath = guessToolkitBinPath(toolkitDirPath, platform, arch)
const toolkitIsDownloaded = checkToolkitIsDownloaded(toolkitBinPath);

/*
 Settings composition
 */
const settings = {
  paths: {
    toolkitBinPath,
    toolkitDirPath,
    toolkitFileName,
  },
  checks: {
    toolkitIsDownloaded,
  },
  system: {
    platform,
    arch,
  },
  verbose: false
}

/*
 Main logic
 */
async function main () {
  // Enter verbose mode if the --verbose flag is on
  const verboseIndex = args.indexOf("--verbose")
  if (verboseIndex >= 2) {
    settings.verbose = true
    args = [...args.slice(0, verboseIndex), ...args.slice(verboseIndex + 1)]
  }

  // Find the right command using the commands router, or default to the fallback command
  const commandName = args[2]
  let command = router[commandName] || router['fallback']

  // Always run base command before anything else, mainly to ensure that the witnet_toolkit binary
  // has been downloaded
  await router['install'](settings)

  // Make sure that commands with --help are always passed through
  if (args.includes("--help")) {
    command = router['fallback']
  }

  // Run the invoked command, if any
  if (command) {
    const output = await command(settings, args.slice(2))
    if (output) {
      console.log(output.trim())
    }
  }
}

main()
