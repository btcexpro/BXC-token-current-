'use strict';
global.artifacts = artifacts;

const args = require('minimist')(process.argv.slice(2));
const network = args.network;

const nconf = require('nconf');
nconf.argv().env().file({ file: `./config/config-${network}.json` });

const BigNumber = web3.BigNumber;
BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN });

const deployer = require('./utils/deployer.js');

async function setup() {
	console.log("<< Deploy : Begin >>")

	await deployer.setWeb3(web3);
	const owner = nconf.get("owner")

	await deployer.validate(network, owner);
	const bxcInstance = await deployer.deployBXC(network)
	const bxcSaleInstance = await deployer.deployBXCSale(network, bxcInstance, 1549584000)
	const bxcTeamVestingInstance = await deployer.deployBXCTeamVesting(network, bxcInstance)

	await deployer.mintTokens(network, bxcInstance, owner)
	await deployer.finishMinting(network, bxcInstance)
		
	await deployer.printContracts(network, bxcInstance, bxcSaleInstance, bxcTeamVestingInstance)
	console.log("<< Deploy : Ready >>")
}

module.exports = callback => setup()
    .catch(error => console.error("Error running script", error))
    .then(callback);

module.exports.setup = setup;