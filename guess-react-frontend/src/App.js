import React from "react";
import web3 from "./web3";
import guessGame from "./guessGame";

class App extends React.Component {
  state = {
    balance: "",
    minimumAmount: "",
    guessValue: "",
    upperLimit: "",
    lowerLimit: "",
    message: "",
    isInit: "",
  };
  async componentDidMount() {
    const balance = await web3.eth.getBalance(guessGame.options.address);
    const minimumAmount = this.getMinimum();
    const upperLimit = await guessGame.methods.upperLimit().call();
    const lowerLimit = await guessGame.methods.lowerLimit().call();
    const isInit = await guessGame.methods.isInit().call();

    this.setState({ balance: balance, minimumAmount: minimumAmount, message: "", upperLimit:upperLimit, lowerLimit:lowerLimit, isInit:isInit });
  }

  getMinimum = () => {
    const min = parseFloat(web3.utils.fromWei(this.state.balance , "ether")) / 10;
    if (min > .01) {
      return min.toString
    }
    return "0.01"
  }

  getAward = () => {
    return parseFloat(web3.utils.fromWei(this.state.balance , "ether")) * 0.9;
  }

  onSubmit = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });

    const guessNum = parseInt(this.state.guessValue);
    if (isNaN(guessNum)){
      this.setState({ message: "Invalid input, please retry" });
    }

    await guessGame.methods.guess(guessNum).send({
      from: accounts[0],
      value: web3.utils.toWei(this.getMinimum(), "ether"),
    });

    let isInit = await guessGame.methods.isInit().call();
    if (isInit) {
      this.setState({ message: "Congrats! You made the right guess" });
    } else {
      this.setState({ message: "Wrong guess unfortunately" })
    }

    const balance = await web3.eth.getBalance(guessGame.options.address);
    const minimumAmount = this.getMinimum();
    const upperLimit = await guessGame.methods.upperLimit().call();
    const lowerLimit = await guessGame.methods.lowerLimit().call();

    this.setState({ balance: balance, minimumAmount: minimumAmount, message: "", upperLimit:upperLimit,lowerLimit:lowerLimit });
  };

  render() {
    return (
      <div>
        <h2>Guess Game</h2>
        <p>
          Guess a number from{" "} {this.state.lowerLimit} to{" "} {this.state.upperLimit}! {" "} 
          There are currently{" "} {this.getAward()} ether!
        </p>

        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter: {this.state.minimumAmount}</label><br/>
            <label>Your guess: </label>
            <input
              value={this.state.guessValue}
              onChange={(event) => this.setState({ guessValue: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}
export default App;