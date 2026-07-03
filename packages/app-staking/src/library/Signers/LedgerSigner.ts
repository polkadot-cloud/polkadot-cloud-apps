// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Ledger } from '@polkadot-cloud/connect-ledger'
import type { ExtraSignedExtension, SubmittableExtrinsic } from 'dedot'
import { MerkleizedMetadata } from 'dedot/merkleized-metadata'
import type { PayloadOptions } from 'dedot/types'
import type { HexString } from 'dedot/utils'
import { hexToU8a, u8aToHex } from 'dedot/utils'

export const signLedgerPayload = async (
	specName: string,
	from: string,
	extraSignedExtension: (
		specName: string,
		signerAddress: string,
		payloadOptions?: PayloadOptions,
	) => ExtraSignedExtension | undefined,
	tx: SubmittableExtrinsic,
	metadata: HexString,
	info: {
		decimals: number
		tokenSymbol: string
		specName: string
		specVersion: number
		ss58: number
	},
	index: number,
) => {
	const { app } = await Ledger.initialise()

	const merkleizer = new MerkleizedMetadata(metadata, {
		decimals: info.decimals,
		tokenSymbol: info.tokenSymbol,
	})
	const extra = extraSignedExtension(specName, from, {
		metadataHash: u8aToHex(merkleizer.digest()),
	})
	if (!extra) {
		return
	}
	await extra.init()

	const toSign = extra.toRawPayload(tx.callHex).data
	const proof = merkleizer.proofForExtrinsicPayload(toSign as HexString)

	const result = await Ledger.signPayload(app, index, hexToU8a(toSign), proof)
	return { signature: u8aToHex(result.signature), data: extra.data }
}
