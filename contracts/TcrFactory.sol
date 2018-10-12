pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./BancorFormula.sol";
import "./FakeDai.sol";
/**
 * @title TcrFactory
 * @dev Factory and repository for creating universal continuous Token Curated Registries staked with ERC20 tokens
 */
contract TcrFactory is BancorFormula, Ownable {

  event LogMint(bytes32 hashId, uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(bytes32 hashId, uint256 amountWithdrawn, uint256 reward);
  event LogBondingCurve(bytes32 hashId, string logString, uint256 value);
  event TcrCreated(bytes32 hashId, string content, uint32 ratio, address erc20, uint32 startingBalance);

  struct tcr {
    string content; // content from UI
    uint32 reserveRatio; // reserve ratio, represented in ppm, 1-1000000
    uint256 poolBalance;
    uint256 totalSharesSupply;
    address ERC20token;
    mapping(address => uint) balances; //TODO: is this needed, do we need individual amounts? Perhaps this mapping should be on it's own, not in the struct.
  }

  bytes32 tcrHash;
  bytes helloMsg; //TODO: remove me

  // TCR mappings
  // maps a hash - the key of the tcr (see getHashId)
  mapping(bytes32 => tcr) public tcrs;
  bytes32[] public tcrKeys;

  /**
   * @dev default function
   * gas ~
   */
  function createTCR (string content, uint32 ratio, address erc20, uint32 startingBalance) public {
    require(erc20 != address(0), "Can't send to address zero - accidential burn ?");
    tcrHash = getHashId(content, ratio, erc20);
    tcrs[tcrHash] = tcr({content:content, reserveRatio:ratio, poolBalance:0, totalSharesSupply:0, ERC20token:erc20});
    // tcrKeys.add(tcrHash);
    tcrKeys.push(tcrHash); //TODO: we should probably just store it on IPFS.
    emit TcrCreated(tcrHash, content, ratio, erc20, startingBalance);

    if(startingBalance > 0){
      buy(tcrHash, startingBalance);
    }
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
    //const mTransferFrom = "transferFrom";
   require(ERC20(erc20).transferFrom(msg.sender, address(this), ercBuyAmount)," buy() erc20 transferFrom failed");

/*
  contract OtherContract {
      function otherMethod(address _to, uint _price);
  }

  contract MyContract {
      uint public unitPrice = 100;

      function myMethod(address _destination, uint _count) {
          // _destination is a contract that implements OtherContract
          OtherContract oc = OtherContract(_destination);
          // call method from other contract
          oc.otherMethod(address(this), _count * unitPrice);
      }
  }
*/

   uint256 tokensToMint = calculatePurchaseReturn(0, 0, 500000, ercBuyAmount);
    //buyFromTcr.totalSharesSupply = buyFromTcr.totalSharesSupply.add(tokensToMint);

    //buyFromTcr.balances[msg.sender] = buyFromTcr.balances[msg.sender].add(tokensToMint);
    //buyFromTcr.poolBalance = buyFromTcr.poolBalance.add(ercBuyAmount);
    //emit LogMint(hashId, tokensToMint, ercBuyAmount);
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
  function getHashId(string content, uint32 reserveRatio, address ERC20token) public pure returns (bytes32 hash) {
    return keccak256(abi.encodePacked(content, reserveRatio, ERC20token));
  }

  /**
    @dev Create a hash from content, reserveRatio and the ERC20 token address
  */
  function getContent(bytes32 hashId) public view returns (string content) {
    //TODO: should we convert it here?
    return tcrs[hashId].content;
  }

  function getKeys() public view returns (bytes32[]) {
    return tcrKeys;
  }

  function getTcrCount() public view returns(uint tcrCount) {
    return tcrKeys.length;
  }

  function hello (bytes m) public {
    helloMsg = m;
  }
}
