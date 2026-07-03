// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { Identity } from 'library/ListItem/Labels/Identity'
import { Wrapper } from 'library/ListItem/Wrappers'
import { HeaderButtonRow, Label, LabelRow, Separator } from 'ui-core/list'
import { NominationStatus } from '../ListItem/Labels/NominationStatus'
import type { NominatorListItemProps } from './types'
import { VerticalPayoutPerformance } from './VerticalPayoutPerformance'

export const Item = ({ item, unit }: NominatorListItemProps) => {
	const address = item.address || ''
	const formattedStake = `${new BigNumber(item.stakedBalance).toFormat(3)} ${unit}`

	if (!item.address) {
		return null
	}

	return (
		<Wrapper>
			<div className="inner default">
				<div className="row top">
					<Identity address={address} />
					<div>
						<HeaderButtonRow>
							<CopyAddress address={address} />
						</HeaderButtonRow>
					</div>
				</div>

				<Separator />

				<div className="row bottom lg">
					<div>
						<VerticalPayoutPerformance amounts={item.performance30d} />
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
				</div>
			</div>
		</Wrapper>
	)
}
