// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { usePayouts } from 'hooks/usePayouts'
import type { Ref } from 'react'
import { Fragment, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Notes, Padding } from 'ui-core/modal'
import { Item } from './Item'
import type { OverviewProps } from './types'
import { ContentWrapper } from './Wrappers'

export const Overview = forwardRef(
	({ setSection, setPayouts }: OverviewProps, ref: Ref<HTMLDivElement>) => {
		const { t } = useTranslation('modals')
		const { unclaimedRewards } = usePayouts()

		return (
			<ContentWrapper>
				<Padding horizontalOnly ref={ref}>
					{unclaimedRewards.entries.map(({ era, reward, validators }) =>
						new BigNumber(reward).isZero() ? (
							<Fragment key={`unclaimed_payout_${era}`} />
						) : (
							<Item
								key={`unclaimed_payout_${era}`}
								era={String(era)}
								validators={validators}
								setPayouts={setPayouts}
								setSection={setSection}
							/>
						),
					)}
					<Notes withPadding>
						<p>{t('claimsOnBehalf')}</p>
						<p>{t('notToClaim')}</p>
					</Notes>
				</Padding>
			</ContentWrapper>
		)
	},
)

Overview.displayName = 'Overview'
