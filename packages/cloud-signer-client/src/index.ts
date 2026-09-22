// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import { $Metadata } from 'dedot/codecs'
import { MerkleizedMetadata } from 'dedot/merkleized-metadata'
import type { InjectedSigner, SignerPayloadJSON } from 'dedot/types'
import { u8aToHex } from 'dedot/utils'

type Client = Pick<
	DedotClient,
	'metadata' | 'genesisHash' | 'runtimeVersion' | 'on'
>
type ChainInfo = { decimals: number; tokenSymbol: string }
type Reference = {
	genesisHash: string
	specVersion: number
	metadataHash: `0x${string}`
}
type Provider = {
	cloudSigner?: {
		metadata(request: unknown): Promise<{
			ok: boolean
			status: string
			reference: Reference
			message?: string
		}>
	}
}
const sessions = new WeakMap<object, ReturnType<typeof createSession>>()
const same = (a: Reference, b: Reference) =>
	a.genesisHash === b.genesisHash &&
	a.specVersion === b.specVersion &&
	a.metadataHash === b.metadataHash
function createSession(client: Client, chainInfo: ChainInfo) {
	const sync = async (payload?: SignerPayloadJSON) => {
		const provider = (
			window as unknown as { injectedWeb3?: Record<string, Provider> }
		).injectedWeb3?.['cloud-signer']
		if (!provider?.cloudSigner)
			throw new Error(
				'Cloud Signer is unavailable. Reload the page after installing it.',
			)
		const metadata = client.metadata
		const reference: Reference = {
			genesisHash: client.genesisHash,
			specVersion: client.runtimeVersion.specVersion,
			metadataHash: u8aToHex(
				new MerkleizedMetadata(metadata, chainInfo).digest(),
			),
		}
		if (
			payload &&
			(payload.mode !== 1 ||
				!payload.metadataHash ||
				!same(reference, {
					genesisHash: payload.genesisHash,
					specVersion: Number(BigInt(payload.specVersion)),
					metadataHash: payload.metadataHash,
				}))
		)
			throw new Error(
				'Runtime changed before signing. Rebuild the transaction.',
			)
		const check = (response: {
			ok: boolean
			status: string
			reference: Reference
			message?: string
		}) => {
			if (
				!response.ok ||
				!response.reference ||
				!same(reference, response.reference)
			)
				throw new Error(
					response.message || 'Cloud Signer metadata synchronization failed.',
				)
			return response.status
		}
		const status = check(
			await provider.cloudSigner.metadata({
				channel: 'cloud-signer:metadata:v1',
				method: 'lookup',
				reference,
			}),
		)
		if (status === 'missing') {
			const stored = check(
				await provider.cloudSigner.metadata({
					channel: 'cloud-signer:metadata:v1',
					method: 'provide',
					bundle: {
						reference,
						chainInfo,
						metadataHex: u8aToHex($Metadata.tryEncode(metadata)),
					},
				}),
			)
			if (stored !== 'stored' && stored !== 'cached')
				throw new Error('Cloud Signer did not cache metadata.')
		} else if (status !== 'cached')
			throw new Error('Unexpected metadata response.')
		return reference
	}
	// Wallet absence/locked-first-start is normal. Signing below always awaits sync and surfaces failures.
	const refresh = () => {
		void sync().catch(() => {})
	}
	const offConnected = client.on('connected', refresh)
	const offUpgrade = client.on('runtimeUpgraded', refresh)
	refresh()
	return {
		sync,
		stop: () => {
			offConnected()
			offUpgrade()
			sessions.delete(client)
		},
	}
}

export function startCloudMetadataSync(client: Client, chainInfo: ChainInfo) {
	let session = sessions.get(client)
	if (!session) {
		session = createSession(client, chainInfo)
		sessions.set(client, session)
	}
	return session
}

/** Used only for source === 'cloud-signer'; other wallets' options remain untouched. */
export async function prepareCloudSigner(
	client: Client,
	signer: InjectedSigner,
	chainInfo: ChainInfo,
) {
	const session = startCloudMetadataSync(client, chainInfo)
	const reference = await session.sync()
	return {
		metadataHash: reference.metadataHash,
		signer: {
			signPayload: async (payload: SignerPayloadJSON) => {
				await session.sync(payload)
				if (!signer.signPayload)
					throw new Error('Cloud Signer cannot sign transaction payloads.')
				return signer.signPayload(payload)
			},
		} satisfies InjectedSigner,
	}
}
