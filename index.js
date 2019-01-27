'use strict';
global.artifacts = artifacts;

const args = require('minimist')(process.argv.slice(2));
const network = args.network;

const nconf = require('nconf');
nconf.argv().env().file({ file: `./config/config-${network}.json` });

const BigNumber = web3.BigNumber;
BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN });

async function setup() {
	console.log(web3.version);
	console.log(web3.BigNumber);
	return;
}

module.exports = callback => setup()
    .catch(error => console.error("Error running script", error))
    .then(callback);

module.exports.setup = setup;