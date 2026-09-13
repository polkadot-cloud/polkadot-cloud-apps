// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorOverviews } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import { useNominationSync } from '../../app-staking/src/library/GenerateNominations/useNominationSync'

const {
	state,
	effects,
	setFetching,
	notify,
	fetchNominations,
	updateNominations,
} = vi.hoisted(() => ({
	state: {
		api: false,
		data: undefined as ValidatorOverviews | undefined,
		error: null as Error | null,
	},
	effects: [] as (() => void)[],
	setFetching: vi.fn(),
	notify: vi.fn(),
	fetchNominations: vi.fn(),
	updateNominations: vi.fn(),
}))

vi.mock('../../app-staking/node_modules/react/index.js', () => ({
	useRef: (current: unknown) => ({ current }),
	useEffect: (effect: () => void) => effects.push(effect),
}))
vi.mock(
	'../../app-staking/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useActiveAccount: () => ({ activeAddress: 'nominator' }),
	}),
)
vi.mock('contexts/ManageNominations', () => ({
	useManageNominations: () => ({
		defaultNominations: [],
		fetching: true,
		method: 'Optimal Selection',
		nominations: [],
		setFetching,
	}),
}))
vi.mock('contexts/Validators/ValidatorEntries', () => ({
	useValidators: () => ({
		getValidators: () => [{ address: 'validator' }],
		validatorsFetched: 'synced',
	}),
}))
vi.mock('../../hooks/src/useApi', () => ({ useApi: () => ({ isReady: true }) }))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/usePlugins', () => ({
	usePlugins: () => ({ pluginEnabled: () => state.api }),
}))
vi.mock('../../global-bus/src/index', () => ({ emitNotification: notify }))
vi.mock('../../data-gate/src/index', () => ({
	useValidatorOverviews: () => state,
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)

beforeEach(() => {
	vi.clearAllMocks()
	effects.length = 0
	state.api = false
	state.data = undefined
	state.error = null
	fetchNominations.mockResolvedValue([])
})

const generate = () => {
	useNominationSync({ fetchNominations, updateNominations })
	// Run the generation effect; viewport and initial-nomination effects are unrelated.
	effects[2]()
}

test('node nomination generation waits for its overview prerequisite', () => {
	generate()
	expect(fetchNominations).not.toHaveBeenCalled()
	expect(setFetching).not.toHaveBeenCalled()
})

test('a failed overview prerequisite ends nomination generation with an error', () => {
	state.error = new Error('offline')
	generate()
	expect(fetchNominations).not.toHaveBeenCalled()
	expect(setFetching).toHaveBeenCalledWith(false)
	expect(notify).toHaveBeenCalledTimes(1)
})

test.each([true, false])(
	'API=%s can generate with a failed unused or cached overview query',
	async (api) => {
		state.api = api
		state.data = api ? undefined : new Map()
		state.error = new Error('refresh failed')
		generate()
		await vi.waitFor(() => expect(setFetching).toHaveBeenCalledWith(false))
		expect(fetchNominations).toHaveBeenCalledTimes(1)
		expect(updateNominations).toHaveBeenCalledWith([])
		expect(notify).not.toHaveBeenCalled()
	},
)
