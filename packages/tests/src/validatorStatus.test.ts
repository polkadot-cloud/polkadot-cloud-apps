// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ServiceInterface } from 'types'
import { afterEach, expect, test, vi } from 'vitest'
import {
	syncValidatorStatus,
	validatorStatusStore,
} from '../../hooks/src/useValidators/validatorStatus'

const createService = (
	validatorExists: ServiceInterface['query']['validatorExists'],
) => ({ query: { validatorExists } }) as ServiceInterface

afterEach(() => {
	validatorStatusStore.resetSnapshot()
})

test('publishes each account result without waiting for slower accounts', async () => {
	const active = Promise.withResolvers<boolean>()
	const slow = Promise.withResolvers<boolean>()
	const query = vi.fn((address: string) =>
		address === 'active' ? active.promise : slow.promise,
	)
	const service = createService(query)
	const pending = syncValidatorStatus('polkadot', service, [
		'active',
		'slow',
		'active',
	])
	const initial = validatorStatusStore.getSnapshot()

	active.resolve(true)
	await active.promise
	const partial = validatorStatusStore.getSnapshot()
	expect(partial?.checkedAddresses).toEqual(new Set(['active']))
	expect(partial?.validators).toEqual(new Set(['active']))
	expect(initial?.checkedAddresses.size).toBe(0)

	await syncValidatorStatus('polkadot', service, ['slow', 'active'])
	expect(query).toHaveBeenCalledTimes(2)

	slow.resolve(false)
	await pending
	expect(validatorStatusStore.getSnapshot()?.checkedAddresses).toEqual(
		new Set(['active', 'slow']),
	)
	expect(validatorStatusStore.getSnapshot()?.validators).toEqual(
		new Set(['active']),
	)
	expect(partial?.checkedAddresses).toEqual(new Set(['active']))
})

test('settles failed account lookups while unrelated accounts remain pending', async () => {
	const failed = Promise.withResolvers<boolean>()
	const slow = Promise.withResolvers<boolean>()
	const service = createService((address) =>
		address === 'failed' ? failed.promise : slow.promise,
	)
	const pending = syncValidatorStatus('polkadot', service, ['failed', 'slow'])

	failed.reject(new Error('Lookup failed'))
	await failed.promise.catch(() => undefined)
	expect(validatorStatusStore.getSnapshot()?.checkedAddresses).toEqual(
		new Set(['failed']),
	)
	expect(validatorStatusStore.getSnapshot()?.validators.size).toBe(0)

	slow.resolve(true)
	await pending
	expect(validatorStatusStore.getSnapshot()?.validators).toEqual(
		new Set(['slow']),
	)
})

test.each(['network', 'service', 'accounts', 'reset'])(
	'ignores remaining results after a %s change',
	async (change) => {
		const active = Promise.withResolvers<boolean>()
		const slow = Promise.withResolvers<boolean>()
		const query = vi.fn((address: string) =>
			address === 'active' ? active.promise : slow.promise,
		)
		const service = createService(query)
		const pending = syncValidatorStatus('polkadot', service, ['active', 'slow'])
		active.resolve(true)
		await active.promise

		query.mockResolvedValue(false)
		if (change === 'reset') {
			validatorStatusStore.resetSnapshot()
		} else {
			await syncValidatorStatus(
				change === 'network' ? 'kusama' : 'polkadot',
				change === 'service' ? createService(query) : service,
				change === 'accounts' ? ['active'] : ['active', 'slow'],
			)
		}
		const current = validatorStatusStore.getSnapshot()

		slow.resolve(true)
		await pending
		expect(validatorStatusStore.getSnapshot()).toBe(current)
		expect(current?.validators.size ?? 0).toBe(0)
	},
)
