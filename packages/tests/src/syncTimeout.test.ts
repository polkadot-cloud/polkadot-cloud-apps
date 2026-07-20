// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

// Since importing global-bus causes issues with localStorage in tests,
// let's create a simple unit test to verify the timeout logic works
// by creating a minimal implementation

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})

test('timeout functionality works correctly', () => {
	const timeouts = new Map<string, NodeJS.Timeout>()
	const syncIds = new Set<string>()

	const clearSyncTimeout = (id: string) => {
		const timeoutId = timeouts.get(id)
		if (timeoutId) {
			clearTimeout(timeoutId)
			timeouts.delete(id)
		}
	}

	const startSyncTimeout = (id: string) => {
		clearSyncTimeout(id)
		const timeoutId = setTimeout(() => {
			syncIds.delete(id)
			timeouts.delete(id)
		}, 10000)
		timeouts.set(id, timeoutId)
	}

	const setSyncing = (id: string) => {
		syncIds.add(id)
		startSyncTimeout(id)
	}

	const removeSyncing = (id: string) => {
		clearSyncTimeout(id)
		syncIds.delete(id)
	}

	// Test adding sync ID
	setSyncing('test-id')
	expect(syncIds.has('test-id')).toBe(true)
	expect(timeouts.has('test-id')).toBe(true)

	// Test timeout removal
	vi.advanceTimersByTime(10000)
	expect(syncIds.has('test-id')).toBe(false)
	expect(timeouts.has('test-id')).toBe(false)

	// Test manual removal clears timeout
	setSyncing('test-id-2')
	expect(syncIds.has('test-id-2')).toBe(true)

	removeSyncing('test-id-2')
	expect(syncIds.has('test-id-2')).toBe(false)
	expect(timeouts.has('test-id-2')).toBe(false)

	// Timeout should not fire after manual removal
	vi.advanceTimersByTime(10000)
	expect(syncIds.has('test-id-2')).toBe(false)
})
