pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./BancorFormula.sol";

/**
 * @title TCRFactory
 * @dev Factory and repository for creating universal continuous Token Curated Registries staked with ERC20 tokens
 */
contract TCRFactory is StandardToken, BancorFormula, Ownable {

  struct tcr {
    bytes32 content; // content from UI
    uint32 reserveRatio; // reserve ratio, represented in ppm, 1-1000000
    uint256 poolBalance;
    uint256 totalSharesSupply;
    address ERC20token; 
    mapping(address => uint) balances;
  }

  event LogMint(bytes32 hashId, uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(bytes32 hashId, uint256 amountWithdrawn, uint256 reward);
  event LogBondingCurve(bytes32 hashId, string logString, uint256 value);

  bytes32 tcrHash;
  mapping(bytes32 => tcr) tcrs; // maps a hash - the ID of the tcr (see _gethashId)

  /**
   * @dev default function
   * gas ~ 
   */
  function createTCR (bytes32 content, uint32 ratio, address erc20) public payable {
    require(erc20 != address(0), "Can't send to address zero - accidential burn ?");
    tcrHash = _gethashId(content, ratio, erc20);
    tcrs[tcrHash] = tcr({content:content, reserveRatio:ratio, poolBalance:0, totalSharesSupply:0, ERC20token:erc20});
  }

  /**
   * @dev default function
   * gas ~ 91645
   */
  function() public payable {
    revert("Contract can't receive ETH. Use the Buy function.");
  }

  /**
   * @dev Buy tokens for the TCR with hashId
   * gas ~ 77825
   * TODO implement maxAmount that helps prevent miner front-running
   */
  function buy(bytes32 hashId) public payable returns(bool) {
    require(msg.value > 0, "expected non-zero msg.value");

    tcr storage buyFromTcr = tcrs[hashId];

    uint256 tokensToMint = calculatePurchaseReturn(buyFromTcr.totalSharesSupply, buyFromTcr.poolBalance, buyFromTcr.reserveRatio, msg.value);
    buyFromTcr.totalSharesSupply = buyFromTcr.totalSharesSupply.add(tokensToMint);
    
    buyFromTcr.balances[msg.sender] = buyFromTcr.balances[msg.sender].add(tokensToMint);
    buyFromTcr.poolBalance = buyFromTcr.poolBalance.add(msg.value);
    emit LogMint(hashId, tokensToMint, msg.value);
    return true;
  }

  /**
   * @dev Sell tokens
   * gas ~ 
   * @param sellAmount Amount of tokens to withdraw
   * TODO implement maxAmount that helps prevent miner front-running
   */
  function sell(bytes32 hashId, uint256 sellAmount) public returns(bool) {
    tcr storage sellToTcr = tcrs[hashId];
    require(sellAmount > 0 && sellToTcr.balances[msg.sender] >= sellAmount, "sell amount exceded balance");
    uint256 ethAmount = calculateSaleReturn(sellToTcr.totalSharesSupply, sellToTcr.poolBalance, sellToTcr.reserveRatio, sellAmount);
    msg.sender.transfer(ethAmount);
    sellToTcr.poolBalance = sellToTcr.poolBalance.sub(ethAmount);
    sellToTcr.balances[msg.sender] = sellToTcr.balances[msg.sender].sub(sellAmount);
    sellToTcr.totalSharesSupply = sellToTcr.totalSharesSupply.sub(sellAmount);
    emit LogWithdraw(hashId, sellAmount, ethAmount);
    return true;
  }

  /**
    @dev Create a hash from content, reserveRatio and the ERC20 token address
  */
  function _gethashId(bytes32 hashId, uint32 reserveRatio, address ERC20token) internal returns (bytes32 hash) {
    // FIXME
  }

  event LogMint(uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
  event LogBondingCurve(string logString, uint256 value);
}

