// 'use strict';
// const deployer = require('../utils/deployer.js');
// const { BN, constants, expectEvent, shouldFail, ether } = require('openzeppelin-test-helpers');

// const Utils = require('./helpers/utils');
// const TimeHelper = require('./helpers/timeHelper');

// var appInstance;
// var bxcInstance;
// var bxcSaleInstance;
// var bxcTeamVestingInstance;

// var network, owner, wallet;
// var initialBalances;

// var day = 86400; 
// var month = day * 30;
// var year = day * 365;

// var saleStart;

// const getRound = async (number) => {
// 	var result = await bxcSaleInstance.getRound.call(number);

// 	var round = {};
// 	round.number = number;
// 	round.startingTimestamp = result[0];
// 	round.endingTimestamp = result[1];
// 	round.totalTokenSold = result[2];
// 	round.pricePerToken = result[3];

// 	return round;
// };	

// const getCurrentRound = async () => {
// 	var round = await bxcSaleInstance.getCurrentRound.call();
// 	return await getRound(round);
// };	


// contract('BXCSale' , (accounts) => {
// 	beforeEach(async () => {
// 		// saleStart
// 		saleStart = await TimeHelper.getBlockTime();
// 		console.log(saleStart);

// 		// deploy contracts
// 		({ network, owner, bxcInstance, bxcSaleInstance, bxcTeamVestingInstance, initialBalances } = await deployer.deploy(web3, accounts, saleStart));
// 	});

// 	it('should return rounds' , async () => {
// 		var account = accounts[11];

// 		var ethToUsd = 100;
// 		var usdToEth = 1E18 / ethToUsd;

// 		var pricePerToken = 25 * usdToEth;

// 		var round = await getRound(new BN(0));
// 		round.number.should.be.bignumber.equal(new BN(0));
// 		round.startingTimestamp.should.be.bignumber.equal(saleStart);
// 		round.endingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 10 - 1)));
// 		round.totalTokenSold.should.be.bignumber.equal(new BN(0));
// 		round.pricePerToken.should.be.bignumber.equal((pricePerToken - (pricePerToken * 200 / 1000)).toString());

// 		var round = await getRound(new BN(1));
// 		round.number.should.be.bignumber.equal(new BN(1));
// 		round.startingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 10)));
// 		round.endingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 20 - 1)));
// 		round.totalTokenSold.should.be.bignumber.equal(new BN(0));
// 		round.pricePerToken.should.be.bignumber.equal((pricePerToken - (pricePerToken * 150 / 1000)).toString());

// 		var round = await getRound(new BN(2));
// 		round.number.should.be.bignumber.equal(new BN(2));
// 		round.startingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 20)));
// 		round.endingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 30 - 1)));
// 		round.totalTokenSold.should.be.bignumber.equal(new BN(0));
// 		round.pricePerToken.should.be.bignumber.equal((pricePerToken - (pricePerToken * 100 / 1000)).toString());

// 		var round = await getRound(new BN(3));
// 		round.number.should.be.bignumber.equal(new BN(3));
// 		round.startingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 30)));
// 		round.endingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 40 - 1)));
// 		round.totalTokenSold.should.be.bignumber.equal(new BN(0));
// 		round.pricePerToken.should.be.bignumber.equal((pricePerToken - (pricePerToken *  50 / 1000)).toString());

// 		var round = await getRound(new BN(4));
// 		round.number.should.be.bignumber.equal(new BN(4));
// 		round.startingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 40)));
// 		round.endingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 50 - 1)));
// 		round.totalTokenSold.should.be.bignumber.equal(new BN(0));
// 		round.pricePerToken.should.be.bignumber.equal((pricePerToken - (pricePerToken *  25 / 1000)).toString());

// 		var round = await getRound(new BN(5));
// 		round.number.should.be.bignumber.equal(new BN(5));
// 		round.startingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 50)));
// 		round.endingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 60 - 1)));
// 		round.totalTokenSold.should.be.bignumber.equal(new BN(0));
// 		round.pricePerToken.should.be.bignumber.equal((pricePerToken).toString());
// 	});	

// 	it('should return current round' , async () => {
// 		var account = accounts[11];
// 		var round1 = await getRound(0);
// 		// await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});

// 		var ethToUsd = 100;
// 		var usdToEth = 1E18 / ethToUsd;

// 		var round = await getCurrentRound();
// 		round.number.should.be.bignumber.equal(new BN(0));
// 		round.startingTimestamp.should.be.bignumber.equal(saleStart);
// 		round.endingTimestamp.should.be.bignumber.equal(saleStart.add(new BN(day * 10 - 1)));
// 		round.totalTokenSold.should.be.bignumber.equal(new BN(0));
// 		round.pricePerToken.should.be.bignumber.equal((pricePerToken - (pricePerToken * 200 / 1000)).toString());
// 	});


// 	// it('should buy tokens from sale contract' , async () => {
// 	// 	var account = accounts[11];
// 	// 	var round1 = await getRound(0);
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});

// 	// 	var tokens = 100E18;
// 	// 	var amount = round1.pricePerToken.mul(tokens).div(1E18);

// 	// 	var balanceBefore = await s4feInstance.balanceOf.call(account);
// 	// 	await bxcSaleInstance.buy(account , {from: account, value: amount});
// 	// 	var balanceAfter = await s4feInstance.balanceOf.call(account);
		
// 	// 	balanceBefore.should.be.bignumber.equal(balanceAfter.sub(tokens));
// 	// });	

// 	// it('should buy tokens from fallback address' , async () => {
// 	// 	var account = accounts[11];
// 	// 	var round1 = await getRound(0);
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});

// 	// 	var tokens = 100E18;
// 	// 	var amount = round1.pricePerToken.mul(tokens).div(1E18);

// 	// 	var balanceBefore = await s4feInstance.balanceOf.call(account);
// 	// 	await bxcSaleInstance.sendTransaction({from: account , value: amount});
// 	// 	var balanceAfter = await s4feInstance.balanceOf.call(account);
		
// 	// 	balanceBefore.should.be.bignumber.equal(balanceAfter.sub(tokens));
// 	// });	

// 	// it('should transfer token from owner to account address' , async () => {
// 	// 	var account = accounts[6];
// 	// 	var round1 = await getRound(0);
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});
		
// 	// 	var balanceBefore = await s4feInstance.balanceOf.call(account);
// 	// 	await s4feInstance.transfer(account , 1000E18 , {from: owner});
// 	// 	var balanceAfter = await s4feInstance.balanceOf.call(account);

// 	// 	balanceAfter.should.be.bignumber.equal(balanceBefore.add(1000E18));
// 	// });	

// 	// it('should transfer token from owner to contract address' , async () => {
// 	// 	var contract = bxcSaleInstance.address;
// 	// 	var round1 = await getRound(0);
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});
		
// 	// 	var balanceBefore = await s4feInstance.balanceOf.call(contract);
// 	// 	await s4feInstance.transfer(contract , 1000E18 , {from: owner});
// 	// 	var balanceAfter = await s4feInstance.balanceOf.call(contract);

// 	// 	balanceAfter.should.be.bignumber.equal(balanceBefore.add(1000E18));
// 	// });	

// 	// it('should refund left token upon closure' , async () => {
// 	// 	var account = accounts[11];
// 	// 	var round1 = await getRound(0);
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});
// 	// 	await bxcSaleInstance.sendTransaction({from: account , value: 15E18});

// 	// 	var saleBalanceBefore = await s4feInstance.balanceOf(bxcSaleInstance.address);
// 	// 	var ownerBalanceBefore = await s4feInstance.balanceOf(owner);

// 	// 	await bxcSaleInstance.close({from: owner});		

// 	// 	var saleBalanceAfter = await s4feInstance.balanceOf(bxcSaleInstance.address);
// 	// 	var ownerBalanceAfter = await s4feInstance.balanceOf(owner);

// 	// 	saleBalanceAfter.should.be.bignumber.equal(0);
// 	// 	ownerBalanceAfter.should.be.bignumber.equal(ownerBalanceBefore.add(saleBalanceBefore));		
// 	// });	

// 	// it('should close sale contract' , async () => {
// 	// 	var saleBalanceBefore = await s4feInstance.balanceOf(bxcSaleInstance.address);
// 	// 	var ownerBalanceBefore = await s4feInstance.balanceOf(owner);

// 	// 	await bxcSaleInstance.close({from: owner});		

// 	// 	var saleBalanceAfter = await s4feInstance.balanceOf(bxcSaleInstance.address);
// 	// 	var ownerBalanceAfter = await s4feInstance.balanceOf(owner);

// 	// 	saleBalanceAfter.should.be.bignumber.equal(0);
// 	// 	ownerBalanceAfter.should.be.bignumber.equal(ownerBalanceBefore.add(saleBalanceBefore));		
// 	// });	

// 	// it('should allow owner to change wallet address' , async () => {
// 	// 	var walletBefore = await bxcSaleInstance.wallet.call();
		
// 	// 	await bxcSaleInstance.setWallet(owner , {from: owner});
// 	// 	var walletAfter = await bxcSaleInstance.wallet.call();		
// 	// 	assert.equal(walletAfter, owner, 'wallet address should be changed');				

// 	// 	await bxcSaleInstance.setWallet(walletBefore , {from: owner});
// 	// 	var walletRestore = await bxcSaleInstance.wallet.call();		
// 	// 	assert.equal(walletRestore, walletBefore, 'wallet address should be restored');				
// 	// });

// 	// it('should allow owner to withdraw' , async () => {
// 	// 	var round1 = await getRound(0);
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});
// 	// 	await bxcSaleInstance.sendTransaction({from: owner , value: 2E18});

// 	// 	var walletBalanceBefore = await getBalance(wallet);
// 	// 	var saleBalanceBefore = await getBalance(bxcSaleInstance.address);
		
// 	// 	saleBalanceBefore.should.be.bignumber.equal(2E18);

// 	// 	await bxcSaleInstance.withdraw({from: owner});

// 	// 	var walletBalanceAfter = await getBalance(wallet);
// 	// 	var saleBalanceAfter = await getBalance(bxcSaleInstance.address);

// 	// 	saleBalanceAfter.should.be.bignumber.equal(0);
// 	// 	walletBalanceAfter.should.be.bignumber.equal(walletBalanceBefore.add(saleBalanceBefore));
// 	// });

// 	// it('should be able to buy in phases', async () => {
// 	// 	var account1 = accounts[10];

// 	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();

// 	// 	var round1 = await getRound(0);
// 	// 	round1.totalTokenSold.should.be.bignumber.equal(0);

// 	// 	var round2 = await getRound(1);
// 	// 	round2.totalTokenSold.should.be.bignumber.equal(0);

// 	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
// 	// 	totalTokenSold.should.be.bignumber.equal(0);

// 	// 	var saleBalanceBefore = await s4feInstance.balanceOf.call(bxcSaleInstance.address);
// 	// 	var acctBalanceBefore = await s4feInstance.balanceOf.call(account1);
			
// 	// 	var token1 = new BigNumber(1000E18);
// 	// 	var price1 = round1.pricePerToken.mul(token1).div(1E18);
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});
// 	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: price1});

// 	// 	var saleBalanceAfter = await s4feInstance.balanceOf.call(bxcSaleInstance.address);
// 	// 	var acctBalanceAfter = await s4feInstance.balanceOf.call(account1);

// 	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
// 	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(token1));

// 	// 	acctBalanceBefore.should.be.bignumber.equal(0);
// 	// 	acctBalanceAfter.should.be.bignumber.equal(token1);

// 	// 	var round1 = await getRound(0);
// 	// 	round1.totalTokenSold.should.be.bignumber.equal(token1);

// 	// 	var round2 = await getRound(1);
// 	// 	round2.totalTokenSold.should.be.bignumber.equal(0);

// 	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
// 	// 	totalTokenSold.should.be.bignumber.equal(token1);
		


// 	// 	var saleBalanceBefore = await s4feInstance.balanceOf.call(bxcSaleInstance.address);
// 	// 	var acctBalanceBefore = await s4feInstance.balanceOf.call(account1);
		
// 	// 	var token2 = new BigNumber(1000E18);		
// 	// 	var price2 = round2.pricePerToken.mul(token2).div(1E18);	
// 	// 	await bxcSaleInstance.setBlockTime(round2.startingTimestamp, {from: owner});
// 	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: price2});

// 	// 	var saleBalanceAfter = await s4feInstance.balanceOf.call(bxcSaleInstance.address);
// 	// 	var acctBalanceAfter = await s4feInstance.balanceOf.call(account1);

// 	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(token1));
// 	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(token1).sub(token2));

// 	// 	acctBalanceBefore.should.be.bignumber.equal(token1);
// 	// 	acctBalanceAfter.should.be.bignumber.equal(token1.add(token2));

// 	// 	var round1 = await getRound(0);
// 	// 	round1.totalTokenSold.should.be.bignumber.equal(token1);

// 	// 	var round2 = await getRound(1);
// 	// 	round2.totalTokenSold.should.be.bignumber.equal(token2);

// 	// 	var totalTokenSold = await bxcSaleInstance.totalTokenSold.call();
// 	// 	totalTokenSold.should.be.bignumber.equal(token1.add(token2));
// 	// });

// 	// it('should be able to buy all tokens', async () => {
// 	// 	var account1 = accounts[10];

// 	// 	var round1 = await getRound(0);
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});
// 	// 	var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();

// 	// 	var round1 = await getRound(0);
// 	// 	var round1Price = round1.maxTokenForSale.mul(round1.pricePerToken).div(1E18);

// 	// 	var round2 = await getRound(1);
// 	// 	var round2Price = round2.maxTokenForSale.mul(round2.pricePerToken).div(1E18);

		
// 	// 	var saleBalanceBefore = await s4feInstance.balanceOf.call(bxcSaleInstance.address);
// 	// 	var acctBalanceBefore = await s4feInstance.balanceOf.call(account1);
		
// 	// 	await bxcSaleInstance.setBlockTime(round1.startingTimestamp, {from: owner});
// 	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: round1Price});

// 	// 	var saleBalanceAfter = await s4feInstance.balanceOf.call(bxcSaleInstance.address);
// 	// 	var acctBalanceAfter = await s4feInstance.balanceOf.call(account1);

// 	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale);
// 	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(round1.maxTokenForSale));

// 	// 	acctBalanceBefore.should.be.bignumber.equal(0);
// 	// 	acctBalanceAfter.should.be.bignumber.equal(round1.maxTokenForSale);


// 	// 	var saleBalanceBefore = await s4feInstance.balanceOf.call(bxcSaleInstance.address);
// 	// 	var acctBalanceBefore = await s4feInstance.balanceOf.call(account1);
		
// 	// 	await bxcSaleInstance.setBlockTime(round2.startingTimestamp, {from: owner});
// 	// 	await bxcSaleInstance.buy(account1 , {from: account1 , value: round2Price});

// 	// 	var saleBalanceAfter = await s4feInstance.balanceOf.call(bxcSaleInstance.address);
// 	// 	var acctBalanceAfter = await s4feInstance.balanceOf.call(account1);

// 	// 	saleBalanceBefore.should.be.bignumber.equal(maxTokenForSale.sub(round1.maxTokenForSale));
// 	// 	saleBalanceAfter.should.be.bignumber.equal(maxTokenForSale.sub(round1.maxTokenForSale).sub(round2.maxTokenForSale));

// 	// 	acctBalanceBefore.should.be.bignumber.equal(round1.maxTokenForSale);
// 	// 	acctBalanceAfter.should.be.bignumber.equal(round1.maxTokenForSale.add(round2.maxTokenForSale));
// 	// });
// });
