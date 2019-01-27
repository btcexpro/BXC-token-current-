pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

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

