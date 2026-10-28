// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { it } from 'node:test'
import * as codecs from 'dedot/codecs'
import * as merkleized from 'dedot/merkleized-metadata'
import * as shape from 'dedot/shape'
import { u8aToHex } from 'dedot/utils'

const require = createRequire(import.meta.url)

for (const [
	format,
	{ $Metadata, Metadata, MAGIC_NUMBER },
	{ MerkleizedMetadata },
	$,
] of [
	['ESM', codecs, merkleized, shape],
	[
		'CJS',
		require('dedot/codecs'),
		require('dedot/merkleized-metadata'),
		require('dedot/shape'),
	],
]) {
	it(`${format} cached V16 metadata produces the same V4 Ledger digest and proof as V15`, () => {
		const field = (name, typeId) => ({
			name,
			typeId,
			typeName: undefined,
			docs: [],
		})
		const types = [
			{ type: 'Tuple', value: { fields: [] } },
			{ type: 'Primitive', value: { kind: 'u8' } },
			{ type: 'Primitive', value: { kind: 'u32' } },
			{ type: 'Primitive', value: { kind: 'str' } },
			{
				type: 'Struct',
				value: { fields: [field('spec_name', 3), field('spec_version', 2)] },
			},
			{
				type: 'Enum',
				value: {
					members: [
						{
							name: 'Transfer',
							index: 0,
							fields: [field(undefined, 2)],
							docs: [],
						},
					],
				},
			},
			// Reachable only from a V5 extension; it must not change the V4 digest.
			{ type: 'Struct', value: { fields: [field('signature', 1)] } },
		].map((typeDef, id) => ({ id, path: [], params: [], docs: [], typeDef }))
		const v15 = new Metadata(MAGIC_NUMBER, {
			type: 'V15',
			value: {
				types,
				pallets: [
					{
						name: 'System',
						index: 0,
						docs: [],
						constants: [
							{
								name: 'Version',
								typeId: 4,
								value: u8aToHex(
									$.Struct({ specName: $.str, specVersion: $.u32 }).encode({
										specName: 'asset-hub-polkadot',
										specVersion: 42,
									}),
								),
								docs: [],
							},
							{
								name: 'SS58Prefix',
								typeId: 2,
								value: u8aToHex($.u32.encode(0)),
								docs: [],
							},
						],
					},
				],
				extrinsic: {
					version: 4,
					addressTypeId: 1,
					callTypeId: 5,
					signatureTypeId: 1,
					extraTypeId: 1,
					signedExtensions: [
						{ ident: 'CheckNonce', typeId: 1, additionalSigned: 0 },
						{ ident: 'CheckSpecVersion', typeId: 0, additionalSigned: 2 },
					],
				},
				runtimeType: 0,
				apis: [],
				outerEnums: {
					callEnumTypeId: 5,
					eventEnumTypeId: 0,
					errorEnumTypeId: 0,
				},
				custom: { map: new Map() },
			},
		})
		const v16 = new Metadata(MAGIC_NUMBER, {
			type: 'V16',
			value: {
				...v15.latest,
				extrinsic: {
					...v15.latest.extrinsic,
					versions: [4, 5],
					signedExtensionsByVersion: new Map([
						[0, [1, 0]],
						[1, [2, 0, 1]],
					]),
					signedExtensions: [
						v15.latest.extrinsic.signedExtensions[1],
						v15.latest.extrinsic.signedExtensions[0],
						{ ident: 'V5Only', typeId: 6, additionalSigned: 0 },
					],
				},
			},
		})
		const info = { decimals: 10, tokenSymbol: 'DOT' }
		const payload = $.Tuple($.u8, $.u32, $.u8, $.u32).encode([0, 99, 7, 42])
		const original = new MerkleizedMetadata(v15, info)
		// Match the hook: serialize the client's cached Metadata for the hex-only signer API.
		for (const cached of [v15, v16]) {
			const hex = u8aToHex($Metadata.tryEncode(cached))
			assert.equal($Metadata.tryDecode(hex).version, cached.version)
			const signerMetadata = new MerkleizedMetadata(hex, info)
			assert.deepEqual(signerMetadata.digest(), original.digest())
			assert.deepEqual(
				signerMetadata.proofForExtrinsicPayload(payload),
				original.proofForExtrinsicPayload(payload),
			)
		}
	})
}
