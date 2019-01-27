pragma solidity ^0.4.18;

import "openzeppelin-solidity/contracts/token/ERC20/TokenVesting.sol";
import "./BXC.sol";


/**
* @title BXCTeamVesting
* @dev This is Token Vesting contract.
*/
contract BXCTeamVesting is TokenVesting {

	/**
	* @dev Creates a vesting contract that vests its balance of any ERC20 token to the
	* _beneficiary, gradually in a linear fashion until _start + _duration. By then all
	* of the balance will have vested.
	* @param _beneficiary address of the beneficiary to whom vested tokens are transferred
  */
  constructor(address _beneficiary) 
  TokenVesting(_beneficiary, 1554681600, 365 * 24 * 60 * 60, 4 * 365 * 24 * 60 * 60, true) public { }
}