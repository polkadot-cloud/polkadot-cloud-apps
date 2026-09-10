// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { describe, it } from 'node:test'
import * as dedot from 'dedot'
import * as codecs from 'dedot/codecs'

const require = createRequire(import.meta.url)

// Exercise both published entrypoints: apps use ESM, tooling may use CJS.
for (const [format, api, { PortableRegistry }] of [
	['ESM', dedot, codecs],
	['CJS', require('dedot'), require('dedot/codecs')],
]) {
	describe(`${format} signed extension selection`, () => {
		const makeExtension = (indexes = [1, 0]) => {
			const types = [
				{ type: 'Tuple', value: { fields: [] } },
				{ type: 'Primitive', value: { kind: 'u8' } },
				{ type: 'Primitive', value: { kind: 'u32' } },
			].map((typeDef, id) => ({ id, path: [], params: [], docs: [], typeDef }))
			const registry = new PortableRegistry({
				types,
				extrinsic: {
					versions: [4, 5],
					signedExtensionsByVersion: new Map([
						[0, indexes],
						[1, [2, 0, 1]],
					]),
					signedExtensions: [
						{ ident: 'First', typeId: 1, additionalSigned: 1 },
						{ ident: 'Second', typeId: 2, additionalSigned: 2 },
						// Like Asset Hub metadata V16: only the other extension set needs this.
						{ ident: 'VerifyMultiSignature', typeId: 1, additionalSigned: 0 },
					],
				},
			})
			class First extends api.SignedExtension {
				async init() {
					this.data = 7
					this.additionalSigned = 11
				}
				async fromPayload() {
					await this.init()
				}
			}
			class Second extends api.SignedExtension {
				async init() {
					this.data = 9
					this.additionalSigned = 13
				}
				async fromPayload() {
					await this.init()
				}
			}
			const extension = new api.ExtraSignedExtension(
				{ registry, options: { signedExtensions: { First, Second } } },
				{ signerAddress: 'test-account' },
			)
			return { extension, registry }
		}

		for (const method of ['init', 'fromPayload']) {
			it(`${method} selects and orders only version-zero extensions and their signing bytes`, async () => {
				const { extension } = makeExtension()
				await extension[method]({})
				assert.deepEqual(extension.toPayload().signedExtensions, [
					'Second',
					'First',
				])
				assert.equal(extension.toPayload().version, 4)
				assert.deepEqual(extension.data, [9, 7])
				assert.deepEqual(extension.additionalSigned, [13, 11])
				assert.deepEqual(
					Array.from(extension.$Data.tryEncode(extension.data)),
					[9, 0, 0, 0, 7],
				)
				assert.deepEqual(
					Array.from(
						extension.$AdditionalSigned.tryEncode(extension.additionalSigned),
					),
					[13, 0, 0, 0, 11],
				)
			})
		}

		it('preserves the single extension set produced by older metadata conversion', async () => {
			const { extension, registry } = makeExtension([0, 1])
			registry.metadata.extrinsic.versions = [4]
			registry.metadata.extrinsic.signedExtensionsByVersion.delete(1)
			registry.metadata.extrinsic.signedExtensions.pop()
			await extension.init()
			assert.deepEqual(extension.toPayload().signedExtensions, [
				'First',
				'Second',
			])
		})

		it('still rejects unsupported extensions when they belong to the selected set', async () => {
			const { extension } = makeExtension([2, 0, 1])
			await assert.rejects(
				extension.init(),
				/SignedExtension for VerifyMultiSignature/,
			)
		})

		it('fails closed when extension version zero is missing', async () => {
			const { extension, registry } = makeExtension()
			registry.metadata.extrinsic.signedExtensionsByVersion.delete(0)
			await assert.rejects(
				extension.init(),
				/No signed extensions found for extension version 0/,
			)
		})
	})
}
