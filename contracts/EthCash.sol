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
}
