pragma solidity ^0.4.18;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./BXC.sol";


/**
* @title BXCSale
* @dev This is ICO Contract. 
* This class accepts the token address as argument to talk with contract.
* Once contract is deployed, funds are transferred to ICO smart contract address and then distributed to investors.
* Sending funds to this ensures that no more than desired tokens are sold.
*/
contract BXCSale is Ownable {
	using SafeMath for uint;

	// token
	BXC public token;

	// sale start date 
	uint public saleStart;

	// amount of token to be sold on sale
	uint public maxTokenForSale;

	// price per token
	uint public pricePerToken;

	// amount of token sold so far
	uint public totalTokenSold;

	// amount of ether raised in sale
	uint public totalEtherRaised;

	// token sold per wallet
	mapping(address => uint) public tokenSoldPerWallet;

	// ether raised per wallet
	mapping(address => uint) public etherRaisedPerWallet;

	// executor which execute manual transaction
	address public executor;

	// walle which will receive the ether funding
	address public wallet;

	// is contract close and ended
	bool public isClose = false;

	// is contract paused
	bool public isPaused = false;

	// is sale extended
	bool public isSaleExtended = true;
		
	// executor changed
	event ExecutorChange(address _executor, uint _timestamp);
		
	// wallet changed
	event WalletChange(address _wallet, uint _timestamp);

	// status changed
	event PausedChange(bool _isPaused, uint _timestamp);

	// token purchsae event
	event TokenPurchase(address indexed _purchaser, address indexed _beneficiary, uint _value, uint _amount, uint _timestamp, uint _round);

	// manual transfer by admin for external purchase
	event TransferManual(address indexed _from, address indexed _to, uint _value);

	// dispatch event if sale is extended
	event SaleExtend();

	struct RoundStruct {
		uint number;
		uint startingTimestamp;
		uint endingTimestamp;
		uint totalTokenSold;
		uint pricePerToken;
		bool isRound;
	}

	RoundStruct[7] public rounds;

	// cnt to eth
	uint public ethToUsd = 100;
	uint public usdToEth = 1E18 / ethToUsd;
	
	// hard cap in usd - 100%
	uint public hardCapUsd = 1000000;
	uint public hardCapEth = usdToEth * hardCapUsd;

	// soft cap in usd - 80%
	uint public softCapUsd = 800000;
	uint public softCapEth = usdToEth * softCapUsd;

	/**
	* @dev Constructor that initializes contract
	*/
	constructor(address _token, address _wallet, address _executor, uint _saleStart) public {
		// set token
		token = BXC(_token);

		// set wallet
		wallet = _wallet;

		// set executor
		executor = _executor;

		// set max token for sale
		maxTokenForSale = 30000000E18;
		
		// setup price units
		pricePerToken = 25 * usdToEth / 100;

		// live round
		saleStart = _saleStart;
		uint day = 86400; 

		rounds[0] = RoundStruct(0, saleStart, 				saleStart + (day * 10) - 1, 0, pricePerToken - (pricePerToken * 200 / 1000), true);
		rounds[1] = RoundStruct(1, saleStart + (day * 10), 	saleStart + (day * 20) - 1, 0, pricePerToken - (pricePerToken * 150 / 1000), true);
		rounds[2] = RoundStruct(2, saleStart + (day * 20), 	saleStart + (day * 30) - 1, 0, pricePerToken - (pricePerToken * 100 / 1000), true);
		rounds[3] = RoundStruct(3, saleStart + (day * 30), 	saleStart + (day * 40) - 1, 0, pricePerToken - (pricePerToken *  50 / 1000), true);
		rounds[4] = RoundStruct(4, saleStart + (day * 40), 	saleStart + (day * 50) - 1, 0, pricePerToken - (pricePerToken *  25 / 1000), true);
		rounds[5] = RoundStruct(5, saleStart + (day * 50), 	saleStart + (day * 60) - 1, 0, pricePerToken, true);
	}

	/**
	* @dev Throws if called by any account other than the owner.
	*/
	modifier onlyExecutor() {
		require(msg.sender == owner || msg.sender == executor);
		_;
	}

	/**
	* @dev extend sale 
	* This will extend the sale if end of sale is reached and softcap is reached
	*/	
	function extendSale() onlyOwner public {
		require(isSoftCapReached() && !isSaleExtended);

		// mark the flag to indicate closure of the contract
		isSaleExtended = true;

		uint day = 86400; 
		rounds[6] = RoundStruct(6, saleStart + (day * 60), 	saleStart + (day * 90) - 1, 0, pricePerToken, true);

		// log event for sale extend
		emit SaleExtend();
	}

	/**
	 * @dev Function that validates if the purchase is valid by verifying the parameters
	 *
	 * @param round Current round index
	 * @param value Amount of ethers sent
	 * @param amount Total number of tokens user is trying to buy.
	 *
	 * @return checks various conditions and returns the bool result indicating validity.
	 */
	function validate(uint round, uint value, uint amount) public constant returns (bool) {
		// check if timestamp is falling in the range
		bool validTimestamp = rounds[round].startingTimestamp <= block.timestamp && block.timestamp <= rounds[round].endingTimestamp;

		// check if value of the ether is valid
		bool validValue = 1E17 <= value && value <= 1000 ether;

		// check if the tokens available in contract for sale
		bool validAmount = maxTokenForSale.sub(totalTokenSold) >= amount && amount > 0;

		// validate if all conditions are met
		return rounds[round].isRound && validTimestamp && validValue && validAmount && !isClose && !isPaused;
	}

	/**
	 * @dev Function that returns the round by number
	 *
	 * @return returns the round properties
	 */
	function getRound(uint _number) public constant returns (uint _startingTimestamp, uint _endingTimestamp, uint _totalTokenSold, uint _pricePerToken, bool _isRound) {
		_startingTimestamp = rounds[_number].startingTimestamp;
		_endingTimestamp = rounds[_number].endingTimestamp;
		_totalTokenSold = rounds[_number].totalTokenSold;
		_pricePerToken = rounds[_number].pricePerToken;
		_isRound = rounds[_number].isRound;
	}

	/**
	 * @dev Function that returns the current round
	 *
	 * @return checks various conditions and returns the current round.
	 */
	function getCurrentRound() public constant returns (uint) {
		for(uint i = 0 ; i < rounds.length ; i ++) {
			if(rounds[i].startingTimestamp <= block.timestamp && block.timestamp <= rounds[i].endingTimestamp && rounds[i].isRound) {
				return i;
			}
		}
		revert();
	}

	/**
	 * @dev Function that calculates the tokens which should be given to user by iterating over rounds
	 *
	 * @param value Amount of ethers sent
	 *
	 * @return checks various conditions and returns the token amount.
	 */
	function calculate(uint value) public constant returns (uint , uint) {
		// fetch current round
		uint round = getCurrentRound();
		
		// find tokens left in current round.
		uint tokensLeft = maxTokenForSale.sub(totalTokenSold);

		// derive tokens can be bought in current round with round pricePerToken 
		uint tokensBuys = value.mul(1E18).div(rounds[round].pricePerToken);

		// if tokens left > tokens buy 
		if(tokensLeft >= tokensBuys) {
			return (tokensBuys , 0);
		} else {
			uint tokensLeftValue = tokensLeft.mul(rounds[round].pricePerToken).div(1E18);
			return (tokensLeft , value.sub(tokensLeftValue));
		}
	}
	
	/**
	 * @dev Default fallback method which will be called when any ethers are sent to contract
	 */
	function() public payable {
		buy(msg.sender);
	}

	/**
	 * @dev Function that is called either externally or by default payable method
	 *
	 * @param beneficiary who should receive tokens
	 */
	function buy(address beneficiary) public payable {
		require(beneficiary != address(0));

		// value sent by buyer
		uint value = msg.value;

		// get current round by passing queue value also 
		uint round = getCurrentRound();

		// calculate token amount from the ethers sent
		uint amount; uint leftValue;
		(amount, leftValue) = calculate(value);

		// validate the purchase
		require(validate(round, value , amount));

		// if there is any left value then return 
		if(leftValue > 0) {
			value = value.sub(leftValue);
			msg.sender.transfer(leftValue);
		}
		
		// update the state to log the sold tokens and raised ethers.
		totalTokenSold = totalTokenSold.add(amount);
		rounds[round].totalTokenSold = rounds[round].totalTokenSold.add(amount);

		// update the state of ether raised
		totalEtherRaised = totalEtherRaised.add(value);
		etherRaisedPerWallet[msg.sender] = etherRaisedPerWallet[msg.sender].add(value);
		tokenSoldPerWallet[msg.sender] = tokenSoldPerWallet[msg.sender].add(amount);

		// transfer tokens from contract balance to beneficiary account.
		token.transfer(beneficiary, amount);
		
		// log event for token purchase
		emit TokenPurchase(msg.sender, beneficiary, value, amount, now, round);
	}

	/**
	* @dev purchase token for a specified address. 
	* This is owner only method and should be called using web3.js if someone is trying to buy token using bitcoin or any other altcoin.
	* 
	* @param beneficiary The address to transmit to.
	* @param amount The amount to be transferred.
	*/
	function purchase(address beneficiary, uint amount) onlyExecutor public returns (bool) {
		require(beneficiary != address(0));

		// get current round by passing queue value also 
		uint round = getCurrentRound();

		// validate the purchase. dummy value 1 passed to avoid check of amount
		require(validate(round, 1 ether , amount));

		// update global variables
		totalTokenSold = totalTokenSold.add(amount);
		rounds[round].totalTokenSold = rounds[round].totalTokenSold.add(amount);

		// update the state of token sold
		tokenSoldPerWallet[beneficiary] = tokenSoldPerWallet[beneficiary].add(amount);

		// transfer tokens manually from contract balance
		token.transfer(beneficiary , amount);
		emit TokenPurchase(beneficiary, beneficiary, 0, amount, now, round);
			
		return true;
	}

	/**
	* @dev transmit token for a specified address. 
	* This is owner only method and should be called using web3.js if someone is trying to buy token using bitcoin or any other altcoin.
	* 
	* @param beneficiary The address to transmit to.
	* @param amount The amount to be transferred.
	*/
	function transferManual(address beneficiary, uint amount) onlyOwner public returns (bool) {
		require(beneficiary != address(0));

		// transfer tokens manually from contract balance
		token.transfer(beneficiary , amount);
		emit TransferManual(msg.sender, beneficiary, amount);

		// update global variables
		totalTokenSold = totalTokenSold.add(amount);

		// update the state of token sold
		tokenSoldPerWallet[beneficiary] = tokenSoldPerWallet[beneficiary].add(amount);
		return true;
	}

	/**
	* @dev Method called by owner to change the executor address
	*/
	function setExecutor(address _executor) onlyOwner public {
		executor = _executor;
		emit ExecutorChange(_executor , now);
	}

	/**
	* @dev Method called by owner to change the wallet address
	*/
	function setWallet(address _wallet) onlyOwner public {
		wallet = _wallet;
		emit WalletChange(_wallet , now);
	}

	/**
	* @dev Method called by owner of contract to withdraw funds
	*/
	function withdraw() onlyOwner public {
		// transfer funds to wallet
		wallet.transfer(address(this).balance);
	}

	/**
	* @dev close contract 
	* This will send remaining token balance to owner
	* This will distribute available funds across team members
	*/	
	function close() onlyOwner public {
		// send remaining tokens back to owner.
		uint tokens = token.balanceOf(this); 
		token.transfer(owner , tokens);

		// withdraw funds 
		withdraw();

		// mark the flag to indicate closure of the contract
		isClose = true;
	}

	/**
	* @dev pause contract 
	* This will mark contract as paused
	*/	
	function pause() onlyOwner public {
		// mark the flag to indicate pause of the contract
		isPaused = true;
		emit PausedChange(isPaused , now);
	}

	/**
	* @dev resume contract 
	* This will mark contract as resumed
	*/	
	function resume() onlyOwner public {
		// mark the flag to indicate resume of the contract
		isPaused = false;
		emit PausedChange(isPaused , now);
	}

	/**
	* @dev checks if sale ended
	*/	
	function isSaleEnded() public view returns (bool) {
		uint endingTimestamp = rounds[rounds.length - 1].isRound ? rounds[rounds.length - 1].endingTimestamp : rounds[rounds.length - 2].endingTimestamp;
		return block.timestamp > endingTimestamp;
    }

	/**
	* @dev checks if soft cap is reached
	*/	
	function isSoftCapReached() public view returns (bool) {
        return totalEtherRaised >= softCapEth;
    }

    /**
	* @dev checks if hard cap is reached
	*/	
	function isHardCapReached() public view returns (bool) {
        return totalEtherRaised >= hardCapEth;
    }
}