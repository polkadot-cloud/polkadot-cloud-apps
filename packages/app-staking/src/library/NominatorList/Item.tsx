// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { Identity } from 'library/ListItem/Labels/Identity'
import { useTranslation } from 'react-i18next'
import { BasicItem } from 'ui-app/ListItem'
import { HeaderButtonRow, Label, LabelRow, Separator } from 'ui-core/list'
import { NominationStatus } from '../ListItem/Labels/NominationStatus'
import type { NominatorListItemProps } from './types'
import { VerticalPayoutPerformance } from './VerticalPayoutPerformance'

export const Item = ({ item, unit }: NominatorListItemProps) => {
	const { t } = useTranslation('pages')
	const address = item.address || ''
	const formattedStake = `${new BigNumber(item.stakedBalance).toFormat(3)} ${unit}`
	const tooltipText = `${t('last30DayReward')}: ${new BigNumber(
		item.incomingPayouts30d,
	)
		.decimalPlaces(3)
		.toFormat()} ${unit}`

	if (!item.address) {
		return null
	}

	return (
		<BasicItem.Root>
			<BasicItem.Row position="top">
				<Identity address={address} />
				<div>
					<HeaderButtonRow>
						<CopyAddress address={address} />
					</HeaderButtonRow>
				</div>
			</BasicItem.Row>

			<Separator />

			<BasicItem.Row position="bottom" large>
				<div>
					<VerticalPayoutPerformance
						amounts={item.performance30d}
						tooltipText={tooltipText}
					/>
				</div>
				<div>
					<LabelRow inline>
						<Label>{formattedStake}</Label>
					</LabelRow>
					<LabelRow>
						<NominationStatus
							address={address}
							bondFor={'nominator'}
							nominator={address}
							status={'active'}
							asIncoming
							noMargin
						/>
					</LabelRow>
				</div>
			</BasicItem.Row>
		</BasicItem.Root>
	)
}
