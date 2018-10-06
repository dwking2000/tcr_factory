pragma solidity ^0.4.18;

import "./BondingCurve.sol";

/**
 * @title TCRFactory
 * @dev Factory and repository for creating universal continuous Token Curated Registries staked with ERC20 tokens
 */
contract TCRFactory is BondingCurve {

  struct tcr {
    bytes[] content; // content from UI
    uint32 reserveRatio; // reserve ratio, represented in ppm, 1-1000000
    address ERC20token;    
    mapping(address => uint) balances;
  }

  mapping(uint256 => tcr) tcrs; // maps a hash (see _getHash) to tcr

  /**
   * @dev default function
   * gas ~ 
   */
  function createTCR (bytes[] content, uint32 ratio, address erc20) public payable {
    require(erc20 != address(0)); // FIXME check syntax
    // TODO sanity check ratio
    tcrs[_getHashID(content, reserveRatio, ERC20token)] = tcr({content, reserveRatio, ERC20token});
  }

  // FIXME - Are default functions inherited by default?
  // Do we want to do this?
  /**
   * @dev default function
   * gas ~ 
   */
  function() public payable {
    throw; // FIXME
  }

  /**
   * @dev Buy tokens
   * gas ~ 
   * TODO implement maxAmount that helps prevent miner front-running
   */
  function buy(uint256 hashID) validGasPrice public payable returns(bool) {
    // do something
    // update balances in tcr
    return super.buy();
  }

  /**
   * @dev Sell tokens
   * gas ~ 
   * @param sellAmount Amount of tokens to withdraw
   * TODO implement maxAmount that helps prevent miner front-running
   */
  function sell(uint256 hashID, uint256 sellAmount) validGasPrice public returns(bool) {
    // do something
    // update balances in tcr
    return super.sell(); 
  }

  /**
    @dev Create a hash from content, reserveRatio and the ERC20 token address
    @param 
  */
  function _getHashID(bytes[] content, uint32 reserveRatio, address ERC20token) private internal returns (uint256 hash) {
    // FIXME
  }

  event LogMint(uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
  event LogBondingCurve(string logString, uint256 value);
}

