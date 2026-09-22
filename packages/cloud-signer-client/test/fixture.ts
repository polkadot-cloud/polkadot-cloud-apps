// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// Shared synthetic test layout adapted from Cloud Signer; never a real chain.

import { $Metadata, Metadata } from 'dedot/codecs'
import { MerkleizedMetadata } from 'dedot/merkleized-metadata'
import * as $ from 'dedot/shape'
import type { SignerPayloadJSON } from 'dedot/types'
import { u8aToHex } from 'dedot/utils'

/** Small, valid SCALE fixture. It is not a real chain or a spendable transaction. */
export function fixture(
	specVersion = 1,
	ss58Prefix = 42,
	withHash = true,
	forSigning = false,
) {
	const primitive = (
		id: number,
		kind: 'u8' | 'u16' | 'u32' | 'u128' | 'str',
	) => ({
		id,
		path: [],
		params: [],
		docs: [],
		typeDef: { type: 'Primitive' as const, value: { kind } },
	})
	const field = (name: string, typeId: number) => ({
		name,
		typeId,
		typeName: undefined,
		docs: [],
	})
	const metadata = new Metadata(0x6174656d, {
		type: 'V15',
		value: {
			types: [
				primitive(0, 'u8'),
				primitive(1, 'u32'),
				primitive(2, 'str'),
				primitive(3, 'u16'),
				{
					id: 4,
					path: ['RuntimeVersion'],
					params: [],
					docs: [],
					typeDef: {
						type: 'Struct',
						value: {
							fields: [
								field('spec_name', 2),
								field('spec_version', 1),
								field('transaction_version', 1),
							],
						},
					},
				},
				{
					id: 5,
					path: ['RuntimeCall'],
					params: [],
					docs: [],
					typeDef: {
						type: 'Enum',
						value: {
							members: [
								{
									name: 'Remark',
									index: 0,
									fields: [field('remark', 9)],
									docs: [],
								},
							],
						},
					},
				},
				{
					id: 6,
					path: forSigning ? ['sp_core', 'crypto', 'AccountId32'] : [],
					params: [],
					docs: [],
					typeDef: { type: 'SizedVec', value: { len: 32, typeParam: 0 } },
				},
				{
					id: 7,
					path: ['Option'],
					params: [],
					docs: [],
					typeDef: {
						type: 'Enum',
						value: {
							members: [
								{ name: 'None', index: 0, fields: [], docs: [] },
								{
									name: 'Some',
									index: 1,
									fields: [
										{
											name: undefined,
											typeId: 6,
											typeName: undefined,
											docs: [],
										},
									],
									docs: [],
								},
							],
						},
					},
				},
				{
					id: 8,
					path: ['Mode'],
					params: [],
					docs: [],
					typeDef: {
						type: 'Enum',
						value: {
							members: [
								{ name: 'Disabled', index: 0, fields: [], docs: [] },
								{ name: 'Enabled', index: 1, fields: [], docs: [] },
							],
						},
					},
				},
				{
					id: 9,
					path: [],
					params: [],
					docs: [],
					typeDef: { type: 'Sequence', value: { typeParam: 0 } },
				},
				{
					id: 10,
					path: [],
					params: [],
					docs: [],
					typeDef: { type: 'SizedVec', value: { len: 64, typeParam: 0 } },
				},
				{
					id: 11,
					path: [],
					params: [],
					docs: [],
					typeDef: { type: 'Tuple', value: { fields: [] } },
				},
				{
					id: 12,
					path: [],
					params: [],
					docs: [],
					typeDef: { type: 'Struct', value: { fields: [field('mode', 8)] } },
				},
				{
					id: 13,
					path: [],
					params: [],
					docs: [],
					typeDef: { type: 'Compact', value: { typeParam: 1 } },
				},
				{
					id: 14,
					path: ['sp_runtime', 'generic', 'era', 'Era'],
					params: [],
					docs: [],
					typeDef: {
						type: 'Enum',
						value: {
							members: [
								{ name: 'Immortal', index: 0, fields: [], docs: [] },
								{
									name: 'Mortal',
									index: 1,
									fields: [
										{ ...field('first', 0), name: undefined },
										{ ...field('second', 0), name: undefined },
									],
									docs: [],
								},
							],
						},
					},
				},
				{
					id: 15,
					path: ['RuntimeCall'],
					params: [],
					docs: [],
					typeDef: {
						type: 'Enum',
						value: {
							members: [
								{
									name: 'System',
									index: 0,
									fields: [{ ...field('call', 5), name: undefined }],
									docs: [],
								},
							],
						},
					},
				},
				primitive(16, 'u128'),
				{
					id: 17,
					path: [],
					params: [],
					docs: [],
					typeDef: { type: 'Compact', value: { typeParam: 16 } },
				},
				{
					id: 18,
					path: ['sp_runtime', 'MultiSignature'],
					params: [],
					docs: [],
					typeDef: {
						type: 'Enum',
						value: {
							members: ['Ed25519', 'Sr25519', 'Ecdsa'].map((name, index) => ({
								name,
								index,
								fields: [
									{
										...field('signature', index === 2 ? 19 : 10),
										name: undefined,
									},
								],
								docs: [],
							})),
						},
					},
				},
				{
					id: 19,
					path: [],
					params: [],
					docs: [],
					typeDef: { type: 'SizedVec', value: { len: 65, typeParam: 0 } },
				},
			],
			pallets: [
				{
					name: 'System',
					index: 0,
					storage: undefined,
					calls: 5,
					event: undefined,
					error: undefined,
					docs: [],
					constants: [
						{
							name: 'Version',
							typeId: 4,
							value: u8aToHex(
								$.Struct({
									specName: $.str,
									specVersion: $.u32,
									transactionVersion: $.u32,
								}).encode({
									specName: 'fixture',
									specVersion,
									transactionVersion: 1,
								}),
							),
							docs: [],
						},
						{
							name: 'SS58Prefix',
							typeId: 3,
							value: u8aToHex($.u16.encode(ss58Prefix)),
							docs: [],
						},
					],
				},
			],
			extrinsic: {
				version: 4,
				addressTypeId: 6,
				callTypeId: forSigning ? 15 : 5,
				signatureTypeId: forSigning ? 18 : 10,
				extraTypeId: 11,
				signedExtensions: forSigning
					? [
							{ ident: 'CheckSpecVersion', typeId: 11, additionalSigned: 1 },
							{ ident: 'CheckTxVersion', typeId: 11, additionalSigned: 1 },
							{ ident: 'CheckGenesis', typeId: 11, additionalSigned: 6 },
							{ ident: 'CheckMortality', typeId: 14, additionalSigned: 6 },
							{ ident: 'CheckNonce', typeId: 13, additionalSigned: 11 },
							{
								ident: 'ChargeTransactionPayment',
								typeId: 17,
								additionalSigned: 11,
							},
							{ ident: 'CheckMetadataHash', typeId: 12, additionalSigned: 7 },
						]
					: withHash
						? [{ ident: 'CheckMetadataHash', typeId: 8, additionalSigned: 7 }]
						: [],
			},
			runtimeType: 11,
			apis: [],
			outerEnums: {
				callEnumTypeId: forSigning ? 15 : 5,
				eventEnumTypeId: 5,
				errorEnumTypeId: 5,
			},
			custom: { map: new Map() },
		},
	})
	const metadataHex = u8aToHex($Metadata.encode(metadata))
	const chainInfo = { decimals: 10, tokenSymbol: 'TEST' }
	const metadataHash = withHash
		? u8aToHex(new MerkleizedMetadata(metadata, chainInfo).digest())
		: (`0x${'00'.repeat(32)}` as const)
	return {
		reference: {
			genesisHash: `0x${'11'.repeat(32)}`,
			specVersion,
			metadataHash,
		},
		metadataHex,
		chainInfo,
	}
}

export function payload(bundle: ReturnType<typeof fixture>): SignerPayloadJSON {
	return {
		address: 'demo',
		blockHash: `0x${'22'.repeat(32)}`,
		blockNumber: '0x01',
		era: '0x00',
		genesisHash: bundle.reference.genesisHash,
		metadataHash: bundle.reference.metadataHash,
		method: '0x0000',
		mode: 1,
		nonce: '0x00',
		specVersion: `0x${bundle.reference.specVersion.toString(16)}`,
		tip: '0x00',
		transactionVersion: '0x01',
		signedExtensions: ['CheckMetadataHash'],
		version: 4,
	}
}
