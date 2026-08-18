// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useList } from 'contexts/List'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { CurrentEraPoints } from 'library/List/EraPointsGraph/CurrentEraPoints'
import { getIdentityDisplay } from 'library/List/Utils'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { Metrics } from 'library/ListItem/Buttons/Metrics'
import { Remove } from 'library/ListItem/Buttons/Remove'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import { APY } from 'library/ListItem/Labels/APY'
import { Quartile } from 'library/ListItem/Labels/Quartile'
import type { Validator } from 'types'
import { BasicItem } from 'ui-app/ListItem'
import { HeaderButtonRow, LabelRow, Separator } from 'ui-core/list'
import { getRateAfterCommission } from 'utils'
import { FavoriteValidator } from '../ListItem/Buttons/FavoriteValidator'
import { Select } from '../ListItem/Buttons/Select'
import { Blocked } from '../ListItem/Labels/Blocked'
import { EraStatus } from '../ListItem/Labels/EraStatus'
import { Identity } from '../ListItem/Labels/Identity'
import type { ItemProps } from './types'

const Basic = ({
	validator,
	showShareLink = true,
	toggleFavorites,
	displayFor,
	onRemove,
	rate,
}: ItemProps) => {
	const { selectable, selected } = useList()
	const { validatorIdentities, validatorSupers } = useValidators()
	const { address, prefs, validatorStatus } = validator

	const isSelected = !!selected.filter(
		(item) => (item as Validator).address === validator.address,
	).length

	const rateAfterCommission = getRateAfterCommission(rate, prefs?.commission)

	return (
		<BasicItem.Root canvas={displayFor === 'canvas'} selected={isSelected}>
			<BasicItem.Row position="top">
				{selectable && <Select item={validator} />}
				<Identity address={address} />
				<div>
					<HeaderButtonRow>
						<CopyAddress address={address} />
						{showShareLink && <ShareLink paramKey="v" paramValue={address} />}
						{toggleFavorites && <FavoriteValidator address={address} />}
						{displayFor === 'default' && (
							<Metrics
								address={address}
								display={
									getIdentityDisplay(
										validatorIdentities[address],
										validatorSupers[address],
									).node
								}
							/>
						)}
					</HeaderButtonRow>
					{typeof onRemove === 'function' && (
						<Remove
							address={address}
							onRemove={() => onRemove({ selected: [validator] })}
							displayFor={displayFor}
						/>
					)}
				</div>
			</BasicItem.Row>
			<Separator />
			<BasicItem.Row position="bottom" large>
				<div>
					<CurrentEraPoints address={address} displayFor={displayFor} />
				</div>
				<div>
					<LabelRow inline>
						<APY rate={rateAfterCommission} />
						<Quartile address={address} />
						<Blocked prefs={prefs} />
					</LabelRow>
					<EraStatus address={address} status={validatorStatus} noMargin />
				</div>
			</BasicItem.Row>
		</BasicItem.Root>
	)
}

export { Basic as BasicItem }
