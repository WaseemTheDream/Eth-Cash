pragma solidity ^0.4.17;

contract EthCash {

  uint maxLockTime = 5 minutes;
  
  struct EthCoin {
    // the hashed password for the coin
    string hPassword;

    // the block time when the coin was minted
    uint mintTime;

    // the value of the coin
    uint value;

    // the recipient to which the coin is locked to
    address recipient;

    // the block time when the coin was locked to the specified address
    mapping (address => uint) lockTime;

    // the number of times the coin was locked to the specified address
    mapping (address => uint) numLocks;
  }

  mapping (string => EthCoin) escrowedCoins;

  function createCoin(string _hId, string _hPassword) payable public {
    require(msg.value > 0);
    EthCoin memory coin = EthCoin({
      hPassword: _hPassword, 
      mintTime: block.timestamp,
      value: msg.value, 
      recipient: address(0)
    });
    escrowedCoins[_hId] = coin;
  }

  function getValue(string _hId) public view returns(uint) {
    return escrowedCoins[_hId].value;
  }

  function isLocked(string _hId) public view returns(bool) {
    address recipient = escrowedCoins[_hId].recipient;
    uint lockTime = escrowedCoins[_hId].lockTime[recipient];
    if (block.timestamp < lockTime + maxLockTime) {
      return true;
    } else {
      return false;
    }
  }

  function lock(string _hId) public {
    EthCoin memory coin = escrowedCoins[_hId];
    address currentRecipient = coin.recipient;
    if (currentRecipient == address(0)) {
      // coin hasn't been previously locked
      _lock(_hId);
    }
  }

  function redeem(string _hId) public {
    require(isLocked(_hId));
    EthCoin memory coin = escrowedCoins[_hId];
    coin.recipient.transfer(coin.value);
    delete escrowedCoins[_hId];
  }

  function _lock(string _hId) private {
    escrowedCoins[_hId].recipient = msg.sender;
    escrowedCoins[_hId].numLocks[msg.sender] += 1;
    escrowedCoins[_hId].lockTime[msg.sender] = block.timestamp;
  }
}
