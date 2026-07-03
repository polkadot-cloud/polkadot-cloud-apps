// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBolt, faCog, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useNominatorSetups } from 'contexts/NominatorSetups'
import { Title } from 'library/Modal/Title'
import { useTranslation } from 'react-i18next'
import { Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { ItemsWrapper, ItemWrapper } from './Wrappers'

export const StakingOptions = () => {
	const { t } = useTranslation()
	const { openCanvas } = useOverlay().canvas
	const { openModal, closeModal, config } = useOverlay().modal
	const { activeAddress } = useActiveAccount()
	const { setNominatorSetup, removeNominatorSetup, generateOptimalSetup } =
		useNominatorSetups()

	// Display options either for a nominator, or for a simple mode other options
	const contexts = ['nominator_only', 'simple_other_options']
	const context = config.options?.context || contexts[0]

	// Set title based on context
	const title =
		context === 'nominator_only'
			? t('startNominating', { ns: 'pages' })
			: t('stakingOptions', { ns: 'app' })

	return (
		<>
			<Title title={title} />
			<Padding horizontalOnly style={{ marginTop: '1rem' }}>
				<ItemsWrapper>
					<ItemWrapper
						type="button"
						onClick={() => {
							closeModal()
							// Set optimal nominator setup here, ready for canvas to display summary
							setNominatorSetup(generateOptimalSetup(), 4)
							openModal({
								key: 'SimpleNominate',
								size: 'xs',
							})
						}}
					>
						<FontAwesomeIcon icon={faBolt} size="2x" />
						<h2>{t('becomeNominator', { ns: 'modals' })}</h2>
						<h3>{t('becomeNominatorSubtitle', { ns: 'modals' })}</h3>
					</ItemWrapper>
					<ItemWrapper
						type="button"
						onClick={() => {
							closeModal()
							removeNominatorSetup(activeAddress)
							openCanvas({
								key: 'NominatorSetup',
								size: 'xl',
							})
						}}
					>
						<FontAwesomeIcon icon={faCog} size="2x" />
						<h2>{t('nominateCustomTitle', { ns: 'modals' })}</h2>
						<h3>{t('nominateCustomSubtitle', { ns: 'modals' })}</h3>
					</ItemWrapper>
					{context === 'simple_other_options' && (
						<ItemWrapper
							type="button"
							onClick={() => {
								closeModal()
								openCanvas({
									key: 'CreatePool',
									options: {},
									size: 'xl',
								})
							}}
						>
							<FontAwesomeIcon icon={faUsers} size="2x" />
							<h2>{t('createAPool', { ns: 'pages' })}</h2>
							<h3>{t('ownManagePool', { ns: 'modals' })}</h3>
						</ItemWrapper>
					)}
				</ItemsWrapper>
			</Padding>
		</>
	)
}
