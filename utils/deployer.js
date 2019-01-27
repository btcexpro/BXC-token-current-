'use strict';
global.artifacts = artifacts;
const nconf = require('nconf')
const csvtojson = require('csvtojson')

var BigNumber;
async function setWeb3(web3) {
	BigNumber = web3.BigNumber;
	BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN });
}

async function validate(network, owner) {

}	

async function deploy(web3, accounts, saleStart) {
	const network = 'test';
	nconf.file({ file: `./config/config-${network}.json` });
	
	await setWeb3(web3)
	const owner = nconf.get("owner")

	const bxcInstance = await deployBXC(network)
	const bxcSaleInstance = await deployBXCSale(network, bxcInstance, saleStart)
	const bxcTeamVestingInstance = await deployBXCTeamVesting(network, bxcInstance)

	await mintTokens(network, bxcInstance, owner)
	var initialBalances = await getInitialBalances(network, bxcInstance, bxcSaleInstance, bxcTeamVestingInstance)	

	console.log("<< Deploy : Ready >>")

	return {
		network,
		owner,
		bxcInstance,
		bxcSaleInstance,
		bxcTeamVestingInstance,
		initialBalances
	}
}

async function deployBXC(network) {
	console.log("<< Deploy : Start : BXC >>")
		
	nconf.file({ file: `./config/config-${network}.json` });
	const owner = nconf.get("owner");
		
	const BXC = artifacts.require("BXC");
	const bxc = await BXC.new({from: owner})
	const bxcInstance = await BXC.at(bxc.address)
	await bxcInstance.mint(owner, 0, {from: owner})

	console.log("\t", 'BXC' , bxc.address)
	console.log("\t", 'BXC Owner' , owner , await bxcInstance.owner({from: owner}))
	console.log("\t", 'Total Supply' , new BigNumber(await bxcInstance.totalSupply.call()).div(1E18).toFixed(18))

	console.log("<< Deploy : Ready : BXC >>")
	return bxcInstance
}

async function deployBXCSale(network, bxcInstance, saleStart) {
	console.log("<< Deploy : Start : BXCSale >>")
	
	nconf.file({ file: `./config/config-${network}.json` });
	const owner = nconf.get("owner");
	const wallet = nconf.get("wallet");
	const executor = nconf.get("executor");

	const BXCSale = artifacts.require("BXCSale");
	const bxcSale = await BXCSale.new(bxcInstance.address, wallet, executor, saleStart, {from: owner})
	const bxcSaleInstance = await BXCSale.at(bxcSale.address)

	await bxcInstance.mint(bxcSaleInstance.address, new BigNumber(30000000E18).toFixed(), {from: owner});

	console.log("\t", 'BXCSale' , bxcSale.address)
	console.log("\t", 'BXCSale Owner' , owner , await bxcSaleInstance.owner({from: owner}))
	console.log("\t", 'BXCSale Balance' , new BigNumber(await bxcInstance.balanceOf.call(bxcSaleInstance.address)).div(1E18).toFixed(18))

	console.log("<< Deploy : Ready : BXCSale >>")
	return bxcSaleInstance
}

async function deployBXCTeamVesting(network, bxcInstance) {
	console.log("<< Deploy : Start : BXCTeamVesting >>")
	
	nconf.file({ file: `./config/config-${network}.json` });
	const owner = nconf.get("owner");
	const team = nconf.get("team");

	const BXCTeamVesting = artifacts.require("BXCTeamVesting");
	const bxcTeamVesting = await BXCTeamVesting.new(team, {from: owner})
	const bxcTeamVestingInstance = await BXCTeamVesting.at(bxcTeamVesting.address)

	await bxcInstance.mint(bxcTeamVestingInstance.address, new BigNumber(6000000E18).toFixed(), {from: owner});

	console.log("\t", 'BXCTeamVesting' , bxcTeamVesting.address)
	console.log("\t", 'BXCTeamVesting Owner' , owner , await bxcTeamVestingInstance.owner({from: owner}))
	console.log("\t", 'BXCTeamVesting Balance' , new BigNumber(await bxcInstance.balanceOf.call(bxcTeamVestingInstance.address)).div(1E18).toFixed(18))

	console.log("<< Deploy : Ready : BXCTeamVesting >>")
	return bxcTeamVestingInstance
}

async function mintTokens(network, bxcInstance, beneficiary) {
	console.log("<< Start : MintTokens >>");
	nconf.file({ file: `./config/config-${network}.json` });
	const owner = nconf.get("owner");	

	const incentive = nconf.get("incentive");
	await bxcInstance.mint(incentive, new BigNumber(12000000E18).toFixed(), {from: owner});

	const advisor = nconf.get("advisor");
	await bxcInstance.mint(advisor, new BigNumber(1000000E18).toFixed(), {from: owner});

	const bounty = nconf.get("bounty");
	await bxcInstance.mint(bounty, new BigNumber(1000000E18).toFixed(), {from: owner});

	let totalSupply = new BigNumber(50000000E18);
	let curntSupply = await bxcInstance.totalSupply.call({from: owner});

	await bxcInstance.mint(beneficiary, totalSupply.minus(curntSupply).toFixed(), {from: owner});

	console.log("<< Ready : MintTokens >>");
}

async function finishMinting(network, bxcInstance) {
	console.log("<< Start : FinishMinting >>");
	nconf.file({ file: `./config/config-${network}.json` });

	const owner = nconf.get("owner");	
	await bxcInstance.finishMinting({from: owner});	

	console.log("<< Ready : FinishMinting >>");
}

async function printContracts(network, bxcInstance, bxcSaleInstance, bxcTeamVestingInstance) {
	console.log("<< Start : Contracts >>");
	nconf.file({ file: `./config/config-${network}.json` });
	
	const owner = nconf.get("owner");	
	const incentive = nconf.get("incentive");
	const advisor = nconf.get("advisor");
	const bounty = nconf.get("bounty");

	console.log('Account Address');
	console.table([{
		"Type": "Owner",
		"Address": owner
	}]);

	console.log('Coin Statistics');
	console.table([{
		"Holder": "Total Supply",
		"Address": "-",
		"Balance": new BigNumber(await bxcInstance.totalSupply.call()).div(1E18).toFixed(18)
	},{
		"Holder": "BXC Sale",
		"Address": bxcSaleInstance.address,
		"Balance": new BigNumber(await bxcInstance.balanceOf.call(bxcSaleInstance.address)).div(1E18).toFixed(18)
	},{
		"Holder": "BXC Team Vesting",
		"Address": bxcTeamVestingInstance.address,
		"Balance": new BigNumber(await bxcInstance.balanceOf.call(bxcTeamVestingInstance.address)).div(1E18).toFixed(18)	
	},{
		"Holder": "Incentive",
		"Address": incentive,
		"Balance": new BigNumber(await bxcInstance.balanceOf.call(incentive)).div(1E18).toFixed(18)
	},{
		"Holder": "Advisor",
		"Address": advisor,
		"Balance": new BigNumber(await bxcInstance.balanceOf.call(advisor)).div(1E18).toFixed(18)
	},{
		"Holder": "Bounty",
		"Address": bounty,
		"Balance": new BigNumber(await bxcInstance.balanceOf.call(bounty)).div(1E18).toFixed(18)
	},{
		"Holder": "Owner",
		"Address": owner,
		"Balance": new BigNumber(await bxcInstance.balanceOf.call(owner)).div(1E18).toFixed(18)
	}]);
	
	console.log('Contract Details');
	console.table([{
		"Contract": "BXC",
		"Address": bxcInstance.address,
		"Owner": await bxcInstance.owner({from: owner})
	},{
		"Contract": "BXCSale",
		"Address": bxcSaleInstance.address,
		"Owner": await bxcSaleInstance.owner({from: owner})
	},{
		"Contract": "BXCTeamVesting",
		"Address": bxcTeamVestingInstance.address,
		"Owner": await bxcTeamVestingInstance.owner({from: owner})	
	}]);

	console.log("<< Ready : Contracts >>");
}

async function getInitialBalances(network, bxcInstance, bxcSaleInstance, bxcTeamVestingInstance) {
	nconf.file({ file: `./config/config-${network}.json` });

	const owner = nconf.get("owner");	
	const incentive = nconf.get("incentive");
	const advisor = nconf.get("advisor");
	const bounty = nconf.get("bounty");

	var balances = {};
	balances.totalSupply = await bxcInstance.totalSupply.call();
	balances.bxcSale = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	balances.bxcTeamVesting = await bxcInstance.balanceOf.call(bxcTeamVestingInstance.address);
	balances.incentive = await bxcInstance.balanceOf.call(incentive);
	balances.advisor = await bxcInstance.balanceOf.call(advisor);
	balances.bounty = await bxcInstance.balanceOf.call(bounty);
	balances.owner = await bxcInstance.balanceOf.call(owner);

	return balances;
}

module.exports.setWeb3 = setWeb3;
module.exports.validate = validate;
module.exports.deploy = deploy;
module.exports.deployBXC = deployBXC;
module.exports.deployBXCSale = deployBXCSale;
module.exports.deployBXCTeamVesting = deployBXCTeamVesting;
module.exports.mintTokens = mintTokens;
module.exports.finishMinting = finishMinting;
module.exports.printContracts = printContracts;
module.exports.getInitialBalances = getInitialBalances;