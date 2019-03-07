'use strict';
const deployer = require('../utils/deployer.js');

const BigNumber = web3.BigNumber;
BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN });

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should();

const Utils = require('./helpers/utils');
const TimeHelper = require('./helpers/timeHelper');

var appInstance;
var bxcInstance;
var bxcSaleInstance;
var bxcTeamVestingInstance;

var network, owner, wallet;
var initialBalances;

var day = 86400; 
var month = day * 30;
var year = day * 365;

var saleStart;

contract('BXCTeamVesting' , (accounts) => {
	beforeEach(async () => {
		// saleStart
		saleStart = new BigNumber(await TimeHelper.getBlockTime() + 60);

		// deploy contracts
		({ network, owner, bxcInstance, bxcSaleInstance, bxcTeamVestingInstance, initialBalances } = await deployer.deploy(web3, accounts, saleStart));
	});
});
