#!/usr/bin/env node

/*
 Imports
 */
import "core-js/stable"
import "regenerator-runtime/runtime"
const cbor = require('cbor')
const fs = require('fs')
const os = require('os')
const path = require('path')
const readline = require('readline')
const { Radon } = require('witnet-radon-js')
const request = require('request')
const { exec } = require("child_process")


/*
 Constants
 */
const toolkitDownloadUrlBase = "https://github.com/witnet/witnet-rust/releases/download/1.4.3/"
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
const args = process.argv
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
  return new Promise((resolve, reject) => {
    exec(`${settings.paths.toolkitBinPath} ${args.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      }
      if (stderr) {
        reject(stderr)
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

function decodeScriptsAndArguments (mir) {
  let decoded = mir.data_request
  decoded.retrieve = decoded.retrieve.map((source) => {
    const decodedScript = cbor.decode(Buffer.from(source.script))
    return {...source, script: decodedScript}
  })
  decoded.aggregate.filters = decoded.aggregate.filters.map((filter) => {
    const decodedArgs = cbor.decode(Buffer.from(filter.args))
    return {...filter, args: decodedArgs}
  })
  decoded.tally.filters = decoded.tally.filters.map((filter) => {
    const decodedArgs = cbor.decode(Buffer.from(filter.args))
    return {...filter, args: decodedArgs}
  })

  return decoded
}

async function decodeDataRequestCommand (settings, args) {
  return fallbackCommand(settings, args)
    .then(JSON.parse)
    .then(decodeScriptsAndArguments)
    .then((decoded) => JSON.stringify(decoded, null, 4))
}

async function tryDataRequestCommand (settings, args) {
  let request, radon

  let tasks = [args]
  if (args[1] === '--from-solidity') {
    // If no path is provided, fallback to default data request path
    if (args[2] === undefined) {
      args[2] = './contracts/requests/'
    }
    // If the path is a directory, find `.sol` files within, and use those as tasks
    if (fs.lstatSync(args[2]).isDirectory()) {
      tasks = fs.readdirSync(args[2])
        .filter((filename) => filename.match(/.+.sol$/g))
        .map((filename) => [args[0], args[1], path.join(args[2], filename)])
    }
  }

  return Promise.all(tasks.map(async (task) => {
    const request_json = await toolkitRun(settings, ['decode-data-request', ...task.slice(1)])
    const mir = JSON.parse(request_json)
    request = decodeScriptsAndArguments(mir)

    radon = new Radon(request)

    const output = await fallbackCommand(settings, task)

    let report;
    try {
      report = JSON.parse(output)
    } catch {
      return
    }
    const dataSourcesCount = report.retrieve.length

    const dataSourcesInterpolation = report.retrieve.map((source, sourceIndex, sources) => {
      const executionTime =
        (source.context.completion_time.nanos_since_epoch - source.context.start_time.nanos_since_epoch) / 1000000

      const cornerChar = sourceIndex < sources.length - 1 ? '├' : '└'
      const sideChar = sourceIndex < sources.length - 1 ? '│' : ' '

      const traceInterpolation = source.partial_results.map((radonValue, callIndex) => {
        const formattedRadonValue = formatRadonValue(radonValue)

        const operator = radon
          ? (callIndex === 0
          ? blue(radon.retrieve[sourceIndex].kind)
          : `.${blue(radon.retrieve[sourceIndex].script.operators[callIndex - 1].operatorInfo.name + '(')}${radon.retrieve[sourceIndex].script.operators[callIndex - 1].mirArguments.join(', ') + blue(')')}`) + ' ->'
          : ''

        return ` │   ${sideChar}    [${callIndex}] ${operator} ${yellow(formattedRadonValue[0])}: ${formattedRadonValue[1]}`
      }).join('\n')

      const urlInterpolation = request ? `
 |   ${sideChar}  Method: ${radon.retrieve[sourceIndex].kind}
 |   ${sideChar}  Complete URL: ${radon.retrieve[sourceIndex].url}` : ''

      return ` │   ${cornerChar}─${green('[')} Source #${sourceIndex} ${ request ? `(${new URL(request.retrieve[sourceIndex].url).hostname})` : ''} ${green(']')}${urlInterpolation}
 |   ${sideChar}  Number of executed operators: ${source.context.call_index}
 |   ${sideChar}  Execution time: ${executionTime} ms
 |   ${sideChar}  Execution trace:\n${traceInterpolation}`
    }).join('\n |   │\n')

    const aggregationExecuted = report.aggregate.context.completion_time !== null
    const tallyExecuted = report.tally.context.completion_time !== null

    const aggregationExecutionTime = aggregationExecuted &&
      (report.aggregate.context.completion_time.nanos_since_epoch - report.aggregate.context.start_time.nanos_since_epoch) / 1000000
    const tallyExecutionTime = tallyExecuted &&
      (report.tally.context.completion_time.nanos_since_epoch - report.tally.context.start_time.nanos_since_epoch) / 1000000

    const aggregationResult = formatRadonValue(report.aggregate.result);
    const tallyResult = formatRadonValue(report.tally.result);

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
║ Witnet data request local execution report ║${filenameInterpolation}
╚╤═══════════════════════════════════════════╝
${retrievalInterpolation}
${aggregationInterpolation}
${tallyInterpolation}`
  })).then((outputs) => outputs.join('\n'))
}

async function fallbackCommand (settings, args) {
  return toolkitRun(settings, args)
    .catch((err) => {
      let errorMessage = err.message.split('\n').slice(1).join('\n').trim()
      const errorRegex = /.*^error: (?<message>.*)$.*/gm
      const matched = errorRegex.exec(err.message)
      if (matched) {
        errorMessage = matched.groups.message
      }
      console.error(errorMessage)
    })
}

/*
 Router
 */
const router = {
  'decode-data-request': decodeDataRequestCommand,
  'fallback': fallbackCommand,
  'install': installCommand,
  'try-data-request': tryDataRequestCommand,
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
  }
}

/*
 Main logic
 */
async function main () {
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
