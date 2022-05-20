const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let guessGame;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  guessGame = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object , arguments: [2] })
    .send({ gas: '1000000', from: accounts[0] }); 
});
describe('Guess Game Contract', () => {
  it('deploys a contract', () => {
    assert.ok(guessGame.options.address);
  });

  it('allows account to guess', async () => {
    let balance

    // Keep guess until guessed the wrong number.
    while (true) {
        balance = await web3.eth.getBalance(guessGame.options.address);

        let upperLimitStr = await guessGame.methods.upperLimit().call();
        let lowerLimitStr = await guessGame.methods.lowerLimit().call();
        let upperLimit=parseInt(upperLimitStr)
        let lowerLimit=parseInt(lowerLimitStr)

        num = (upperLimit + lowerLimit) / 2

        await guessGame.methods.guess(Math.round(num)).send({
            from: accounts[0],
            value: web3.utils.toWei('0.01', 'ether'),
        });

        isInit = await guessGame.methods.isInit().call();
        if (!isInit){
            break
        }
    }

    // If the guess is wrong, the balance in contract after guess 
    // should be greater than balance before guess.
    const postBalance = await web3.eth.getBalance(guessGame.options.address);
    b = parseFloat(web3.utils.fromWei(balance , "ether"))
    p = parseFloat(web3.utils.fromWei(postBalance , "ether"))

    assert.equal(isInit, false)
    assert(p > b);
  });

  it('sends money to the winner and resets initial state', async () => {
    let balance

    // Keep guess until guessed the correct number.
    while (true) {
        balance = await web3.eth.getBalance(guessGame.options.address);

        let upperLimitStr = await guessGame.methods.upperLimit().call();
        let lowerLimitStr = await guessGame.methods.lowerLimit().call();
        let upperLimit=parseInt(upperLimitStr)
        let lowerLimit=parseInt(lowerLimitStr)

        num = (upperLimit + lowerLimit) / 2

        await guessGame.methods.guess(Math.round(num)).send({
            from: accounts[0],
            value: web3.utils.toWei('0.01', 'ether'),
        });

        correct = await guessGame.methods.isInit().call();
        if (correct){
            break
        }
    }

    // If the guess is wrong, the balance in contract after guess 
    // should be greater than balance before guess.
    const postBalance = await web3.eth.getBalance(guessGame.options.address);
    b = parseFloat(web3.utils.fromWei(balance , "ether"))
    p = parseFloat(web3.utils.fromWei(postBalance , "ether"))
    assert.equal(correct, true);
    assert((p < b) || p < 0.01);
  });

  it('requires a minimum amount of ether to guess', async () => {
    try {
      await guessGame.methods.guess(1).send({
        from: accounts[0],
        value: 0,
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('requires a guess between upper limit and lower limit', async () => {
    try {
      await guessGame.methods.guess(3).send({
        from: accounts[0],
        value: web3.utils.toWei('0.01', 'ether'),
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });
});
