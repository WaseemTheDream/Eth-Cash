import React, { Component } from 'react'
import EthCashContract from '../build/contracts/EthCash.json'
import QrReader from 'react-qr-reader'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

var app;

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tokenCode: null,
      tokenValue: 0,
      password: null,
      qrCodeReaderDelay: 500,
      web3: null
    }

    this.handleQrCodeScan = this.handleQrCodeScan.bind(this);

    app = this;
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    const ethCash = contract(EthCashContract);
    ethCash.setProvider(this.state.web3.currentProvider);

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      ethCash.deployed().then((instance) => {
        app.ethCashInstance = instance;
        app.accounts = accounts;
      });
    })
  }

  handleQrCodeScan(data) {
    if (data) {
      this.setState({
        tokenCode: data,
      })
    }
  }

  handleQrCodeError(err) {
    console.error(err)
  }

  handleCheckValue() {
    app.ethCashInstance.getValue(app.doubleHash(app.state.tokenCode)).then((result) => {
      app.setState({
        tokenValue: app.state.web3.fromWei(result, 'ether')
      })
    });
  }

  handleMintToken() {
    if (app.state.tokenCode == null || 
        // app.state.tokenValue <= 0 || 
        app.state.password == null) {
      console.log("Missing fields.");
      return;
    }

    var amountToSend = app.state.web3.toWei(app.state.tokenValue, 'ether');

    app.ethCashInstance.createCoin(
      app.doubleHash(app.state.tokenCode),
      app.doubleHash(app.state.password),
      {from: app.accounts[0], value: amountToSend}).then((result) => {
        console.log("Successfully minted coin.");
        app.setState({
          tokenCode: "",
          tokenValue: 0,
          password: ""
        });
      });
  }

  doubleHash(input) {
    return app.state.web3.toHex(app.state.web3.sha3(app.state.web3.sha3(input)));
  }

  hash(input) {
    return app.state.web3.sha3(input);
  }

  setTokenCode(e) {
    app.setState({
      tokenCode: e.target.value
    });
  }

  setTokenValue(e) {
    app.setState({
      tokenValue: e.target.value
    });
  }

  setPassword(e) {
    app.setState({
      password: e.target.value
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">ETH Cash</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Welcome!</h1>
              <p>Mint Ether into a physical token to easily give it to someone!</p>
              <h2>Check Token Value</h2>
              <button onClick={this.handleCheckValue} style={{ width: '35%' }}>
                Check Value
              </button>
              <h2>Mint New Token</h2>
              <h3>Step 1: Set Amount</h3>
              <p>Enter the amount of Ether you would like to put into this coin.</p>
              <strong>Token Amount: </strong>
              <input type="text" value={ this.state.tokenValue } onChange={ this.setTokenValue } />
              <h3>Step 2: Set Token Code</h3>
              <p>You can either <strong>scan an existing QR code</strong> or <strong>generate a new code.</strong></p>
                <QrReader
                  delay={this.state.qrCodeReaderDelay}
                  onError={this.handleQrCodeError}
                  onScan={this.handleQrCodeScan}
                  style={{ width: '25%', paddingBottom: '15px' }}
                  />
              <h3>Step 3: Set Password</h3>
              <p>Ask the recipient to enter a password. <br /><em>Note: You should not know this password.</em></p>
              <strong>Token Code: </strong>
              <input type="text" value={ this.state.tokenCode } onChange={ this.setTokenCode } style={{ width: '30%' }} />
              <br />
              <br />
              <strong>Password: </strong>
              <input type="password" name="password" value={ this.state.password } onChange={ this.setPassword }/>
              <br />
              <br />
              <button onClick={this.handleMintToken} style={{ width: '35%' }}>
                Mint
              </button>
              <h2>Redeem Token</h2>
              <p>TODO Fill this out</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
