const web3 = global.web3;
var EthCash = artifacts.require("./EthCash.sol");

contract('EthCash', function(accounts) {

  it("should store the value 89.", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;
      return ethCoinInstance.createCoin("123", "pass", {from: accounts[0], value: 89});
    }).then(function() {
      return ethCoinInstance.getValue("123");
    }).then(function(storedData) {
      assert.equal(storedData, 89, "The value 89 was not stored.");
    });
  });

  it("should show as locked after calling lock", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;
      return ethCoinInstance.createCoin("123", "pass", {from: accounts[0], value: 89});
    }).then(function() {
      return ethCoinInstance.lock("123", {from: accounts[1]});
    }).then(function() {
      return ethCoinInstance.isLocked("123");
    }).then(function(storedData) {
      assert.equal(storedData, true, "The coin is not locked.");
    });
  });

  it("should not show as locked without acquiring lock", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;
      return ethCoinInstance.createCoin("123", "pass", {from: accounts[0], value: 89});
    }).then(function() {
      return ethCoinInstance.isLocked("123");
    }).then(function(storedData) {
      assert.equal(storedData, false, "The coin is locked when not expected it to be.");
    });

  });

  it("should send the money to the recipient after calling receive", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;

      account1Balance = web3.eth.getBalance(accounts[1]).toNumber();

      amountToSend = web3.toWei(2.5, 'ether');

      return ethCoinInstance.createCoin("123", "pass", {from: accounts[0], value: amountToSend});
    }).then(function() {
      return ethCoinInstance.lock("123", {from: accounts[1]});
    }).then(function() {
      return ethCoinInstance.isLocked("123");
    }).then(function(storedData) {
      return ethCoinInstance.redeem("123");
    }).then(function() {
      newAccount1Balance = web3.eth.getBalance(accounts[1]).toNumber();
      amountReceived = newAccount1Balance - account1Balance;
      assert.isAtLeast(
        web3.fromWei(amountReceived, 'ether'),
        2.49,
        "The recipient should at least get 2.49 Eth when 2.5 Eth is sent.");
    });
  });
});
