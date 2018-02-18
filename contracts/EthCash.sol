pragma solidity ^0.4.17;

contract EthCash {

  uint LOCK_EXPIRATION_TIME = 5 minutes;
  
  struct EthCoin {
    // The hashed password specified by the future recipient for the coin
    uint passwordHash;

    // The value of the coin deemed by the sender
    uint value;
  }

  // a mapping of coin hashes to escrowed coin structs 
  mapping (uint => EthCoin) escrowedCoins;

  struct Lock {
    // The recipient address to whom this transaction is being locked to
    address fundsRecipient;
    
    // The expiration time in unix time milliseconds 
    uint expirationTime;
  }

  // a mapping of coin hashes to their respective lock structs 
  mapping (uint => Lock) locks; 

  // an event indicating success or failure of the lock
  event CoinFunded(bool success, uint oldValue, uint newValue);
  

  function fundCoin(uint _coinIdHash, uint _passwordHash) payable public {
    require(msg.value > 0);
    
    uint escrowedValue = escrowedCoins[_coinIdHash].value;
    // If an escrowed coin, already exists. The coin has already been funded. Don't fund it again. 
    if (escrowedValue > 0) {
      CoinFunded(false, escrowedValue, escrowedValue);
    } else {
      // Create a representation of the coin and store it 
      EthCoin memory coin = escrowedCoins[_coinIdHash]; 
      coin.passwordHash = _passwordHash; 
      coin.value = msg.value; 

      CoinFunded(true, 0, msg.value);
    }
  }

  function getValue(uint _coinIdHash) public view returns(uint) {
    return escrowedCoins[_coinIdHash].value;
  }

  function lockCoin(uint _coinIdHash) public view {
    if (escrowedCoins[_coinIdHash].value > 0) {
      // Coin exists with positive value
      Lock storage lock = locks[_coinIdHash];
      if (lock.fundsRecipient == address(0)) {
        // Lock exists with a recipient address 
        if (now > lock.expirationTime) {
          // And lock expired, then allow constructing a new lock 
          _constructLock(lock);
        }
      } else {
        // If no lock exists, then allow constructing a new lock 
        _constructLock(lock);
      }
    }
  }

  function _constructLock(Lock lock) private view {
    lock.fundsRecipient = msg.sender;
    lock.expirationTime = now + LOCK_EXPIRATION_TIME;
  }

  function redeem(uint _coinIdHash, string _password) public {
    Lock memory lock = locks[_coinIdHash];
    if (lock.fundsRecipient != address(0) && now < lock.expirationTime) {
      // Compare passwords 
      bytes32 hashedPassword = keccak256(_password);
      bytes32 storedHashedPassword = bytes32(escrowedCoins[_coinIdHash].passwordHash);
      require(hashedPassword == storedHashedPassword);

      // Execute Transfer 
      EthCoin memory coin = escrowedCoins[_coinIdHash];
      lock.fundsRecipient.transfer(coin.value);

      // Clear memory 
      delete escrowedCoins[_coinIdHash];
      delete locks[_coinIdHash];
    }
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
