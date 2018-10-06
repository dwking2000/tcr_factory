let TcrFactory = artifacts.require('./TcrFactory.sol');
let ECRecovery = artifacts.require('zeppelin-solidity/contracts/ECRecovery.sol');

module.exports = function (deployer) {
  deployer.deploy(ECRecovery);
  deployer.link(ECRecovery, TcrFactory);
  deployer.deploy(TcrFactory);
};
