pragma solidity ^0.4.17;

contract EthCash {
  
  struct EthCoin {
    // The hashed password specified by the future recipient for the coin
    string passwordHash;

    // The value of the coin deemed by the sender
    uint value;
  }

  event CoinFunded(bool success, uint oldValue, uint newValue);

  // the block time when the coin was locked to the specified address
  mapping (address => uint) lockTime;

  // the number of times the coin was locked to the specified address
  mapping (address => uint) numLocks;

  mapping (string => EthCoin) escrowedCoins;

  function fundCoin(string _coinIdHash, string _passwordHash) payable public {
    require(msg.value > 0);
    
    uint escrowedValue = escrowedCoins[_coinIdHash].value;
    // If an escrowed coin, already exists. The coin has already been funded. Don't fund it again. 
    if (escrowedValue != 0) {
      CoinFunded(false, escrowedValue, escrowedValue);
    } else {
      // Create a representation of the coin and store it 
      EthCoin memory coin = escrowedCoins[_coinIdHash]; 
      coin.passwordHash = _passwordHash; 
      coin.value = msg.value; 

      CoinFunded(true, 0, msg.value);
    }
  }

  function getValue(string _coinIdHash) public view returns(uint) {
    return escrowedCoins[_coinIdHash].value;
  }

  // function isLocked(string _hId) public view returns(bool) {
  //   address recipient = escrowedCoins[_hId].recipient;
  //   uint lockTime = escrowedCoins[_hId].lockTime[recipient];
  //   if (block.timestamp < lockTime + maxLockTime) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // function lock(string _hId) public {
  //   CoinData memory coin = escrowedCoins[_hId];
  //   address currentRecipient = coin.recipient;
  //   if (currentRecipient == address(0)) {
  //     // coin hasn't been previously locked
  //     _lock(_hId);
  //   }
  // }

  // function _lock(string _hId) private {
  //   escrowedCoins[_hId].recipient = msg.sender;
  //   escrowedCoins[_hId].numLocks[msg.sender] += 1;
  //   escrowedCoins[_hId].lockTime[msg.sender] = block.timestamp;
  // }
}
