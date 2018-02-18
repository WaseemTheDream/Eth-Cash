var EthCash = artifacts.require("./EthCash.sol");

contract('EthCash', function(accounts) {

  it("...should store the value 89.", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;
      return ethCoinInstance.createCoin("123", "pass", {from: accounts[0], value: 89});
    }).then(function() {
      return ethCoinInstance.getValue("123");
    }).then(function(storedData) {
      assert.equal(storedData, 89, "The value 89 was not stored.");
    });
  });

});
