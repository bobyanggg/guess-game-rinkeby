const path = require('path');
const fs = require('fs');
const solc = require('solc');

const guessGamePath = path.resolve(__dirname, 'contracts', 'GuessGame.sol');
const source = fs.readFileSync(guessGamePath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'GuessGame.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  'GuessGame.sol'
].GuessGame;
