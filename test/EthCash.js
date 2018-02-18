var EthCash = artifacts.require("EthCash");

contract('EthCash', accounts => {

  let sampleAccount1 = accounts[0];
  let sampleAccount2 = accounts[1];
  let amountToFund = _toWei(1);

  let coinIdHash1 = 0xdeadbeef;
  let passwordIdHash1 = 0xdeadc0de;
  let passwordIdHash2 = 0xdeadcede;

  let ethCashContract;

  beforeEach(async function () {
    ethCashContract = await EthCash.new();
    coinFundedEventListener = ethCashContract.CoinFunded();
  });

  describe('fundCoin', async function() {
    let account1PreBalance = _getEtherBalance(sampleAccount1);
    let eventArguments;

    it("should fire CoinFunded with successful values the first time the coin is minted", async function() {
      await ethCashContract.fundCoin(coinIdHash1, passwordIdHash1, {from: sampleAccount1, value: amountToFund});

      let coinFundedLog = await new Promise(
        (resolve, reject) => coinFundedEventListener.get(
            (error, log) => error ? reject(error) : resolve(log)
          ));
      
      assert.equal(coinFundedLog.length, 1, 'should be 1 event only');
      
      eventArguments = coinFundedLog[0].args;

      assert.equal(eventArguments.success, true, 'should be successful event');
      assert.equal(eventArguments.oldValue, 0, 'should have been a empty 0 value coin before');
      assert.equal(eventArguments.newValue, amountToFund, 'should have exactly the new value afterwards');
    });

    it("should reflect the right account balances after coin funding", async function () {
      let account1PostBalance = _getEtherBalance(sampleAccount1);
      let ethLostBySender = account1PreBalance - account1PostBalance;
      let ethGainedByContract = _toEth(eventArguments.newValue).toNumber();

      assert.equal(ethLostBySender > ethGainedByContract, true, 'ETH lost by sender should be greater than money gained by contract');
      assert.equal(ethLostBySender - ethGainedByContract < 1, true, 'ETH transfer fee should be less than 1 ETH');
    });

    describe('getValue', async function() {
      it("should return the correct value", async function () {
        await ethCashContract.getValue(coinIdHash1, {from: sampleAccount1});
      });
    });

    describe('lockCoin', async function() {
      it("should lock a given hash correct value", async function () {
        result1 = await ethCashContract.lockCoin(coinIdHash1, {from: sampleAccount1});
        result2 = await ethCashContract.lockCoin(coinIdHash1, {from: sampleAccount2});
      });
    });

  });

  // describe('lockCoin', async function() {
  //   it("locking a non-existing coin should do nothing", async function () {
  //       await ethCashContract.lock(coinIdHash1, {from: sampleAccount1});
  //   });
  // });

  // it("should store the value 89.", function() {
  //     return ethCoinInstance.createCoin("123", "pass", {from: accounts[0], value: 89});
  //   }).then(function() {
  //     return ethCoinInstance.getValue("123");
  //   }).then(function(storedData) {
  //     assert.equal(storedData, 89, "The value 89 was not stored.");
  //   });
  // });

  // it("should show as locked after calling lock", function() {
  //   return EthCash.deployed().then(function(instance) {
  //     ethCoinInstance = instance;
  //     return ethCoinInstance.fundCoin("123", "pass", {from: accounts[0], value: 89});
  //   }).then(function() {
  //     return ethCoinInstance.lock("123", {from: accounts[1]});
  //   }).then(function() {
  //     return ethCoinInstance.isLocked("123");
  //   }).then(function(storedData) {
  //     assert.equal(storedData, true, "The coin is not locked.");
  //   });
  // });

  function _getEtherBalance(account) {
    accountBalanceWei = web3.eth.getBalance(account);
    return _toEth(accountBalanceWei);
  }

  function _toEth(wei) {
    return web3.fromWei(wei, 'ether');
  }

  function _toWei(eth) {
    return web3.toWei(eth, 'ether');    
  }
});
