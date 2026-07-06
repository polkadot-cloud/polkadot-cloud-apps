// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainSpec as polkadotChainSpec } from '@dedot/chain-specs/polkadot'
import { chainSpec as assetHubChainSpec } from '@dedot/chain-specs/polkadot_asset_hub'
import { chainSpec as peopleChainSpec } from '@dedot/chain-specs/polkadot_people'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes'
import Keyring from '@polkadot/keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { DedotClient, SmoldotProvider } from 'dedot'
import { start } from 'smoldot'

// Initialize smoldot (Node.js compatible - no worker needed)
const initSmoldotClient = () => {
	const client = start()
	return client
}

// Creates and returns a Keyring account from the provided mnemonic phrase
const createAccount = (phrase: string) => {
	const keyring = new Keyring({ type: 'sr25519' })
	keyring.setSS58Format(0)
	return keyring.addFromUri(phrase)
}

const main = async () => {
	console.log('🚀 Starting smoldot light client test...\n')

	// Get seed phrase from environment variable
	const seedPhrase = process.env.SEED_PHRASE
	const recipient = process.env.RECIPIENT_ADDRESS

	if (!seedPhrase || !recipient) {
		console.error(
			'❌ Error: SEED_PHRASE and RECIPIENT_ADDRESS environment variables are required',
		)
		console.log(
			'Usage: SEED_PHRASE="your seed phrase" RECIPIENT_ADDRESS="recipient address" pnpm start',
		)
		process.exit(1)
	}

	try {
		// Initialize WASM crypto (required for @polkadot/keyring)
		console.log('🔐 Initializing WASM crypto...')
		await cryptoWaitReady()
		console.log('✅ WASM crypto ready\n')

		// Create signing account
		console.log('🔑 Creating account from seed phrase...')
		const signingAccount = createAccount(seedPhrase)
		console.log(`✅ Account address: ${signingAccount.address}\n`)

		// Initialize smoldot client
		console.log('🔌 Initializing smoldot client (Node.js mode - no worker)...')
		const smoldotClient = initSmoldotClient()
		console.log('✅ Smoldot client initialized:', !!smoldotClient)

		// Add Polkadot relay chain (required for system chains)
		console.log('⛓️  Adding Polkadot relay chain to smoldot...')
		const relayChain = await smoldotClient.addChain({
			chainSpec: polkadotChainSpec,
		})
		console.log('✅ Polkadot relay chain added')
		console.log('✅ Relay chain valid:', !!relayChain)

		// Add Asset Hub (Statemint) as a system chain
		console.log('⛓️  Adding Asset Hub chain to smoldot...')
		const assetHubChain = await smoldotClient.addChain({
			chainSpec: assetHubChainSpec,
			potentialRelayChains: [relayChain],
		})
		console.log('✅ Asset Hub chain added')
		console.log('✅ Asset Hub chain valid:', !!assetHubChain)

		// Add People chain as a system chain
		console.log('⛓️  Adding People chain to smoldot...')
		const peopleChain = await smoldotClient.addChain({
			chainSpec: peopleChainSpec,
			potentialRelayChains: [relayChain],
		})
		console.log('✅ People chain added')
		console.log('✅ People chain valid:', !!peopleChain, '\n')

		// Create Dedot providers for each chain
		console.log('🔗 Creating Dedot providers...')

		// Mimicking staking dashboard behavior by initialising providers for all chains
		const relayProvider = new SmoldotProvider(relayChain)
		void relayProvider

		const assetHubProvider = new SmoldotProvider(assetHubChain)

		const peopleProvider = new SmoldotProvider(peopleChain)
		void peopleProvider
		console.log('✅ Providers created')

		// Initialize Dedot client for Asset Hub (this is where transactions will be sent)
		console.log('📡 Connecting to Asset Hub via Dedot client...')
		const client = await DedotClient.new<PolkadotAssetHubApi>(assetHubProvider)
		console.log('✅ Dedot client connected to Asset Hub\n')

		// Get account info
		console.log('📊 Fetching account info...')
		const accountInfo = await client.query.system.account(
			signingAccount.address,
		)
		console.log('Account info:', accountInfo.data, accountInfo.nonce)
		console.log('✅ Account info fetched\n')

		// Get current chain info
		console.log(`📌 Connected \n`)

		// Prepare a simple transfer transaction
		// Using a minimal amount (1 Planck) to a test address
		const amount = 1000000000n // 0.1 DOT in Planck (10^10)

		console.log('💸 Preparing transfer transaction...')
		console.log(`From: ${signingAccount.address}`)
		console.log(`To: ${recipient}`)
		console.log(`Amount: ${amount} Planck (0.1 DOT)\n`)

		// Create the transfer call
		const transferCall = client.tx.balances.transferKeepAlive(recipient, amount)

		// Sign the transaction
		console.log('✍️  Signing transaction...')
		const sub = await transferCall.signAndSend(signingAccount, (result) => {
			console.log('\n📬 Transaction status update:')
			console.log(`Status: ${result.status.type}`)

			if (
				result.status.type === 'BestChainBlockIncluded' ||
				result.status.type === 'Finalized'
			) {
				console.log(`Block hash: ${result.status.value.blockHash}`)
				console.log(`Transaction hash: ${result.txHash}`)

				if (result.dispatchError) {
					console.error(
						'❌ Transaction failed with dispatch error:',
						result.dispatchError,
					)
				} else {
					console.log('✅ Transaction successful!')
				}
			}

			if (result.status.type === 'Invalid' || result.status.type === 'Drop') {
				console.error('❌ Transaction was dropped or invalid')
			}
		})

		console.log('\n✅ Transaction signed successfully!')
		console.log('\n⏳ Waiting for transaction to be included in a block...')

		// Keep the script running to receive status updates
		await new Promise((resolve) => setTimeout(resolve, 60000)) // Wait 60 seconds

		await sub()
	} catch (error) {
		console.error('\n❌ Error occurred:')
		console.error('Error:', error)
		console.error('\nFull error object:', error)
		process.exit(1)
	}
}

main()
	.then(() => {
		console.log('\n✅ Script completed')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Unhandled error:', error)
		process.exit(1)
	})
