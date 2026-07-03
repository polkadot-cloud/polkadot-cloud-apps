// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCog, faStopCircle } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useHelp } from 'hooks/useHelp'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { ListStatusHeader } from 'library/List'
import { NominationList } from 'library/NominationList'
import { useTranslation } from 'react-i18next'
import type { MaybeAddress } from 'types'
import { ButtonPrimary } from 'ui-buttons'
import { ButtonRow, CardHeader } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import { Wrapper } from './Wrapper'

export const Nominations = ({
	bondFor,
	nominator,
}: {
	bondFor: 'pool' | 'nominator'
	nominator: MaybeAddress
}) => {
	const { t } = useTranslation('pages')
	const {
		activePool,
		activePoolNominations,
		isOwner: isPoolOwner,
		isNominator: isPoolNominator,
	} = useActivePool()
	const {
		modal: { openModal },
		canvas: { openCanvas },
	} = useOverlay()
	const { isBonding } = useStaking()
	const { openHelpTooltip } = useHelp()
	const { getNominations } = useBalances()
	const { formatWithPrefs } = useValidators()
	const { activeAddress } = useActiveAccount()
	const { syncing } = useSyncing(['era-stakers'])
	const { isReadOnlyAccount } = useImportedAccounts()

	// Determine if pool or nominator.
	const isPool = bondFor === 'pool'

	// Derive nominations from `bondFor` type.
	const nominated =
		bondFor === 'nominator'
			? formatWithPrefs(getNominations(activeAddress))
			: activePoolNominations
				? formatWithPrefs(activePoolNominations.targets)
				: []

	// Determine if this nominator is actually nominating.
	const isNominating = nominated?.length ?? false

	// Determine whether this is a pool that is in Destroying state & not nominating.
	const poolDestroying =
		isPool && activePool?.bondedPool?.state === 'Destroying' && !isNominating

	// Determine whether to display buttons.
	//
	// If regular staking and nominating, or if pool and account is nominator or root, display stop
	// button.
	const displayBtns =
		(!isPool && nominated.length) ||
		(isPool && (isPoolNominator() || isPoolOwner()))

	// Determine whether buttons are disabled.
	const btnsDisabled =
		(!isPool && !isBonding) ||
		(!isPool && syncing) ||
		isReadOnlyAccount(activeAddress) ||
		poolDestroying

	return (
		<Wrapper>
			<CardHeader action margin>
				<h3>
					{isPool ? t('poolNominations') : t('nominations')}
					<ButtonHelpTooltip
						marginLeft
						definition="Nominations"
						openHelp={openHelpTooltip}
					/>
				</h3>
				{displayBtns && (
					<ButtonRow>
						<ButtonPrimary
							text={t('stop')}
							size="md"
							iconLeft={faStopCircle}
							iconTransform="grow-1"
							disabled={btnsDisabled}
							onClick={() =>
								openModal({
									key: 'StopNominations',
									options: {
										nominations: [],
										bondFor,
									},
									size: 'sm',
								})
							}
						/>
						<ButtonPrimary
							text={t('manage')}
							size="md"
							iconLeft={faCog}
							iconTransform="grow-1"
							disabled={btnsDisabled}
							marginLeft
							onClick={() =>
								openCanvas({
									key: 'ManageNominations',
									scroll: false,
									options: {
										bondFor,
										nominator,
										nominated,
									},
								})
							}
						/>
					</ButtonRow>
				)}
			</CardHeader>
			{!isPool && syncing ? (
				<ListStatusHeader>{`${t('syncing')}...`}</ListStatusHeader>
			) : !nominator ? (
				<ListStatusHeader>{t('notNominating')}.</ListStatusHeader>
			) : (nominated?.length || 0) > 0 ? (
				<NominationList
					bondFor={bondFor}
					validators={nominated || []}
					nominator={nominator}
				/>
			) : poolDestroying ? (
				<ListStatusHeader>{t('poolDestroy')}</ListStatusHeader>
			) : (
				<ListStatusHeader>{t('notNominating')}.</ListStatusHeader>
			)}
		</Wrapper>
	)
}
