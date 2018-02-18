const web3 = global.web3;
var EthCash = artifacts.require("./EthCash.sol");

contract('EthCash', function(accounts) {

  function hash(input) {
    return web3.toHex(web3.sha3(input));
  }

  it("should store the value 89.", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;
      return ethCoinInstance.createCoin(hash("123"), hash("pass"), {from: accounts[0], value: 89});
    }).then(function() {
      return ethCoinInstance.getValue(hash("123"));
    }).then(function(storedData) {
      assert.equal(storedData, 89, "The value 89 was not stored.");
    });
  });

  it("should show as locked after calling lock", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;
      return ethCoinInstance.createCoin(hash("123"), hash("pass"), {from: accounts[0], value: 89});
    }).then(function() {
      return ethCoinInstance.lock(hash("123"), {from: accounts[1]});
    }).then(function() {
      return ethCoinInstance.isLocked(hash("123"));
    }).then(function(storedData) {
      assert.equal(storedData, true, "The coin is not locked.");
    });
  });

  it("should not show as locked without acquiring lock", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;
      return ethCoinInstance.createCoin(hash("123"), hash("pass"), {from: accounts[0], value: 89});
    }).then(function() {
      return ethCoinInstance.isLocked(hash("123"));
    }).then(function(storedData) {
      assert.equal(storedData, false, "The coin is locked when not expected it to be.");
    });
  });

  it("should send the money to the recipient after calling receive", function() {
    return EthCash.deployed().then(function(instance) {
      ethCoinInstance = instance;

      account1Balance = web3.eth.getBalance(accounts[1]).toNumber();

      amountToSend = web3.toWei(2.5, 'ether');

      return ethCoinInstance.createCoin(hash("123"), hash("pass"), {from: accounts[0], value: amountToSend});
    }).then(function() {
      return ethCoinInstance.lock(hash("123"), {from: accounts[1]});
    }).then(function() {
      return ethCoinInstance.isLocked(hash("123"));
    }).then(function(storedData) {
      return ethCoinInstance.redeem(hash("123"), "pass");
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
