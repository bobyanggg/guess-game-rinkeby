// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract GuessGame {
    uint public initUpperLimit;
    uint public lowerLimit;
    uint public upperLimit;
    uint private ans;
    // isInit represent the state of guessGame, if the correct guess is made, 
    // the contract will return to initial state.
    bool public isInit;
    
    constructor(uint num) {
        initUpperLimit = num;
        generateAnswer();
        isInit = true;
    }
    
    function guess(uint num) public payable {
        require(msg.value >= .01 ether && msg.value >= address(this).balance / 10 && num >= lowerLimit && num <= upperLimit);
        if (num == ans) {
            payable(msg.sender).transfer(address(this).balance * 9 / 10);
            generateAnswer();
            isInit = true;
            return;
        } else if (ans > num) {
            lowerLimit = num + 1;
        } else {
            upperLimit = num - 1;
        }
        isInit = false;
    }
    
    function generateAnswer() private {
        ans = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % initUpperLimit;
        lowerLimit = 0;
        upperLimit = initUpperLimit;
    }
}   