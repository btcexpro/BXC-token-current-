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

var day = 60 * 60 * 24;
var month = day * 30;
var year = day * 365;

var saleStart;

contract('BXC' , (accounts) => {
	beforeEach(async () => {
		// saleStart
		saleStart = new BigNumber(await TimeHelper.getBlockTime());

		// deploy contracts
		({ network, owner, bxcInstance, bxcSaleInstance, bxcTeamVestingInstance, initialBalances } = await deployer.deploy(web3, accounts, saleStart));
	});

	/* TOKEN CONTRACT */

	it('token : should match owner' , async () => {
		var owner_ = await bxcInstance.owner.call();
		owner_.should.be.equal(owner);
	});

	it('token : should match name' , async () => {
		var name = await bxcInstance.name.call();
		name.should.be.equal('BtcEX Coin');
	});

	it('token : should match symbol' , async () => {
		var symbol = await bxcInstance.symbol.call();
		symbol.should.be.equal('BXC');
	});

	it('token : should match decimals' , async () => {
		var decimals = await bxcInstance.decimals.call();
		decimals.should.be.bignumber.equal(18);
	});

	it('token : should match totalSupply' , async () => {
		var totalSupply = await bxcInstance.totalSupply.call();
		totalSupply.should.be.bignumber.equal(50000000E18);
	});

	it('token : should be able to mint tokens' , async () => {
		var totalSupply = await bxcInstance.totalSupply.call();

		var balanceBefore = await bxcInstance.balanceOf.call(owner);
		var amount = 1E18;
		await bxcInstance.mint(owner, amount, {from: owner});

		var balance = await bxcInstance.balanceOf.call(owner);
		balance.should.be.bignumber.equal(balanceBefore.add(amount));
	});	

	it('token : should be able to transfer tokens' , async () => {
		var account = accounts[4];
		var amount = 1E18;

		var balanceOwner = await bxcInstance.balanceOf.call(owner);
		
		var balance = await bxcInstance.balanceOf.call(owner);
		balance.should.be.bignumber.equal(balanceOwner);

		await bxcInstance.mint(owner, amount, {from: owner});

		var balance = await bxcInstance.balanceOf.call(owner);
		balance.should.be.bignumber.equal(balanceOwner.add(amount));

		var balance = await bxcInstance.balanceOf.call(account);
		balance.should.be.bignumber.equal(0);		

		await bxcInstance.transfer(account, amount, {from: owner});

		var balance = await bxcInstance.balanceOf.call(account);
		balance.should.be.bignumber.equal(amount);		

		var balance = await bxcInstance.balanceOf.call(owner);
		balance.should.be.bignumber.equal(balanceOwner);		
	});		

	it('token : sale should have full balance' , async () => {
		var balance = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
		var maxTokenForSale = await bxcSaleInstance.maxTokenForSale.call();
		balance.should.be.bignumber.equal(maxTokenForSale);
	});

	it('token : should match sale token address' , async () => {
		var token = await bxcSaleInstance.token.call();
		token.should.be.equal(bxcInstance.address);
	});

	it('token : should throw an error when trying to transfer more than balance', async () => {
		var balance = await bxcInstance.balanceOf.call(owner);
		await Utils.assertRevert(bxcInstance.transfer(accounts[10], balance.add(1E18), {from: owner}));
	});

	it('token : should have an owner', async () => {
		owner = await bxcInstance.owner();
		owner.should.not.equal(0);
	});

	it('token : should change ownership', async () => {
		var originalOwner = await bxcInstance.owner.call();
		await bxcInstance.transferOwnership(accounts[10], {from: originalOwner})
		
		var newOwner = await bxcInstance.owner.call();
		newOwner.should.be.equal(accounts[10]);
	});

	it('token : should transfer tokens from sale contract manually' , async () => {
		var account = accounts[10];
		var unit = 1E18;

		var balanceBeforeSender = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
		var balanceBeforeReceiver = await bxcInstance.balanceOf.call(account);

		await bxcSaleInstance.transferManual(account , unit , {from: owner});

		var balanceAfterSender = await bxcInstance.balanceOf.call(bxcSaleInstance.address);
		var balanceAfterReceiver = await bxcInstance.balanceOf.call(account);		

		balanceBeforeSender.should.be.bignumber.equal(balanceAfterSender.add(unit));
		balanceBeforeReceiver.should.be.bignumber.equal(balanceAfterReceiver.sub(unit));
	});
});
