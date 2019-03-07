pragma solidity ^0.4.24;

// File: openzeppelin-solidity/contracts/math/SafeMath.sol

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }
}

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

// File: openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * See https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
  function totalSupply() public view returns (uint256);
  function balanceOf(address _who) public view returns (uint256);
  function transfer(address _to, uint256 _value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

// File: openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol

/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances.
 */
contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) internal balances;

  uint256 internal totalSupply_;

  /**
  * @dev Total number of tokens in existence
  */
  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }

  /**
  * @dev Transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_value <= balances[msg.sender]);
    require(_to != address(0));

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256) {
    return balances[_owner];
  }

}

// File: openzeppelin-solidity/contracts/token/ERC20/ERC20.sol

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address _owner, address _spender)
    public view returns (uint256);

  function transferFrom(address _from, address _to, uint256 _value)
    public returns (bool);

  function approve(address _spender, uint256 _value) public returns (bool);
  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}

// File: openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol

/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * https://github.com/ethereum/EIPs/issues/20
 * Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, BasicToken {

  mapping (address => mapping (address => uint256)) internal allowed;


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    returns (bool)
  {
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);
    require(_to != address(0));

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(
    address _owner,
    address _spender
   )
    public
    view
    returns (uint256)
  {
    return allowed[_owner][_spender];
  }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
  function increaseApproval(
    address _spender,
    uint256 _addedValue
  )
    public
    returns (bool)
  {
    allowed[msg.sender][_spender] = (
      allowed[msg.sender][_spender].add(_addedValue));
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.
   */
  function decreaseApproval(
    address _spender,
    uint256 _subtractedValue
  )
    public
    returns (bool)
  {
    uint256 oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue >= oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

}

// File: openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol

/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */
contract MintableToken is StandardToken, Ownable {
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  bool public mintingFinished = false;


  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  modifier hasMintPermission() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(
    address _to,
    uint256 _amount
  )
    public
    hasMintPermission
    canMint
    returns (bool)
  {
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() public onlyOwner canMint returns (bool) {
    mintingFinished = true;
    emit MintFinished();
    return true;
  }
}

// File: contracts/BXC.sol

/**
 * @title BXC
 * @dev ERC20 Token, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer`
 */
contract BXC is MintableToken {

	string public constant name = "BtcEX Coin";
	string public constant symbol = "BXC";
	uint public constant decimals = 18;

	/**
	 * @dev Constructor that gives msg.sender all of existing tokens.
	 */
	constructor() public {
		
	}


	/**
	* @dev if ether is sent to this address, send it back.
	*/
	function () public {
		revert();
	}
}

// File: contracts/BXCSale.sol

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
	bool public isSaleExtended = false;
		
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

	// dispatch event if usd to eth is changed
	event EthToUsdChange(uint ethToUsd);

	struct RoundStruct {
		uint number;
		uint startingTimestamp;
		uint endingTimestamp;
		uint totalTokenSold;
		uint pricePerToken;
		bool isRound;
	}

	RoundStruct[7] public rounds;

	// usd to eth
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
		rounds[6] = RoundStruct(6, saleStart + (day * 60), 	saleStart + (day * 90) - 1, 0, pricePerToken, false);
	}

	/**
	* @dev Throws if called by any account other than the owner.
	*/
	modifier onlyExecutor() {
		require(msg.sender == owner || msg.sender == executor);
		_;
	}

	/**
	* @dev set eth to usd
	* set ether to usd pricing
	*/	
	function setEthToUsd(uint _ethToUsd) onlyOwner public {
		// usd to eth
		ethToUsd = _ethToUsd;
		usdToEth = 1E18 / ethToUsd;
		
		// hard cap in usd - 100%
		hardCapEth = usdToEth * hardCapUsd;

		// soft cap in usd - 80%
		softCapEth = usdToEth * softCapUsd;

		// setup price units
		pricePerToken = 25 * usdToEth / 100;

		// set price for each round
		rounds[0].pricePerToken = pricePerToken - (pricePerToken * 200 / 1000);
		rounds[1].pricePerToken = pricePerToken - (pricePerToken * 150 / 1000);
		rounds[2].pricePerToken = pricePerToken - (pricePerToken * 100 / 1000);
		rounds[3].pricePerToken = pricePerToken - (pricePerToken *  50 / 1000);
		rounds[4].pricePerToken = pricePerToken - (pricePerToken *  25 / 1000);
		rounds[5].pricePerToken = pricePerToken;
		rounds[6].pricePerToken = pricePerToken;

		// log event for price change
		emit EthToUsdChange(ethToUsd);
	}

	/**
	* @dev extend sale 
	* This will extend the sale if end of sale is reached and softcap is reached
	*/	
	function extendSale() onlyOwner public {
		require(isSoftCapReached() && !isSaleExtended);

		// mark the flag to indicate closure of the contract
		isSaleExtended = true;

		// enable round
		rounds[6].isRound = true;

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
