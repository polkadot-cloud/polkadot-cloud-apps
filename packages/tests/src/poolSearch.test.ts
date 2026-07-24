// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { BondedPool } from 'types'
import { poolSearchFilter } from 'utils'
import { expect, test } from 'vitest'

// Mock pool data for testing
const mockPools: BondedPool[] = [
	{
		id: 123,
		addresses: { stash: 'ksm123stash', reward: 'ksm123reward' },
	} as BondedPool,
	{
		id: 456,
		addresses: { stash: 'ksm456stash', reward: 'ksm456reward' },
	} as BondedPool,
	{
		id: 789,
		addresses: { stash: 'ksm789stash', reward: 'ksm789reward' },
	} as BondedPool,
]

const mockPoolsMetaData: Record<number, string> = {
	123: 'Cool Pool Name',
	456: 'Another Pool',
	789: 'Test Pool 789',
}

test('pool search by exact number should work', () => {
	const result = poolSearchFilter(mockPools, '123', mockPoolsMetaData)
	expect(result.length).toBe(1)
	expect(result[0].id).toBe(123)
})

test('pool search by "Pool X" format should work', () => {
	const result = poolSearchFilter(mockPools, 'Pool 123', mockPoolsMetaData)
	expect(result.length).toBe(1)
	expect(result[0].id).toBe(123)
})

test('pool search by "pool X" format (lowercase) should work', () => {
	const result = poolSearchFilter(mockPools, 'pool 456', mockPoolsMetaData)
	expect(result.length).toBe(1)
	expect(result[0].id).toBe(456)
})

test('pool search by hash + numbers should work', () => {
	const result = poolSearchFilter(mockPools, '#123', mockPoolsMetaData)
	expect(result.length).toBe(1)
	expect(result[0].id).toBe(123)
})

test('pool search by metadata should work', () => {
	const result = poolSearchFilter(mockPools, 'Cool Pool', mockPoolsMetaData)
	expect(result.length).toBe(1)
	expect(result[0].id).toBe(123)
})

test('pool search by address should work', () => {
	const result = poolSearchFilter(mockPools, 'ksm456', mockPoolsMetaData)
	expect(result.length).toBe(1)
	expect(result[0].id).toBe(456)
})

test('pool search by partial number should work', () => {
	const result = poolSearchFilter(mockPools, '12', mockPoolsMetaData)
	expect(result.length).toBe(1)
	expect(result[0].id).toBe(123)
})

test('pool search should not return duplicates', () => {
	// Search for something that might match both ID and metadata
	const result = poolSearchFilter(mockPools, '789', mockPoolsMetaData)
	expect(result.length).toBe(1)
	expect(result[0].id).toBe(789)
})

test('pool search should return empty array for no matches', () => {
	const result = poolSearchFilter(mockPools, 'nonexistent', mockPoolsMetaData)
	expect(result.length).toBe(0)
})
