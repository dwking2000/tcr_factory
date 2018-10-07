pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract FakeDai is MintableToken {
  string public constant name = "Fake DAI";
  string public constant symbol = "DAI";
  uint8 public constant decimals = 18;
  string public constant version = "0.1";

  constructor() public {
    mint(owner, 2000);
  }

}
