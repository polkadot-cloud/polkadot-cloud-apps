// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test, vi } from 'vitest'
import { useFillVariables } from '../../app-staking/src/hooks/useFillVariables'

const { state } = vi.hoisted(() => ({ state: { minimumActiveStake: 0n } }))

vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({
		getConsts: () => ({ maxExposurePageSize: 512 }),
		getChainSpec: () => ({ existentialDeposit: 10_000_000_000n }),
		poolsConfig: {
			minJoinBond: 10_000_000_000n,
			minCreateBond: 10_000_000_000n,
		},
	}),
}))
vi.mock('../../hooks/src/useStakingMetrics', () => ({
	useStakingMetrics: () => ({
		minimumActiveStake: state.minimumActiveStake,
		minNominatorBond: 10_000_000_000n,
	}),
}))
vi.mock('../../hooks/src/useErasPerDay', () => ({
	useErasPerDay: () => ({ maxSupportedDays: 30 }),
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChain: () => 'statemint',
	getRelayChainData: () => ({ name: 'polkadot' }),
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))

test.each([
	[0n, '1'],
	[15_000_000_000n, '1.5'],
	[1_000_000_000_000_000_000_000n, '100,000,000,000'],
] as const)(
	'renders a %s planck minimum stake without collapsing to zero',
	(stake, expected) => {
		state.minimumActiveStake = stake
		expect(
			useFillVariables().fillVariables(
				{ text: '{MIN_ACTIVE_STAKE} {NETWORK_UNIT}' },
				['text'],
			),
		).toEqual({ text: `${expected} DOT` })
	},
)
