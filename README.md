# 🃏 CardMatcher – On-Chain Matching Game

## **Contract Address**
`0xF7fdeE3553C056Cf408445b3449f6Fda1C0B2850`  
https://coston2-explorer.flare.network/address/0xF7fdeE3553C056Cf408445b3449f6Fda1C0B2850
<img width="3024" height="1964" alt="image" src="https://github.com/user-attachments/assets/5e36c041-d167-4f26-b93c-044bbbf6a11f" />


---

## **Project Description**
CardMatcher is a simple and beginner-friendly blockchain game built in Solidity.  
The goal is straightforward: pick two card IDs and check whether they form a valid pair.  
The contract enforces immutable game rules, stores match results on-chain, and ensures transparency.

Players interact through a minimal web interface powered by Wagmi + Viem + Next.js.  
This project is ideal for learning how smart contracts, hooks, and basic Web3 UI patterns work together.

---

## **What the Project Does**
- Loads total cards and their pairings from the smart contract  
- Displays match status of each card  
- Allows a user to submit two card numbers and attempt a match  
- Writes and reads data from the blockchain in real-time  
- Shows transaction hash, loading state, and errors clearly

---

## **Features**
### 🔹 Smart Contract
- Hardcoded card pairs (perfect for beginners)
- Fully on-chain matching logic
- read-only info: totalCards, pair, match status
- one write function: `matchCards(cardA, cardB)`

### 🔹 Frontend (Next.js + Wagmi)
- Wallet-gated interface
- Live on-chain card state
- Transaction lifecycle UI (loading → confirming → confirmed)
- Error handling for failed interactions
- Clean reusable hook (`useContract`)

### 🔹 Developer Friendly
- Clear code structure
- Minimal ABI
- Easy to extend (add score, randomness, multiplayer, etc.)

---

## **How It Solves the Problem**
Traditional card-match logic is entirely off-chain and can’t be trusted.  
CardMatcher brings the game fully on-chain, which solves:

### ✔ Transparency
Players don’t need to trust a server — the blockchain enforces correctness.

### ✔ Verifiable State
Matched cards remain matched forever and are viewable by anyone.

### ✔ Deterministic Logic
No central authority controls the game; rules are embedded in the contract.

### ✔ Education-Focused Architecture
The clean separation between:
- **contract logic**
- **React hook**
- **frontend UI**

…makes this project perfect for learning real-world Web3 dApp patterns.

### ✔ Extendability
You can easily evolve this prototype into:
- NFT-based cards  
- Multiplayer game modes  
- Leaderboards  
- Randomized shuffle using VRF  
- Tournaments  

---

## **Conclusion**
CardMatcher is a simple, well-structured, and transparent blockchain mini-game built entirely for learning and experimentation.  
It showcases the fundamentals of smart contract interaction, UI integration, and on-chain logic—all in a clean, minimal architecture.

Happy building! 🚀


