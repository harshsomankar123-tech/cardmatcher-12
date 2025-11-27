// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CardMatcher {

    // Store if a card is matched or not
    mapping(uint => bool) public isMatched;

    // Fixed number of cards (example: 4 cards → 2 pairs)
    uint public totalCards = 4;

    // Hardcoded pairs: card 1 <-> card 3, card 2 <-> card 4
    mapping(uint => uint) private cardPair;

    // Event for successful match
    event MatchSuccess(address player, uint cardA, uint cardB);

    constructor() {
        // No inputs needed during deployment
        // Hardcoded simple card pairs for beginners
        cardPair[1] = 3;
        cardPair[3] = 1;

        cardPair[2] = 4;
        cardPair[4] = 2;
    }

    // Try to match two cards
    function matchCards(uint cardA, uint cardB) public returns (bool) {
        require(cardA <= totalCards && cardB <= totalCards, "Invalid card");
        require(!isMatched[cardA] && !isMatched[cardB], "Already matched");

        if (cardPair[cardA] == cardB) {
            isMatched[cardA] = true;
            isMatched[cardB] = true;

            emit MatchSuccess(msg.sender, cardA, cardB);
            return true;   // Match successful
        }

        return false;        // Not a match
    }

    // Optional: check the matching card (useful for learning)
    function getPair(uint cardId) public view returns (uint) {
        return cardPair[cardId];
    }
}

