# Truth DAO - Blockchain Integration

## Setup Instructions

### 1. Install Dependencies
```bash
cd blockchain
npm install
```

### 2. Start Local Hardhat Node
```bash
npx hardhat node
```
This will start a local blockchain at `http://127.0.0.1:8545` with 20 test accounts.

### 3. Deploy Contracts (in a new terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the contract addresses from the output and add them to `backend/.env`:
```
TRUTH_TOKEN_ADDRESS=0x...
TRUTH_DAO_ADDRESS=0x...
```

### 4. Connect MetaMask
- Network: Localhost 8545
- Chain ID: 1337
- Currency: ETH
- Import one of the test accounts using the private key from Hardhat node output

## Smart Contracts

### TruthToken (TRUTH)
- ERC20 token for DAO governance and rewards
- Initial supply: 1,000,000 TRUTH
- Decimals: 18

### TruthDAO
- Voting contract for gray area cases
- Minimum stake: 10 TRUTH tokens per vote
- Reward pool: 100 TRUTH tokens per case
- Auto-resolves after 10 votes or deadline

## How It Works

1. **Case Creation**: Backend creates a case on-chain when AI score is 40-60%
2. **Voting**: Users stake 10 TRUTH tokens to vote TRUE or FALSE
3. **Resolution**: After 10 votes or 7 days, case resolves to majority verdict
4. **Rewards**: Voters on the winning side get their stake back + share of 100 TRUTH reward pool

## Testing

Run tests:
```bash
npx hardhat test
```

## Frontend Integration

Install ethers.js in frontend:
```bash
cd ../frontend
npm install ethers
```

Example vote transaction:
```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const dao = new ethers.Contract(DAO_ADDRESS, DAO_ABI, signer);

// Approve tokens
await truthToken.approve(DAO_ADDRESS, stake);

// Vote
await dao.vote(caseId, true); // true = TRUE, false = FALSE
```
