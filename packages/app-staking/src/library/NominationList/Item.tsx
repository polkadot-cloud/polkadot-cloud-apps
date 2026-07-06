// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { usePlugins } from 'hooks/usePlugins'
import { CurrentEraPoints } from 'library/List/EraPointsGraph/CurrentEraPoints'
import { getIdentityDisplay } from 'library/List/Utils'
import { APY } from 'library/ListItem/Labels/APY'
import { Quartile } from 'library/ListItem/Labels/Quartile'
import { Wrapper } from 'library/ListItem/Wrappers'
import { HeaderButtonRow, LabelRow, Separator } from 'ui-core/list'
import { HistoricalEraPoints } from '../List/EraPointsGraph/HistoricalEraPoints'
import { CopyAddress } from '../ListItem/Buttons/CopyAddress'
import { FavoriteValidator } from '../ListItem/Buttons/FavoriteValidator'
import { Metrics } from '../ListItem/Buttons/Metrics'
import { Blocked } from '../ListItem/Labels/Blocked'
import { Commission } from '../ListItem/Labels/Commission'
import { Identity } from '../ListItem/Labels/Identity'
import { NominationStatus } from '../ListItem/Labels/NominationStatus'
import type { ItemProps } from './types'

export const Item = ({
	validator,
	nominator,
	toggleFavorites,
	bondFor,
	displayFor,
	nominationStatus,
	eraPoints,
	rate,
}: ItemProps) => {
	const { pluginEnabled } = usePlugins()
	const { validatorIdentities, validatorSupers } = useValidators()
	const { address, prefs } = validator
	const commission = prefs?.commission ?? null

	// Whether buttons should be styled as outline.
	const outline = displayFor === 'canvas'

	// Rate after commission
	const rateAfterCommission =
		typeof rate === 'number' &&
		!isNaN(rate) &&
		typeof commission === 'number' &&
		!isNaN(commission)
			? rate * (1 - commission / 100)
			: undefined

	return (
		<Wrapper>
			<div className={`inner ${displayFor}`}>
				<div className="row top">
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
				</div>
				<Separator />
				<div className="row bottom lg">
					<div>
						{pluginEnabled('staking_api') ? (
							<HistoricalEraPoints
								address={address}
								displayFor={displayFor}
								eraPoints={eraPoints}
							/>
						) : (
							<CurrentEraPoints address={address} displayFor={displayFor} />
						)}
					</div>
					<div>
						<LabelRow inline>
							<APY rate={rateAfterCommission} />
							<Quartile address={address} />
							<Blocked prefs={prefs} />
							<Commission commission={commission} />
						</LabelRow>
						<NominationStatus
							address={address}
							bondFor={bondFor}
							nominator={nominator}
							status={nominationStatus}
							noMargin
						/>
					</div>
				</div>
			</div>
		</Wrapper>
	)
}
