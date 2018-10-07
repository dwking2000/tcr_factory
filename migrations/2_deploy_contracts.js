let TcrFactory = artifacts.require('./TcrFactory.sol');
let FakeDai = artifacts.require('./FakeDai.sol');

module.exports = function (deployer) {
  deployer.deploy(TcrFactory);
  deployer.deploy(FakeDai);
};
