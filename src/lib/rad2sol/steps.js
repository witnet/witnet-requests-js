import * as Witnet from "../../..";
import * as Babel from "@babel/core/lib/transform";
import ProtoBuf from "protocol-buffers"
import {Disabled, isRoutedQuery, matchAll, simplifyName, sortObjectKeys} from "../../utils";

const witnetAddresses = require(`${process.cwd()}/node_modules/witnet-solidity-bridge/migrations/witnet.addresses`)
const witnetSettings = require(`${process.cwd()}/node_modules/witnet-solidity-bridge/migrations/witnet.settings`)

const QUERIES_JSON_FILE_NAME = "witnet-queries.json"

/*
 * THESE ARE THE DIFFERENT STEPS THAT CAN BE USED IN THE COMPILER SCRIPT.
 */
export function tap (x) {
  console.log(x);
  return x
}

export function queriesBanner () {
  console.log(`
Compiling your Witnet queries...
=================================`)
}

export function queriesSucceed (path, writeContracts, writeJson) {
  let writeInfo = ''
  if (writeContracts === Disabled && writeJson === Disabled) {
    writeInfo = `\x1b[33m
  WARNING: no compilation output was configured.
  Please use one of these options to get the compilation output written to the filesystem:
    --write-contracts          write compiled queries into Solidity contracts in the ./contracts directory
    --write-contracts <path>   write compiled queries into Solidity contracts in the specified path
    --write-json               write compiled queries into a JSON file in the ./migrations directory
    --write-json <path>        write compiled queries into a JSON file in the specified path\x1b[0m`
  } else {
    if (writeContracts !== Disabled) {
      writeInfo += `
  - Solidity contracts were written to ${writeContracts}`
    }
    if (writeJson !== Disabled) {
      writeInfo += `
  - Query bytecodes were written into a JSON file in ${path.resolve(writeJson, QUERIES_JSON_FILE_NAME)}`
    }
  }

  console.log(`
> All queries compiled successfully. ${writeInfo}`)
}

export function migrationsBanner () {
  console.log(`
Generating automatic migrations for your contracts...
=====================================================`)
}

export function migrationsSucceed () {
  console.log(`
> All migrations written successfully \x1b[33m(please remember to manually customize them if necessary)\x1b[0m.
`)
}

export function fail (error, process, verbose) {
  process.exitCode = 1;

  console.error(`
! \x1b[31mWITNET REQUESTS COMPILATION ERRORS:\x1b[0m
- ${error.message}`);

  if (verbose) {
    throw error
  }
}

export function readFile (path, fs) {
  return fs.readFileSync(path, "utf8")
}

export function loadSchema (fs, path, schemaDir, schemaName) {
  return ProtoBuf(readFile(path.resolve(schemaDir, `${schemaName}.proto`), fs))
}

export function compile (code) {
  return Babel.transformSync(code,
    {
      "plugins": [
        ["@babel/plugin-transform-modules-commonjs", {
          "allowTopLevelThis": true,
        }],
      ],
    }).code
}

export function execute (code, queryName, dirName, vm) {
  const context = vm.createContext({
    module: {},
    exports: {},
    require: (depName) => {
      if (["witnet-requests", "witnet-request", "witnet"].includes(depName)) {
        return Witnet
      } else {
        return require(depName)
      }
    },
  });

  try {
    const query = vm.runInContext(code, context, __dirname);
    console.log(`  - The result type of the query is \x1b[36m${Witnet.Types.typeFormat(query.dataPointType)}\x1b[0m`);
    return query
  } catch (e) {
    let error = e;
    if (e.message.includes("is not a export function")) {
      error = Error(`\x1b[1m${queryName} has one of these issues:\x1b[0m\n\
    1: \x1b[1mIt is missing the \`export\` statement\x1b[0m\n\
       Adding this line at the end of ${queryName} may help (please replace \`query\` by the name of your query \
object):

         export {query as default}

    2: \x1b[1mThe exported object is not an instance of the \`Request\` class\x1b[0m
       Please double-check that ${queryName} contains an instance of the \`Query\` class and it is exported as \
explained in issue 1.
       New instances of the \`Query\` class are created like this:

         const query = new Query()

       The Witnet documentation contains a complete tutorial on how to create queries from scratch:
       https://docs.witnet.io/smart-contracts/witnet-web-oracle/make-a-get-request

    (Node.js error was: ${e})`
      )
    } else if (e.message.includes("is not defined")) {
      const missing = e.message.match(/(.*) is not defined/)[1];
      if (Witnet.hasOwnProperty(missing)) {
        error = Error(`\x1b[1m${queryName} is missing an import for the \`${missing}\` module\x1b[0m
    Adding this line at the beginning of ${queryName} may help:

         import { ${missing} } from "witnet-requests"

    (Node.js error was: ${e})`)
      }
    }
    throw error
  }
}

export function pack (dro) {
  const query = dro.data.data_request;
  const retrieve = query.retrieve.map((branch) => {
    return { ...branch, script: branch.encode() }
  });
  const aggregate = query.aggregate.pack();
  const tally = query.tally.pack();

  return { ...dro.data, data_request: { ...query, retrieve, aggregate, tally } }
}

export function intoProtoBuf (query, schema) {
  return schema.DataRequestOutput.encode(query)
}

export function intoSol (hex, fileName) {
  const contractName = fileName.replace(/\.js/, "");

  return `// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

// For the Witnet Request Board OVM-compatible (Optimism) "trustable" implementation (e.g. BOBA network),
// replace the next import line with:
// import "witnet-solidity-bridge/contracts/impls/trustable/WitnetRequestBoardTrustableBoba.sol";
import "witnet-solidity-bridge/contracts/impls/trustable/WitnetRequestBoardTrustableDefault.sol";
import "witnet-solidity-bridge/contracts/requests/WitnetRequestInitializableBase.sol";

// The bytecode of the ${contractName} query that will be sent to Witnet
contract ${contractName}Request is WitnetRequestInitializableBase {
  function initialize() public {
    WitnetRequestInitializableBase.initialize(hex"${hex}");
  }
}
`
}

export function writeQueriesToJson (fs, path, newRequests, dir) {
  let existingRequests = {}
  const listFilePath = path.resolve(dir, QUERIES_JSON_FILE_NAME)
  if (fs.existsSync(listFilePath)) {
    existingRequests = JSON.parse(readFile(listFilePath, fs))
  }
  if (existingRequests) {
    Object.keys(newRequests).forEach((key) => {
      if (existingRequests[key]) {
        if (isRoutedQuery(existingRequests[key]) && !isRoutedQuery(newRequests[key])) {
          // Don't keep the bytecode field if the old query is not a routed query and the new query is
          const { bytecode , ...validExistingRequestsFields } = existingRequests[key]
          newRequests[key] = { ...validExistingRequestsFields, ...newRequests[key] }
        } else {
          newRequests[key] = { ...existingRequests[key], ...newRequests[key] }
        }
      }
    })
    // Make sure we don't delete any routed price feeds that have been generated manually (not present in newRequests)
    Object.entries(existingRequests).forEach(([key, query]) => {
      if (!newRequests[key] && !query.bytecode) {
        newRequests[key] = query
      }
    })
  }
  fs.writeFileSync(
    listFilePath,
    JSON.stringify(sortObjectKeys(newRequests), null, 4)
  );
}

export function writeSol (fs, path, sol, fileName, writeContracts) {
  const solFileName = fileName.replace(/\.js/, ".sol");
  fs.writeFileSync(path.resolve(writeContracts, solFileName), sol);

  return fileName
}

export function writeMigrations (fs, path, contractsDir, writeUserMigrations, writeWitnetMigrations) {
  // Early escape if no migrations are required
  if (writeUserMigrations === Disabled && writeWitnetMigrations === Disabled) {
    return;
  }

  migrationsBanner()

  const contractNames = fs.readdirSync(contractsDir)
    .filter(exampleName => exampleName.match(/.*\.sol$/));

  const artifacts = contractNames
    .filter(fileName => fileName !== "Migrations.sol")
    .map(fileName => `${fileName[0].toUpperCase()}${fileName.slice(1).replace(".sol", "")}`);

  const flatAddresses = Object.entries(witnetAddresses).reduce((acc, [realmKey, realmVal]) => {
    let realmEmit
    if (realmKey === "default") {
      realmEmit = realmVal
    } else {
      realmEmit = Object.entries(realmVal).reduce((acc, [netKey, netVal]) => {
        let netEmit
        if (netKey.includes(realmKey)) {
          netEmit = {[netKey]: netVal}
        } else {
          netEmit = {[`${realmKey}.${netKey}`]: netVal}
        }
        return {...acc, ...netEmit}
      }, {})
    }
    return {...acc, ...realmEmit}
  }, {})

  if (writeWitnetMigrations !== Disabled) {
    const stage1 = `// WARNING: DO NOT DELETE THIS FILE
// This file was auto-generated by the Witnet compiler, any manual changes will be overwritten.

const Witnet = artifacts.require("Witnet")
const WitnetParserLib = artifacts.require("WitnetParserLib")
const WitnetProxy = artifacts.require("WitnetProxy")

const addresses = ${JSON.stringify(flatAddresses, null, 2).replace(/(["}])$\n/gm, (m, p1) => `${p1},\n`)}

const artifactNames = ${JSON.stringify(witnetSettings.artifacts.default, null, 2).replace(/(["}])$\n/gm, (m, p1) => `${p1},\n`)}

module.exports = async function (deployer, network, accounts) {
  network = network.split("-")[0]
  if (["mainnet", "ropsten", "kovan", "rinkeby", "gorli", "goerli", "görli"].includes(network)) {
    network = "ethereum." + network
  }
  if (network in addresses) {
    WitnetParserLib.address = addresses[network]["WitnetParserLib"]
    WitnetProxy.address = addresses[network]["WitnetRequestBoard"]
  } else {
    // If we are using an unsupported network, try to deploy a mocked Witnet environment
    // This is specially convenient for testing on local networks (e.g. ganache)
    console.warn(\`Network "\${network}" is not officially supported by Witnet. A mock Witnet environment will be used.\`)
    const WitnetDecoderLib = artifacts.require(artifactNames["WitnetDecoderLib"])
    const WitnetParserLib = artifacts.require(artifactNames["WitnetParserLib"])
    const WitnetRequestBoard = artifacts.require(artifactNames["WitnetRequestBoard"])
    const WitnetProxy = artifacts.require(artifactNames["WitnetProxy"])
    let upgradeProxy = false
    if (!WitnetDecoderLib.isDeployed()) {
      await deployer.deploy(WitnetDecoderLib)
      await deployer.link(WitnetDecoderLib, [WitnetParserLib, WitnetRequestBoard])
    }
    if (!WitnetParserLib.isDeployed()) {
      await deployer.deploy(WitnetParserLib)
      await deployer.link(WitnetParserLib, [Witnet, WitnetRequestBoard])
    }
    if (!Witnet.isDeployed()) {
      await deployer.deploy(Witnet)
    }
    if (!WitnetRequestBoard.isDeployed()) {
      await deployer.deploy(WitnetRequestBoard, ${witnetSettings.constructorParams.default.WitnetRequestBoard.map(JSON.stringify).join(", ")})
      upgradeProxy = true
    }
    if (!WitnetProxy.isDeployed()) {
      await deployer.deploy(WitnetProxy)
      upgradeProxy = true
    }
    if (upgradeProxy) {
      const proxy = await WitnetProxy.deployed()
      await proxy.upgradeTo(
        WitnetRequestBoard.address,
        web3.eth.abi.encodeParameter("address[]", [accounts[0]])
      )
    }
  }
}
`;
    fs.writeFileSync(path.resolve(writeWitnetMigrations, "1_witnet_core.js"), stage1);
  } else {
    console.log("> \x1b[33mSkipping auto generation of migrations for Witnet core contracts.\x1b[0m")
  }


  if (writeUserMigrations !== Disabled) {
    const userContractsArgs = readMigrationArgs(writeUserMigrations, fs);

    const stage2 = `// WARNING: DO NOT DELETE THIS FILE
// This file was auto-generated by the Witnet compiler, any manual changes will be overwritten except
// each contracts' constructor arguments (you can freely edit those and the compiler will respect them).

const WitnetParserLib = artifacts.require("WitnetParserLib")
const WitnetProxy = artifacts.require("WitnetProxy")
${artifacts.map(artifact => `const ${artifact} = artifacts.require("${artifact}")`).join("\n")}

module.exports = async function (deployer) {
  await deployer.link(WitnetParserLib, [${artifacts.join(", ")}])
${artifacts.map(artifact => {
      let camelCase = `${artifact.slice(0, 1).toLowerCase()}${artifact.slice(1)}`
      let deployLine = "";
      if (artifact in userContractsArgs) {
        const args = userContractsArgs[artifact]
          .split(/[(,)]/).slice(2).reverse().slice(1).reverse().map(x => x.trim()).join(", ");
        console.log(`> ${artifact}: reusing existing constructor arguments (${args})`);
        deployLine = userContractsArgs[artifact]
      } else {
        const args = [artifact, ...mockSolidityArgs(readSolidityArgs(artifact, contractsDir, fs), artifacts)];
        console.log(`> ${artifact}: generating default constructor arguments (${args.slice(1).join(", ")})
  \x1b[33mWARNING: the autogenerated argument values may not make sense for the logic of the ${artifact}` +
          " contract's constructor.\n  Please make sure you customize them if needed before actually deploying anything" +
          ".\x1b[0m");
        deployLine = `  await deployer.deploy(${args.join(", ")})`
      }
      return `${deployLine}
  const ${camelCase} = await ${artifact}.deployed()
  await ${camelCase}.initialize()`
    }).join("\n")}
}
`;
    fs.writeFileSync(path.resolve(writeUserMigrations, "2_user_contracts.js"), stage2)
    migrationsSucceed()
  } else {
    console.log("> \x1b[33mSkipping auto generation of migrations for user contracts.\x1b[0m")
  }
}

export function readSolidityArgs (artifact, userContractsDir, fs) {
  const content = readFile(`${userContractsDir}${artifact}.sol`, fs);
  const regex = /constructor\s*\(([\w\s,]*)/m;

  return content.match(regex)[1]
}

export function readMigrationArgs (migrationsDir, fs) {
  fs.closeSync(fs.openSync(`${migrationsDir}/2_user_contracts.js`, "a"));
  const content = readFile(`${migrationsDir}/2_user_contracts.js`, fs);
  const regex = /^\s*(await)?\s*deployer\.deploy\([\s\n]*(\w+)[^)]*\)/mg;

  return matchAll(regex, content).reduce((acc, match) => ({ ...acc, [match[2]]: match[0] }), {})
}

export function mockSolidityArgs (args, artifacts) {
  const mocks = {
    "uint": 0,
    "uint8": 0,
    "uint16": 0,
    "uint32": 0,
    "uint64": 0,
    "uint128": 0,
    "uint256": 0,
    "int": 0,
    "int8": 0,
    "int16": 0,
    "int32": 0,
    "int64": 0,
    "int128": 0,
    "int256": 0,
    "string": "\"CHANGEME\"",
    "bytes": "\"DEADC0FFEE\"",
    "address": "\"0x0000000000000000000000000000000000000000\"",
    "bool": false,
  };

  const simpleArtifactNames = artifacts.reduce((acc, artifact) => {
    const simpleName = simplifyName(artifact);

    return { ...acc, [simpleName]: artifact};
  }, {});

  return args.split(",").map(arg => {
    const [type, argName] = arg.trim().split(" ");
    const simpleName = simplifyName(argName);
    if (["WitnetRequestBoard", "WitnetProxy", "address"].includes(type) && argName === "_wrb") {
      return "WitnetProxy.address"
    } else if (type === "address" && simpleArtifactNames.hasOwnProperty(simpleName)) {
      return `${simpleArtifactNames[simpleName]}.address`
    } else if (mocks.hasOwnProperty(type)) {
      return mocks[type]
    } else {
      return 0;
    }
  })
}
