# cardmatcher-12
CardMatcher – Simple Solidity Matching Game
📌 Project Description

CardMatcher is a lightweight and beginner-friendly smart contract built in Solidity.
It recreates a simple “memory card matching” game directly on the blockchain.

The project is perfect for those who are new to Web3 and want to understand how mappings, events, and basic game logic work on Ethereum.
No inputs are required during deployment, making it straightforward to test and extend.

🎯 What It Does

The contract stores a fixed set of cards.

Each card has a predefined matching pair.

Players call the matchCards(cardA, cardB) function to attempt a match.

If card A matches card B → they are marked as permanently matched.

Already matched cards cannot be used again.

This results in a simple, deterministic, and fully on-chain matching game.

⭐ Features
✔ No Deployment Inputs

Deploy instantly — nothing to configure.

✔ Hardcoded Beginner-Friendly Logic

Card pairs are predefined so beginners can understand the structure easily.

✔ Persistent On-Chain State

Matched cards stay matched forever.

✔ Simple & Clean Code

Easy to read, modify, and extend.

✔ Event Logging

A MatchSuccess event is emitted for every successful match, useful for dApps or front-ends.

🔗 Deployed Smart Contract

Contract Address:
0xF7fdeE3553C056Cf408445b3449f6Fda1C0B2850
🧩 Smart Contract Code
//// SPDX-License-Identifier: MIT
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
