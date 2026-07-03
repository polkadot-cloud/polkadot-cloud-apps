// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CardWrapper } from 'library/Card/Wrappers'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { useTranslation } from 'react-i18next'
import { Identity } from 'ui-core/base'
import { Subheading } from 'ui-core/canvas'
import { formatIdentityValue } from 'utils'
import type { OverviewSectionProps } from '../types'
import { AddressesWrapper } from '../Wrappers'

export const Addresses = ({
	bondedPool: { addresses },
}: OverviewSectionProps) => {
	const { t } = useTranslation('app')
	return (
		<CardWrapper className="canvas secondary">
			<Subheading>
				<h3>{t('addresses')}</h3>
			</Subheading>

			<AddressesWrapper>
				<section>
					<Identity
						label={'Stash'}
						value={formatIdentityValue(addresses.stash)}
						address={addresses.stash}
						Action={<CopyAddress address={addresses.stash} />}
					/>
				</section>
				<section>
					<Identity
						label={'Reward'}
						value={formatIdentityValue(addresses.reward)}
						address={addresses.reward}
						Action={<CopyAddress address={addresses.reward} />}
					/>
				</section>
			</AddressesWrapper>
		</CardWrapper>
	)
}
