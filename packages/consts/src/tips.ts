// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TipConfig } from 'types'

export const TipsConfigSimple: TipConfig[] = [
	{
		id: 'connectExtensions',
		s: 1,
	},
	{
		id: 'recommendedNominator',
		s: 2,
		page: 'stake',
	},
	{
		id: 'recommendedJoinPool',
		s: 3,
		page: 'stake',
	},
	{
		id: 'managingNominations',
		s: 5,
		page: 'stake',
	},
	{
		id: 'monitoringPool',
		s: 6,
		page: 'stake',
	},
	{
		id: 'joinAnotherPool',
		s: 6,
		page: 'stake',
	},
	{
		id: 'switchPool',
		s: 9,
		page: 'stake',
	},
	{
		id: 'keepPoolNominating',
		s: 7,
		page: 'stake',
	},
	{
		id: 'reviewingPayouts',
		s: 8,
		page: 'rewards',
	},
]

export const TipsConfigAdvanced: TipConfig[] = [
	{
		id: 'connectExtensions',
		s: 1,
	},
	{
		id: 'recommendedNominator',
		s: 2,
		page: 'nominate',
	},
	{
		id: 'recommendedJoinPool',
		s: 3,
		page: 'pool',
	},
	{
		id: 'howToStake',
		s: 4,
	},
	{
		id: 'managingNominations',
		s: 5,
		page: 'nominate',
	},
	{
		id: 'monitoringPool',
		s: 6,
		page: 'pool',
	},
	{
		id: 'joinAnotherPool',
		s: 6,
		page: 'pool',
	},
	{
		id: 'switchPool',
		s: 9,
		page: 'pool',
	},
	{
		id: 'keepPoolNominating',
		s: 7,
		page: 'pool',
	},
	{
		id: 'reviewingPayouts',
		s: 8,
		page: 'rewards',
	},
	{
		id: 'understandingValidatorPerformance',
		s: 8,
		page: 'validators',
	},
]
