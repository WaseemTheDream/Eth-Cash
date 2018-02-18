var EthCash = artifacts.require("./EthCash.sol");

module.exports = function(deployer) {
  deployer.deploy(EthCash);
};
