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

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('TcrFactory', function ([_, account_1, account_2, account_3, account_4]) {

  const fakeDaiMinted = 2222; // unused, doesn't work
 
  // Setup before each test
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

  // Create a TCR
  it("should create a TCR", async function () {
    let content = new Uint8Array([0, 1, 255, 2]);
    //let content = "0x111";
    let ratio = 500000;
    let amount = 0;
    assert(this.factory !== undefined, 'TcrFactory contract should be deployed.');
    assert(this.fakeDaiToken !== undefined, 'FakeDaiToken contract should be deployed.');
    console.log(this.fakeDaiToken);
    await this.factory.createTCR(["0x1262","0x12","0x12"], ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 300000});
  });

  // Create a TCR
  it("should return content from TCR", async function () {
    let content = new Uint8Array([0, 1, 255, 2]);
    //let content = "0x111";
    let ratio = 500000;
    let amount = 0;
    assert(this.factory !== undefined, 'TcrFactory contract should be deployed.');
    assert(this.fakeDaiToken !== undefined, 'FakeDaiToken contract should be deployed.');
    console.log(this.fakeDaiToken);
    await this.factory.createTCR(["0x1262","0x12","0x12"], ratio, this.fakeDaiToken.address, amount, {from: account_1, gas: 300000});
  });


  // Positive Test 4
  // it("should generate the correct hashId for the TCR and return the correct content", async () => {
    
  //   let content = new Uint8Array([0, 1, 255, 2]);
  //   let ratio = 500000;
  //   let amount = 100;
  //   await factory.createTCR(content, ratio, fakeDaiToken, amount, {from: accounts[0]});

  //   let hashId = await factory.getHashId(content, ratio, fakeDaiToken);
  //   let contentRetrieved = await factory.getContent(hashId);
  //   assert.equal(content, contentRetrieved, `Expected content retrieved ${content} does not match ${contentRetrieved}`);
  // });

});

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

