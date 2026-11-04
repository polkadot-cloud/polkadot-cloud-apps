# Smoldot Transaction Signing Test

This package contains a standalone test script to diagnose transaction signing issues with the smoldot light client, using the same approach as the Polkadot Staking Dashboard.

## Purpose

This script helps diagnose issues with signing transactions when using the smoldot light client. It:

1. Connects to Polkadot network via smoldot light client (same as the dashboard)
2. Initializes relay chain, Asset Hub, and People chain (matching dashboard topology)
3. Creates a signing account from a seed phrase using `@polkadot/keyring`
4. Prepares a simple transfer transaction using Dedot
5. Attempts to sign and submit the transaction
6. Reports any errors that occur during the signing/submission process

## Usage

From the monorepo root or within this package:

```bash
# Install dependencies (from root)
pnpm install

# Run the test
cd packages/test-smoldot
SEED_PHRASE="your twelve word seed phrase here" RECIPIENT_ADDRESS="destination address here" pnpm start
```

**⚠️ Important:** Use a test account with minimal funds. The script will attempt to create a transfer transaction.

## What the Script Does

1. **Initialize smoldot**: Creates a smoldot client
2. **Add Polkadot relay chain**: Adds the relay chain using official chain spec
3. **Add Asset Hub**: Adds Asset Hub as a parachain
4. **Add People chain**: Adds People chain as a parachain
5. **Create Dedot Providers**: Wraps all chains in SmoldotProviders
6. **Connect Dedot Client**: Establishes a Dedot client connection to Asset Hub
7. **Fetch Account Info**: Retrieves account balance and nonce
8. **Prepare Transfer**: Creates a simple transfer transaction (0.1 DOT)
9. **Sign Transaction**: Attempts to sign the transaction using the provided account
10. **Submit Transaction**: Sends the signed transaction to the network
11. **Monitor Status**: Watches for transaction inclusion and reports the result

## Expected Output

### Success Case

```
🚀 Starting smoldot light client test...

🔑 Creating account from seed phrase...
✅ Account address: 1...

🔌 Initializing smoldot client...
⛓️  Adding Polkadot relay chain to smoldot...
✅ Polkadot relay chain added
⛓️  Adding Asset Hub chain to smoldot...
✅ Asset Hub chain added
⛓️  Adding People chain to smoldot...
✅ People chain added

🔗 Creating Dedot providers...
✅ Providers created
📡 Connecting to Asset Hub via Dedot client...
✅ Dedot client connected to Asset Hub

✍️  Signing transaction...
✅ Transaction signed successfully!
```

### Error Case

The script will log detailed error information to help identify where in the signing process the issue occurs.

## Architecture

This test script mimics the exact chain topology used by the dashboard:
- Relay chain (Polkadot) is initialized first
- System chains (Asset Hub, People) are added with `potentialRelayChains` pointing to the relay chain
- Dedot client connects to Asset Hub for transaction submission
