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

const getRound = async (number) => {
	var result = await bxcSaleInstance.getRound.call(number);

	var round = {};
	round.number = number;
	round.startingTimestamp = result[0];
	round.endingTimestamp = result[1];
	round.totalTokenSold = result[2];
	round.pricePerToken = result[3];

	return round;
};	

const getCurrentRound = async () => {
	var round = await bxcSaleInstance.getCurrentRound.call();
	return await getRound(round);
};	


contract('BXCSale' , (accounts) => {
	beforeEach(async () => {
		// saleStart
		saleStart = new BigNumber(await TimeHelper.getBlockTime() + 60);

		// deploy contracts
		({ network, owner, bxcInstance, bxcSaleInstance, bxcTeamVestingInstance, initialBalances } = await deployer.deploy(web3, accounts, saleStart));

		// mint some tokens
		bxcInstance.mint(owner, 10000E18, {from: owner});
	});

	// it('should return rounds' , async () => {
	// 	var account = accounts[11];

	// 	var ethToUsd = 100;
	// 	var usdToEth = 1E18 / ethToUsd;

	// 	var pricePerToken = await bxcSaleInstance.pricePerToken.call();

	// 	var round = await getRound(0);
	// 	round.number.should.be.bignumber.equal(0);
	// 	round.startingTimestamp.should.be.bignumber.equal(saleStart);
	// 	round.endingTimestamp.should.be.bignumber.equal(saleStart.add((day * 10) - 1));
	// 	round.totalTokenSold.should.be.bignumber.equal(0);
	// 	round.pricePerToken.should.be.bignumber.equal(pricePerToken.sub(pricePerToken.mul(200).div(1000)));

	// 	var round = await getRound(1);
	// 	round.number.should.be.bignumber.equal(1);
	// 	round.startingTimestamp.should.be.bignumber.equal(saleStart.add(day * 10));
	// 	round.endingTimestamp.should.be.bignumber.equal(saleStart.add((day * 20) - 1));
	// 	round.totalTokenSold.should.be.bignumber.equal(0);
	// 	round.pricePerToken.should.be.bignumber.equal(pricePerToken.sub(pricePerToken.mul(150).div(1000)));

	// 	var round = await getRound(2);
	// 	round.number.should.be.bignumber.equal(2);
	// 	round.startingTimestamp.should.be.bignumber.equal(saleStart.add(day * 20));
	// 	round.endingTimestamp.should.be.bignumber.equal(saleStart.add((day * 30) - 1));
	// 	round.totalTokenSold.should.be.bignumber.equal(0);
	// 	round.pricePerToken.should.be.bignumber.equal(pricePerToken.sub(pricePerToken.mul(100).div(1000)));

	// 	var round = await getRound(3);
	// 	round.number.should.be.bignumber.equal(3);
	// 	round.startingTimestamp.should.be.bignumber.equal(saleStart.add(day * 30));
	// 	round.endingTimestamp.should.be.bignumber.equal(saleStart.add((day * 40) - 1));
	// 	round.totalTokenSold.should.be.bignumber.equal(0);
	// 	round.pricePerToken.should.be.bignumber.equal(pricePerToken.sub(pricePerToken.mul(50).div(1000)));

	// 	var round = await getRound(4);
	// 	round.number.should.be.bignumber.equal(4);
	// 	round.startingTimestamp.should.be.bignumber.equal(saleStart.add(day * 40));
	// 	round.endingTimestamp.should.be.bignumber.equal(saleStart.add((day * 50) - 1));
	// 	round.totalTokenSold.should.be.bignumber.equal(0);
	// 	round.pricePerToken.should.be.bignumber.equal(pricePerToken.sub(pricePerToken.mul(25).div(1000)));

	// 	var round = await getRound(5);
	// 	round.number.should.be.bignumber.equal(5);
	// 	round.startingTimestamp.should.be.bignumber.equal(saleStart.add(day * 50));
	// 	round.endingTimestamp.should.be.bignumber.equal(saleStart.add((day * 60) - 1));
	// 	round.totalTokenSold.should.be.bignumber.equal(0);
	// 	round.pricePerToken.should.be.bignumber.equal(pricePerToken);
	// });	

	// it('should return current round' , async () => {
	// 	var account = accounts[11];
	// 	var round0 = await getRound(0);
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);

	// 	var pricePerToken = await bxcSaleInstance.pricePerToken.call();

	// 	var round = await getRound(0);
	// 	round.number.should.be.bignumber.equal(0);
	// 	round.startingTimestamp.should.be.bignumber.equal(saleStart);
	// 	round.endingTimestamp.should.be.bignumber.equal(saleStart.add((day * 10) - 1));
	// 	round.totalTokenSold.should.be.bignumber.equal(0);
	// 	round.pricePerToken.should.be.bignumber.equal(pricePerToken.sub(pricePerToken.mul(200).div(1000)));
	// });

	// it('should buy tokens from sale contract' , async () => {
	// 	var account = accounts[11];
	// 	var round0 = await getRound(0);
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);

	// 	var tokens = 100E18;
	// 	var amount = round0.pricePerToken.mul(tokens).div(1E18);

	// 	var balanceBefore = await bxcInstance.balanceOf.call(account);
	// 	await bxcSaleInstance.buy(account , {from: account, value: amount});
	// 	var balanceAfter = await bxcInstance.balanceOf.call(account);
		
	// 	balanceBefore.should.be.bignumber.equal(balanceAfter.sub(tokens));
	// });	

	// it('should buy tokens from fallback address' , async () => {
	// 	var account = accounts[11];
	// 	var round0 = await getRound(0);
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);

	// 	var pricePerToken = await bxcSaleInstance.pricePerToken.call();

	// 	var tokens = 100E18;
	// 	var amount = round0.pricePerToken.mul(tokens).div(1E18);

	// 	var balanceBefore = await bxcInstance.balanceOf.call(account);
	// 	await bxcSaleInstance.sendTransaction({from: account , value: amount});
	// 	var balanceAfter = await bxcInstance.balanceOf.call(account);
		
	// 	balanceBefore.should.be.bignumber.equal(balanceAfter.sub(tokens));
	// });	

	// it('should transfer token from owner to account address' , async () => {
	// 	var account = accounts[6];
	// 	var round0 = await getRound(0);
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
		
	// 	var balanceBefore = await bxcInstance.balanceOf.call(account);
	// 	await bxcInstance.transfer(account , 1000E18 , {from: owner});
	// 	var balanceAfter = await bxcInstance.balanceOf.call(account);

	// 	balanceAfter.should.be.bignumber.equal(balanceBefore.add(1000E18));
	// });	

	// it('should transfer token from owner to contract address' , async () => {
	// 	var contract = bxcSaleInstance.address;
	// 	var round0 = await getRound(0);
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
		
	// 	var balanceBefore = await bxcInstance.balanceOf.call(contract);
	// 	await bxcInstance.transfer(contract , 1000E18 , {from: owner});
	// 	var balanceAfter = await bxcInstance.balanceOf.call(contract);

	// 	balanceAfter.should.be.bignumber.equal(balanceBefore.add(1000E18));
	// });	

	// it('should refund left token upon closure' , async () => {
	// 	var account = accounts[11];
	// 	var round0 = await getRound(0);
		
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
	// 	await bxcSaleInstance.sendTransaction({from: account , value: 15E18});

	// 	var saleBalanceBefore = await bxcInstance.balanceOf(bxcSaleInstance.address);
	// 	var ownerBalanceBefore = await bxcInstance.balanceOf(owner);

	// 	await bxcSaleInstance.close({from: owner});		

	// 	var saleBalanceAfter = await bxcInstance.balanceOf(bxcSaleInstance.address);
	// 	var ownerBalanceAfter = await bxcInstance.balanceOf(owner);

	// 	saleBalanceBefore.should.be.bignumber.gt(0);
	// 	saleBalanceAfter.should.be.bignumber.equal(0);
	// 	ownerBalanceAfter.should.be.bignumber.equal(ownerBalanceBefore.add(saleBalanceBefore));		
	// });	

	// it('should close sale contract' , async () => {
	// 	var saleBalanceBefore = await bxcInstance.balanceOf(bxcSaleInstance.address);
	// 	var ownerBalanceBefore = await bxcInstance.balanceOf(owner);

	// 	await bxcSaleInstance.close({from: owner});		

	// 	var saleBalanceAfter = await bxcInstance.balanceOf(bxcSaleInstance.address);
	// 	var ownerBalanceAfter = await bxcInstance.balanceOf(owner);

	// 	saleBalanceBefore.should.be.bignumber.gt(0);
	// 	saleBalanceAfter.should.be.bignumber.equal(0);
	// 	ownerBalanceAfter.should.be.bignumber.equal(ownerBalanceBefore.add(saleBalanceBefore));		
	// });	

	// it('should allow owner to change wallet address' , async () => {
	// 	var walletBefore = await bxcSaleInstance.wallet.call();
		
	// 	await bxcSaleInstance.setWallet(accounts[10] , {from: owner});
	// 	var walletAfter = await bxcSaleInstance.wallet.call();		
	// 	assert.equal(walletAfter, accounts[10], 'wallet address should be changed');				

	// 	await bxcSaleInstance.setWallet(walletBefore , {from: owner});
	// 	var walletRestore = await bxcSaleInstance.wallet.call();		
	// 	assert.equal(walletRestore, walletBefore, 'wallet address should be restored');				
	// });

	// it('should allow owner to withdraw' , async () => {
	// 	var round0 = await getRound(0);
	// 	var wallet = await bxcSaleInstance.wallet.call();

	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
	// 	await bxcSaleInstance.sendTransaction({from: owner , value: 2E18});
		
	// 	var walletBalanceBefore = await Utils.getBalance(wallet);
	// 	var saleBalanceBefore = await Utils.getBalance(bxcSaleInstance.address);
		
	// 	saleBalanceBefore.should.be.bignumber.equal(2E18);

	// 	await bxcSaleInstance.withdraw({from: owner});

	// 	var walletBalanceAfter = await Utils.getBalance(wallet);
	// 	var saleBalanceAfter = await Utils.getBalance(bxcSaleInstance.address);

	// 	saleBalanceAfter.should.be.bignumber.equal(0);
	// 	walletBalanceAfter.should.be.bignumber.equal(walletBalanceBefore.add(saleBalanceBefore));
	// });

	// it('should be able to buy in phases', async () => {
	// 	var account1 = accounts[10];

	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var saleBalance = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	maxTokenForSale.should.be.bignumber.equal(saleBalance);

		
	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.equal(0);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account1);
			
	// 	var token0 = new BigNumber(1000E18);
	// 	var price0 = round0.pricePerToken.mul(token0).div(1E18);
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: price0});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account1);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(token0));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(token0);

		
		
	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.equal(0);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account1);
		
	// 	var token1 = new BigNumber(1000E18);		
	// 	var price1 = round1.pricePerToken.mul(token1).div(1E18);	
	// 	await TimeHelper.setBlockTime(round1.startingTimestamp);
	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: price1});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account1);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(token0));
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1));

	// 	acctBalanceBefore.should.be.bignumber.equal(token0);
	// 	acctBalanceAfter.should.be.bignumber.equal(token0.add(token1));

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.equal(token0);

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.equal(token1);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1));



	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.equal(0);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1));

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account1);
		
	// 	var token2 = new BigNumber(1000E18);		
	// 	var price2 = round2.pricePerToken.mul(token2).div(1E18);	
	// 	await TimeHelper.setBlockTime(round2.startingTimestamp);
	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: price2});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account1);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1));
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1).sub(token2));

	// 	acctBalanceBefore.should.be.bignumber.equal(token0.add(token1));
	// 	acctBalanceAfter.should.be.bignumber.equal(token0.add(token1).add(token2));

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.equal(token0);

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.equal(token1);

	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.equal(token2);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1).add(token2));



	// 	var round3 = await getRound(3);
	// 	round3.totalTokenSold.should.be.bignumber.equal(0);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1).add(token2));

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account1);
		
	// 	var token3 = new BigNumber(1000E18);		
	// 	var price3 = round3.pricePerToken.mul(token3).div(1E18);	
	// 	await TimeHelper.setBlockTime(round3.startingTimestamp);
	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: price3});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account1);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1).sub(token2));
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1).sub(token2).sub(token3));

	// 	acctBalanceBefore.should.be.bignumber.equal(token0.add(token1).add(token2));
	// 	acctBalanceAfter.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3));

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.equal(token0);

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.equal(token1);

	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.equal(token2);

	// 	var round3 = await getRound(3);
	// 	round3.totalTokenSold.should.be.bignumber.equal(token3);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3));



	// 	var round4 = await getRound(4);
	// 	round4.totalTokenSold.should.be.bignumber.equal(0);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3));

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account1);
		
	// 	var token4 = new BigNumber(1000E18);		
	// 	var price4 = round4.pricePerToken.mul(token4).div(1E18);	
	// 	await TimeHelper.setBlockTime(round4.startingTimestamp);
	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: price4});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account1);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1).sub(token2).sub(token3));
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1).sub(token2).sub(token3).sub(token4));

	// 	acctBalanceBefore.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3));
	// 	acctBalanceAfter.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3).add(token4));

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.equal(token0);

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.equal(token1);

	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.equal(token2);

	// 	var round3 = await getRound(3);
	// 	round3.totalTokenSold.should.be.bignumber.equal(token3);

	// 	var round4 = await getRound(4);
	// 	round4.totalTokenSold.should.be.bignumber.equal(token4);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3).add(token4));



	// 	var round5 = await getRound(5);
	// 	round5.totalTokenSold.should.be.bignumber.equal(0);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3).add(token4));

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account1);
		
	// 	var token5 = new BigNumber(1000E18);		
	// 	var price5 = round5.pricePerToken.mul(token5).div(1E18);	
	// 	await TimeHelper.setBlockTime(round5.startingTimestamp);
	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: price5});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account1);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1).sub(token2).sub(token3).sub(token4));
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(token0).sub(token1).sub(token2).sub(token3).sub(token4).sub(token5));

	// 	acctBalanceBefore.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3).add(token4));
	// 	acctBalanceAfter.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3).add(token4).add(token5));

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.equal(token0);

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.equal(token1);

	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.equal(token2);

	// 	var round3 = await getRound(3);
	// 	round3.totalTokenSold.should.be.bignumber.equal(token3);

	// 	var round4 = await getRound(4);
	// 	round4.totalTokenSold.should.be.bignumber.equal(token4);

	// 	var round5 = await getRound(5);
	// 	round5.totalTokenSold.should.be.bignumber.equal(token5);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.equal(token0.add(token1).add(token2).add(token3).add(token4).add(token5));

	// 	await Utils.assertRevert(getRound(6));		
	// });

	// it('should be able to buy all tokens in round 0', async () => {
	// 	var account = accounts[10];
	// 	var round = await getRound(0);
		
	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.mul(round.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);

	// 	var round = await getRound(0);
	// 	round.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
		
	// 	var round = await getRound(0);
	// 	round.totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
	// });

	// it('should be able to buy all tokens in round 1', async () => {
	// 	var account = accounts[10];
	// 	var round = await getRound(1);
		
	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.mul(round.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);
		
	// 	var round = await getRound(1);
	// 	round.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale);

	// 	var round = await getRound(1);
	// 	round.totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
	// });

	// it('should be able to buy all tokens in round 2', async () => {
	// 	var account = accounts[10];
	// 	var round = await getRound(2);
		
	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.mul(round.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);
		
	// 	var round = await getRound(2);
	// 	round.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale);

	// 	var round = await getRound(2);
	// 	round.totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
	// });

	// it('should be able to buy all tokens in round 3', async () => {
	// 	var account = accounts[10];
	// 	var round = await getRound(3);
		
	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.mul(round.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);
		
	// 	var round = await getRound(3);
	// 	round.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale);

	// 	var round = await getRound(3);
	// 	round.totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
	// });

	// it('should be able to buy all tokens in round 4', async () => {
	// 	var account = accounts[10];
	// 	var round = await getRound(4);
		
	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.mul(round.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);
		
	// 	var round = await getRound(4);
	// 	round.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale);

	// 	var round = await getRound(4);
	// 	round.totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
	// });

	// it('should be able to buy all tokens in round 5', async () => {
	// 	var account = accounts[10];
	// 	var round = await getRound(5);
		
	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.mul(round.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);
		
	// 	var round = await getRound(5);
	// 	round.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale);

	// 	var round = await getRound(5);
	// 	round.totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
	// });

	// it('should not be able to buy all tokens in round 6', async () => {
	// 	var account = accounts[10];
	// 	var round = await getRound(5);
		
	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.mul(round.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);
		
	// 	var round = await getRound(5);
	// 	round.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round.endingTimestamp.add(100));
	// 	await Utils.assertRevert(bxcSaleInstance.buy(account, {from: account , value: price}));

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(0);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);

	// 	var round = await getRound(5);
	// 	round.totalTokenSold.should.be.bignumber.eq(0);
	// });

	// it('should be able to buy all tokens in round 0 and 1', async () => {
	// 	var account = accounts[10];
	// 	var round0 = await getRound(0);

	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.div(2).mul(round0.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(0);

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale.div(2)));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale.div(2));

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(2));
		
	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(2));

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);

	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.div(2).mul(round1.pricePerToken).div(1E18);
		
	// 	await TimeHelper.setBlockTime(round1.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale.div(2)));
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale));

	// 	acctBalanceBefore.should.be.bignumber.equal(maxTokenForSale.div(2));
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
		
	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(2));

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(2));
	// });

	// it('should be able to buy all tokens in round 0 and 1 and 2', async () => {
	// 	var account = accounts[10];
	// 	var round0 = await getRound(0);

	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.div(4).mul(round0.pricePerToken).div(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(0);

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.eq(0);

	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale.div(4)));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale.div(4));

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(4));
		
	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(4));

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.eq(0);

	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);

	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.div(4).mul(round1.pricePerToken).div(1E18);
		
	// 	await TimeHelper.setBlockTime(round1.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale.div(4)));
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale.div(2)));

	// 	acctBalanceBefore.should.be.bignumber.equal(maxTokenForSale.div(4));
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale.div(2));

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(2));
		
	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(4));

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(4));

	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.eq(0);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);

	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var price = maxTokenForSale.div(2).mul(round2.pricePerToken).div(1E18);
		
	// 	await TimeHelper.setBlockTime(round2.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: price});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale.div(2)));
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(maxTokenForSale));

	// 	acctBalanceBefore.should.be.bignumber.equal(maxTokenForSale.div(2));
	// 	acctBalanceAfter.should.be.bignumber.equal(maxTokenForSale);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(maxTokenForSale);
		
	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(4));

	// 	var round1 = await getRound(1);
	// 	round1.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(4));

	// 	var round2 = await getRound(2);
	// 	round2.totalTokenSold.should.be.bignumber.eq(maxTokenForSale.div(2));
	// });

	// it('should be able to reach softcap', async () => {
	// 	var account = accounts[10];
	// 	var round0 = await getRound(0);

	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var softCapEth = await bxcSaleInstance.softCapEth.call();
	// 	var softCapTok = softCapEth.div(round0.pricePerToken).mul(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(0);

	// 	var isSoftCapReached = await bxcSaleInstance.isSoftCapReached.call();
	// 	isSoftCapReached.should.be.equal(false);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: softCapEth});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(softCapTok));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(softCapTok);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(softCapTok);
		
	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(softCapTok);

	// 	var isSoftCapReached = await bxcSaleInstance.isSoftCapReached.call();
	// 	isSoftCapReached.should.be.equal(true);
	// });

	// it('should be able to reach hardcap', async () => {
	// 	var account = accounts[10];
	// 	var round0 = await getRound(0);

	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
	// 	var hardCapEth = await bxcSaleInstance.hardCapEth.call();
	// 	var hardCapTok = hardCapEth.div(round0.pricePerToken).mul(1E18);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(0);

	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(0);

	// 	var isSoftCapReached = await bxcSaleInstance.isSoftCapReached.call();
	// 	isSoftCapReached.should.be.equal(false);

	// 	var isHardCapReached = await bxcSaleInstance.isHardCapReached.call();
	// 	isHardCapReached.should.be.equal(false);

	// 	var saleBalanceBefore = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceBefore = await bxcInstance.balanceOf.call(account);
		
	// 	await TimeHelper.setBlockTime(round0.startingTimestamp);
	// 	await bxcSaleInstance.buy(account, {from: account , value: hardCapEth});

	// 	var saleBalanceAfter = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
	// 	var acctBalanceAfter = await bxcInstance.balanceOf.call(account);

	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(hardCapTok));

	// 	acctBalanceBefore.should.be.bignumber.equal(0);
	// 	acctBalanceAfter.should.be.bignumber.equal(hardCapTok);

	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
	// 	totalTokenSold.should.be.bignumber.eq(hardCapTok);
		
	// 	var round0 = await getRound(0);
	// 	round0.totalTokenSold.should.be.bignumber.eq(hardCapTok);

	// 	var isSoftCapReached = await bxcSaleInstance.isSoftCapReached.call();
	// 	isSoftCapReached.should.be.equal(true);

	// 	var isHardCapReached = await bxcSaleInstance.isHardCapReached.call();
	// 	isHardCapReached.should.be.equal(true);
	// });
});
