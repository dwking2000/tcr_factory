pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./BancorFormula.sol";
/**

 * @title TcrFactory
 * @dev Factory and repository for creating universal continuous Token Curated Registries staked with ERC20 tokens
 */
contract TcrFactory is BancorFormula, Ownable {

  struct tcr {
    bytes content; // content from UI
    uint32 reserveRatio; // reserve ratio, represented in ppm, 1-1000000
    uint256 poolBalance;
    uint256 totalSharesSupply;
    address ERC20token; 
    mapping(address => uint) balances;
  }

  event LogMint(bytes32 hashId, uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(bytes32 hashId, uint256 amountWithdrawn, uint256 reward);
  event LogBondingCurve(bytes32 hashId, string logString, uint256 value);
  event TcrCreated(bytes32 hashId, bytes content, uint32 ratio, address erc20, uint32 startingBalance);

  bytes32 tcrHash;
  mapping(bytes32 => tcr) public tcrs; // maps a hash - the ID of the tcr (see getHashId)

  /**
   * @dev default function
   * gas ~ 
   */
  function createTCR (bytes content, uint32 ratio, address erc20, uint32 startingBalance) public {
    require(erc20 != address(0), "Can't send to address zero - accidential burn ?");
    tcrHash = getHashId(content, ratio, erc20);
    tcrs[tcrHash] = tcr({content:content, reserveRatio:ratio, poolBalance:0, totalSharesSupply:0, ERC20token:erc20});
    if(startingBalance > 0){
      buy(tcrHash, startingBalance);
    }
    emit TcrCreated(tcrHash, content, ratio, erc20, startingBalance);
  }

  /**
   * @dev default function
   * gas ~ 91645
   */
  function() public payable {
    // revert("Contract can't receive ETH. Use the Buy function.");
    // FIXME - revert might be killing everything when transferring erc20
  }

  /**
   * @dev Buy tokens for the TCR with hashId
   * gas ~ 77825
   * TODO implement maxAmount that helps prevent miner front-running
   */
  function buy(bytes32 hashId, uint256 ercBuyAmount) public returns(bool) {
    require(ercBuyAmount > 0, "expected non-zero value");

    tcr storage buyFromTcr = tcrs[hashId];

    address erc20 = buyFromTcr.ERC20token;
    require(erc20.call("transferFrom", erc20, msg.sender, address(this), ercBuyAmount));

    uint256 tokensToMint = calculatePurchaseReturn(buyFromTcr.totalSharesSupply, buyFromTcr.poolBalance, buyFromTcr.reserveRatio, ercBuyAmount);
    buyFromTcr.totalSharesSupply = buyFromTcr.totalSharesSupply.add(tokensToMint);
    
    buyFromTcr.balances[msg.sender] = buyFromTcr.balances[msg.sender].add(tokensToMint);
    buyFromTcr.poolBalance = buyFromTcr.poolBalance.add(ercBuyAmount);
    emit LogMint(hashId, tokensToMint, ercBuyAmount);
    return true;
  }

  /**
   * @dev Sell tokens
   * gas ~ 
   * @param sellSharesAmount Amount of tokens to withdraw
   * TODO implement maxAmount that helps prevent miner front-running
   */
  function sell(bytes32 hashId, uint256 sellSharesAmount) public returns(bool) {

    tcr storage sellToTcr = tcrs[hashId];
    require(sellSharesAmount > 0 && sellToTcr.balances[msg.sender] >= sellSharesAmount, "sell amount exceded balance");

    uint256 erc20Amount = calculateSaleReturn(sellToTcr.totalSharesSupply, sellToTcr.poolBalance, sellToTcr.reserveRatio, sellSharesAmount);
    address erc20 = sellToTcr.ERC20token;
    require(erc20.call("transferFrom", erc20, address(this), msg.sender, erc20Amount));

    sellToTcr.poolBalance = sellToTcr.poolBalance.sub(erc20Amount);
    sellToTcr.balances[msg.sender] = sellToTcr.balances[msg.sender].sub(sellSharesAmount);
    sellToTcr.totalSharesSupply = sellToTcr.totalSharesSupply.sub(sellSharesAmount);
    emit LogWithdraw(hashId, sellSharesAmount, erc20Amount);
    return true;
  }

  /**
    @dev Create a hash from content, reserveRatio and the ERC20 token address
  */
  function getHashId(bytes content, uint32 reserveRatio, address ERC20token) public pure returns (bytes32 hash) {
    return keccak256(abi.encodePacked(content, reserveRatio, ERC20token));
  }

  /**
    @dev Create a hash from content, reserveRatio and the ERC20 token address
  */
  function getContent(bytes32 hashId) public view returns (bytes content) {
    return tcrs[hashId].content;
  }

}

