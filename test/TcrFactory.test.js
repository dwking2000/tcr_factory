import assertRevert from './helpers/assertRevert';
import expectThrow from './helpers/expectThrow';

//bind ABIs from build artifcts
const TcrFactory = artifacts.require('TcrFactory');
const FakeDai = artifacts.require('FakeDai');
const MintableToken = artifacts.require('MintableToken');

const { ether } = require('./helpers/ether');

const { shouldBehaveLikeMintableToken } = require('zeppelin-solidity/test/token/ERC20/MintableToken.behaviour.js');

const BigNumber = web3.BigNumber;
const value = ether(0.42);
const fakeDaiMinted = 2222;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('TcrFactory', function ([_, account_1, account_2, account_3, account_4]) {

  // Setup - before each test we create new contracts
  beforeEach(async function () {
    this.factory = await TcrFactory.new();
    this.fakeDaiToken = await FakeDai.new({from: account_1 });
  });

  // Deploys contracts
  it("should deploy contracts: TcrFactory and FakeDai", async function () {
    assert(this.factory !== undefined, 'TcrFactory contract should be deployed.');
    assert(this.fakeDaiToken !== undefined, 'FakeDai contract should be deployed.');
  });

  // say hello
  it("should say hello", async function () {
    //await this.factory
    await this.factory.hello("foo");
  });

  // Mints FakeDai
  it("should mint FakeDai to account_1", async function () {
    let result = await this.fakeDaiToken.Mint(this.account_1, fakeDaiMinted);
    let balance = await this.fakeDaiToken.balanceOf(account_1);
    let expectedBalance = 2000*1e18; 
    assert.equal(balance, expectedBalance, `Balance returned ${balance} does not match ${expectedBalance}`);
  });

  it("should approve and transfer FakeDai from account_1 to account_2", async function () {
    await this.fakeDaiToken.approve(account_1, 400000, { from: account_2 });

    it('allows to transfer from when approved', async function () {
      await this.fakeDaiToken.transferFrom(account_1, account_2, 400000, { from: account_2 });
      // const senderBalance = await this.token.balanceOf(account_1);
      // assert.equal(senderBalance, 60);
      // const recipientBalance = await this.token.balanceOf(account_2);
      // assert.equal(recipientBalance, 40);
    });
  });

  // Create a TCR
  it("should create a TCR", async function () {
    let ratio = 500000;
    let amount = 0;
    //let hexArray = 'my string content payload'.split ('').map (function (c) { return c.charCodeAt (0); })
    await this.factory.createTCR("just a string", ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 400000});
  });

  // Read all the keys for the TCRs
  it("should return 3 keys from TCR", async function () {
    let ratio = 500000;
    let amount = 0;
    await this.factory.createTCR("foo", ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 300000});
    await this.factory.createTCR("bar", ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 300000});
    await this.factory.createTCR("baz", ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 300000});
    let keys = await this.factory.getKeys();
    assert(keys.length == 3);
    //console.log(keys);
  });

  // get a TCR and content
  it("should return content from a tcr", async function () {
    let ratio = 500000;
    let amount = 0;

    await this.factory.createTCR("one", ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 400000});
    await this.factory.createTCR("two", ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 400000});
    //Gas usage: ~317813

    let keys = await this.factory.getKeys();
   //console.log(keys);
    let content = await this.factory.getContent(keys[0]);
    assert(content == "one");
    content = await this.factory.getContent(keys[1]);
    assert(content == "two");
  });

    // get a TCR and content
    it("should buy shares from a tcr", async function () {
      let ratio = 500000;
      let amount = 0;
  
      await this.factory.createTCR("created by user one", ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 400000});
      await this.factory.createTCR("created by user two", ratio, this.fakeDaiToken.address, amount, {from: account_2, gas: 400000});
      //Gas usage: ~317813
  
      let keys = await this.factory.getKeys();
      console.log(keys);
      let content = await this.factory.getContent(keys[0]);
      assert(content == "created by user one");
      content = await this.factory.getContent(keys[1]);
      assert(content == "created by user two");
      
      // buy(bytes32 hashId, uint256 ercBuyAmount)
      // approve first
      let tcrFactoryAddress = "0xa4516018d6b0313a03a69130356f23a168c0ab10";
      await this.fakeDaiToken.approve(tcrFactoryAddress, 400000, { from: account_1 });

      await this.factory.buy(keys[1], 300000, {from: account_1, gas: 1000000});
    });
});

// buy(bytes32 hashId, uint256 ercBuyAmount)


  // // Positive Test X
  // it('should buy tokens correctly via default function', async () => {
  //   let amount = 8 * (10 ** decimals);

  //   const startBalance = await factory.balanceOf.call(accounts[0]);
  //   let p = await getRequestParams(amount);
  //   let buyTokens = await factory.send(Math.floor(p.price));
  //   console.log('buyTokens via default gas', buyTokens.receipt.gasUsed);

  //   const endBalance = await factory.balanceOf.call(accounts[0]);
  //   let amountBought = endBalance.sub(startBalance);
  //   assert.isAtMost(Math.abs(amountBought.sub(amount)), 1e3, 'able to buy tokens via fallback');
  // });


//   async function getRequestParams(amount) {
//     let supply = await factory.totalSupply.call();
//     supply = supply.valueOf();
//     let poolBalance = await factory.poolBalance.call();
//     poolBalance = poolBalance.valueOf();

//     let price = poolBalance * ((1 + amount / supply) ** (1 / (reserveRatio)) - 1);
//     return {
//       supply, poolBalance, solRatio, price
//     };
//   }

//   it('should estimate price for token amount correctly', async () => {
//     let amount = 13 * (10 ** decimals);
//     let p = await getRequestParams(amount);
//     let estimate = await factory.calculatePurchaseReturn.call(
//       p.supply,
//       p.poolBalance,
//       solRatio,
//       p.price
//     );

//     assert.isAtMost(Math.abs(estimate.sub(amount)), 1e3, 'estimate should equal original amount');
//   });

//   it('should buy tokens correctly', async () => {
//     let amount = 14 * (10 ** decimals);

//     const startBalance = await factory.balanceOf.call(accounts[0]);

//     let p = await getRequestParams(amount);
//     let buyTokens = await factory.buy({ from: accounts[0], value: Math.floor(p.price) });
//     console.log('buy gas', buyTokens.receipt.gasUsed);

//     const endBalance = await factory.balanceOf.call(accounts[0]);
//     let amountBought = endBalance.sub(startBalance);
//     assert.isAtMost(Math.abs(amountBought.sub(amount)), 1e4, 'able to buy tokens');
//   });

//   it('should buy tokens a second time correctly', async () => {
//     let amount = 5 * (10 ** decimals);

//     const startBalance = await factory.balanceOf.call(accounts[0]);

//     let p = await getRequestParams(amount);
//     let buyTokens = await factory.buy({ from: accounts[0], value: Math.floor(p.price) });
//     // console.log('buy gas', buyTokens.receipt.gasUsed);

//     const endBalance = await factory.balanceOf.call(accounts[0]);
//     let amountBought = endBalance.sub(startBalance);
//     assert.isAtMost(Math.abs(amountBought.sub(amount)), 1e4, 'should be able to buy tokens');
//   });

//   it('should be able to sell tokens', async () => {
//     let amount = await factory.balanceOf(accounts[0]);
//     let sellAmount = Math.floor(amount / 2);

//     let p = await getRequestParams(amount);
//     let saleReturn = await factory.calculateSaleReturn.call(
//       p.supply,
//       p.poolBalance,
//       solRatio,
//       sellAmount
//     );

//     let contractBalance = await web3.eth.getBalance(factory.address);

//     let sell = await factory.sell(sellAmount.valueOf());
//     console.log('sellTokens gas ', sell.receipt.gasUsed);

//     let endContractBalance = await web3.eth.getBalance(factory.address);
//     assert.equal(saleReturn.valueOf(), contractBalance - endContractBalance, 'contract change should match sale return');

//     const endBalance = await factory.balanceOf.call(accounts[0]);
//     assert.isAtMost(Math.abs(endBalance.valueOf() * 1 - (amount - sellAmount)), 1e3, 'balance should be correct');
//   });

//   it('should not be able to buy anything with 0 ETH', async () => {
//     await assertRevert(factory.buy({ value: 0 }));
//   });

//   it('should not be able to sell more than what you have', async () => {
//     let amount = await factory.balanceOf(accounts[0]);
//     await assertRevert(factory.sell(amount.plus(1)));
//   });


//   it('should be able to sell all', async () => {
//     let amount = await factory.balanceOf(accounts[0]);

//     let contractBalance = await web3.eth.getBalance(factory.address);

//     let p = await getRequestParams(amount);
//     let saleReturn = await factory.calculateSaleReturn.call(
//       p.supply,
//       p.poolBalance,
//       solRatio,
//       amount
//     );

//     let sell = await factory.sell(amount);
//     console.log('sellTokens gas ', sell.receipt.gasUsed);

//     let endContractBalance = await web3.eth.getBalance(factory.address);
//     assert.equal(saleReturn.valueOf(), contractBalance - endContractBalance, 'contract change should match sale return');

//     const endBalance = await factory.balanceOf.call(accounts[0]);
//     assert.equal(endBalance.valueOf(), 0, 'balance should be 0 tokens');
//   });

//   it('should not be able to set gas price of 0', async function () {
//     await assertRevert(factory.setGasPrice.call(0));
//   });

//   it('should be able to set max gas price', async function () {
//     await factory.setGasPrice(1, { from: accounts[0] });
//     gasPrice = await factory.gasPrice.call();
//     assert.equal(1, gasPrice.valueOf(), 'gas price should update');
//   });

//   it('should throw an error when attempting to buy with gas price higher than the universal limit', async () => {
//     await expectThrow(factory.buy({ gasPrice: gasPrice + 1, value: 10 ** 18 }));
//   });

//   it('test calculateSaleReturn branches', async () => {
//     await expectThrow(factory.calculateSaleReturn(0, 0, 0, 0), 'should throw when params are 0');

//     let sellReturn = await factory.calculateSaleReturn(1, 1, 100000, 0);
//     assert.equal(0, sellReturn.toNumber(), 'sellReturn should be 0 when selling 0 tokens');

//     sellReturn = await factory.calculateSaleReturn(1, 1, 100000, 1);
//     assert.equal(1, sellReturn.toNumber(), 'sellReturn should be 1 when selling all tokens');

//     sellReturn = await factory.calculateSaleReturn(2, 2, 1000000, 1);
//     assert.equal(1, sellReturn.toNumber(), 'sellReturn return 1 when _connectorWeight = MAX_WEIGHT');
//   });


//   it('test calculatePurchaseReturn branches', async () => {
//     await expectThrow(factory.calculatePurchaseReturn(0, 0, 0, 0), 'should throw when params are 0');

//     let buyReturn = await factory.calculatePurchaseReturn(1, 1, 100000, 0);
//     assert.equal(0, buyReturn.toNumber(), 'sellReturn should be 0 when selling 0 tokens');

//     buyReturn = await factory.calculatePurchaseReturn(1, 1, 1000000, 1);
//     assert.equal(1, buyReturn.toNumber(), 'sellReturn should be 0 when selling 0 tokens');
//   });
// });

