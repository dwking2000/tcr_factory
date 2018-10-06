let BondingCurve = artifacts.require('./BondingCurve.sol');
let ECRecovery = artifacts.require('zeppelin-solidity/contracts/ECRecovery.sol');

module.exports = function (deployer) {
  deployer.deploy(ECRecovery);
  deployer.link(ECRecovery, BondingCurve);
  deployer.deploy(BondingCurve);
};
