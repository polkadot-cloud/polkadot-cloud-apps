// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { CurrentEraPoints } from 'library/List/EraPointsGraph/CurrentEraPoints'
import { getIdentityDisplay } from 'library/List/Utils'
import { ActivityTier } from 'library/ListItem/Labels/ActivityTier'
import { BasicItem } from 'ui-app/ListItem'
import { HeaderButtonRow, LabelRow, Separator } from 'ui-core/list'
import { CopyAddress } from '../ListItem/Buttons/CopyAddress'
import { FavoriteValidator } from '../ListItem/Buttons/FavoriteValidator'
import { Metrics } from '../ListItem/Buttons/Metrics'
import { Blocked } from '../ListItem/Labels/Blocked'
import { Identity } from '../ListItem/Labels/Identity'
import { NominationStatus } from '../ListItem/Labels/NominationStatus'
import type { ItemProps } from './types'

const Basic = ({
	validator,
	nominator,
	toggleFavorites,
	bondFor,
	displayFor,
	nominationStatus,
}: ItemProps) => {
	const { validatorIdentities, validatorSupers } = useValidators()
	const { address, prefs } = validator
	const outline = displayFor === 'canvas'

	return (
		<BasicItem.Root canvas={displayFor === 'canvas'}>
			<BasicItem.Row position="top">
				<Identity address={address} />
				<div>
					<HeaderButtonRow>
						<CopyAddress address={address} />
						{toggleFavorites && (
							<FavoriteValidator address={address} outline={outline} />
						)}
						{displayFor !== 'canvas' && (
							<Metrics
								address={address}
								display={
									getIdentityDisplay(
										validatorIdentities[address],
										validatorSupers[address],
									).node
								}
								outline={outline}
							/>
						)}
					</HeaderButtonRow>
				</div>
			</BasicItem.Row>
			<Separator />
			<BasicItem.Row position="bottom" large>
				<div>
					<CurrentEraPoints address={address} displayFor={displayFor} />
				</div>
				<div>
					<LabelRow inline>
						<ActivityTier address={address} />
						<Blocked prefs={prefs} />
					</LabelRow>
					<NominationStatus
						address={address}
						bondFor={bondFor}
						nominator={nominator}
						status={nominationStatus}
						noMargin
					/>
				</div>
			</BasicItem.Row>
		</BasicItem.Root>
	)
}

export { Basic as BasicItem }
