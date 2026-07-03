// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faUserPlus } from '@fortawesome/free-solid-svg-icons'
import {
	onCreatePoolButtonPressedEvent,
	onJoinPoolButtonPressedEvent,
} from 'event-tracking'
import { useActiveAccountPool } from 'hooks/useActiveAccountPool'
import { useNetwork } from 'hooks/useNetwork'
import { useUi } from 'hooks/useUi'
import { CallToActionButtons } from 'library/CallToActionButtons'
import type { CallToActionSection } from 'library/CallToActionButtons/types'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'
import type { NewMemberProps } from './types'

export const NewMember = ({ syncing, showOtherOptions }: NewMemberProps) => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { advancedMode } = useUi()
	const { openModal } = useOverlay().modal
	const { openCanvas } = useOverlay().canvas
	const { getJoinDisabled, getCreateDisabled } = useActiveAccountPool()

	// Alias for create button disabled state
	const createDisabled = getCreateDisabled()

	// Disable opening the canvas if data is not ready.
	const joinButtonDisabled = getJoinDisabled()

	// Handle join pool button press
	const handleOnJoinPool = () => {
		if (!advancedMode) {
			// On simple mode, open Join Pool modal
			openModal({ key: 'JoinPool', size: 'xs' })
		} else {
			// On advanced mode, open Pool canvas
			onJoinPoolButtonPressedEvent(network)
			openCanvas({
				key: 'Pool',
				options: {},
				size: 'xl',
			})
		}
	}

	const sections: CallToActionSection[] = [
		{
			buttons: [
				{
					label: t('joinPool', { ns: 'pages' }),
					onClick: handleOnJoinPool,
					disabled: joinButtonDisabled,
					kind: 'primary',
					pulse: !joinButtonDisabled,
					icon: faUserPlus,
					iconPosition: 'after',
				},
			],
		},
	]

	if (advancedMode && !showOtherOptions) {
		sections.push({
			buttons: [
				{
					label: t('createPool', { ns: 'pages' }),
					onClick: () => {
						onCreatePoolButtonPressedEvent(network)
						openCanvas({
							key: 'CreatePool',
							options: {},
							size: 'xl',
						})
					},
					disabled: createDisabled,
					kind: 'secondary',
				},
			],
		})
	}

	if (showOtherOptions) {
		sections.push({
			buttons: [
				{
					label: t('otherOptions', { ns: 'app' }),
					onClick: () =>
						openModal({
							key: 'StakingOptions',
							size: 'xs',
							options: { context: 'simple_other_options' },
						}),
					kind: 'secondary',
				},
			],
		})
	}

	return (
		<CallToActionButtons
			syncing={syncing}
			style={{ marginTop: '1rem' }}
			sections={sections}
		/>
	)
}
