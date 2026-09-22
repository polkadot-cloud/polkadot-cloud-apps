// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { $Metadata } from 'dedot/codecs'
import { prepareCloudSigner, startCloudMetadataSync } from '../src/index.ts'
import { fixture, payload } from './fixture.ts'

test('Cloud Apps syncs at connection/upgrade, rechecks before signing, and rejects stale payloads', async () => {
	const bundle = fixture()
	const listeners = new Map<string, Set<() => void>>()
	const client = {
		metadata: $Metadata.tryDecode(bundle.metadataHex),
		genesisHash: bundle.reference.genesisHash,
		runtimeVersion: { specVersion: 1 },
		on(event: string, callback: () => void) {
			const set = listeners.get(event) ?? new Set()
			set.add(callback)
			listeners.set(event, set)
			return () => set.delete(callback)
		},
	} as unknown as Parameters<typeof startCloudMetadataSync>[0]
	const cached = new Set<string>()
	let provides = 0
	let lookups = 0
	let signed = 0
	const transport = async (request: {
		method: string
		reference?: typeof bundle.reference
		bundle?: typeof bundle
	}) => {
		const reference = request.reference ?? request.bundle?.reference
		assert.ok(reference)
		const key = JSON.stringify(reference)
		if (request.method === 'provide') {
			provides++
			cached.add(key)
			return { ok: true, reference, status: 'stored' }
		}
		lookups++
		return {
			ok: true,
			reference,
			status: cached.has(key) ? 'cached' : 'missing',
		}
	}
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			injectedWeb3: {
				'cloud-signer': { cloudSigner: { metadata: transport } },
			},
		},
	})
	const session = startCloudMetadataSync(client, bundle.chainInfo)
	try {
		await session.sync()
		assert.ok(provides >= 1)
		const before = provides
		for (const fn of listeners.get('connected') ?? []) fn()
		await new Promise((resolve) => setImmediate(resolve))
		assert.equal(provides, before)
		const signer = {
			signPayload: async () => {
				signed++
				return { id: 1, signature: '0x00' as const }
			},
		}
		const cloud = await prepareCloudSigner(client, signer, bundle.chainInfo)
		assert.equal(cloud.metadataHash, bundle.reference.metadataHash)
		const beforeSigning = lookups
		await cloud.signer.signPayload(payload(bundle))
		assert.ok(lookups > beforeSigning)
		assert.equal(signed, 1)
		cached.clear()
		await cloud.signer.signPayload(payload(bundle))
		assert.ok(provides > before)
		const next = fixture(2)
		Object.defineProperty(client, 'metadata', {
			value: $Metadata.tryDecode(next.metadataHex),
			configurable: true,
		})
		Object.defineProperty(client, 'runtimeVersion', {
			value: { specVersion: 2 },
			configurable: true,
		})
		for (const fn of listeners.get('runtimeUpgraded') ?? []) fn()
		await new Promise((resolve) => setImmediate(resolve))
		assert.equal(
			(await session.sync()).metadataHash,
			next.reference.metadataHash,
		)
		await assert.rejects(
			() => cloud.signer.signPayload(payload(bundle)),
			/Runtime changed/,
		)
		assert.equal(signed, 2, 'stale payload must never reach the signer')
		assert.equal('signRaw' in cloud.signer, false)
	} finally {
		session.stop()
		Reflect.deleteProperty(globalThis, 'window')
	}
	assert.equal(listeners.get('runtimeUpgraded')?.size, 0)
})
