// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import {
	faAdd,
	faArrowDown,
	faChartLine,
	faCircleDown,
	faCircleXmark,
	faCoins,
	faEnvelope,
	faMinus,
	faPaperPlane,
	faUser,
	faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import LedgerSquareSVG from '@w3ux/extension-assets/LedgerSquare.svg?react'
import PolkadotVaultSVG from 'assets/brands/vault.svg?react'
import { DiscordSupportURL, PlatformSupportEmail } from 'consts'
import { useNominatorSetups } from 'contexts/NominatorSetups'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useBalances } from 'hooks/useBalances'
import { usePayouts } from 'hooks/usePayouts'
import { useUi } from 'hooks/useUi'
import { useTranslation } from 'react-i18next'
import type { ButtonQuickActionProps } from 'ui-buttons/types'
import { useOverlay } from 'ui-overlay'

export const useQuickActions = () => {
	const { t } = useTranslation()
	const { advancedMode } = useUi()
	const { openModal } = useOverlay().modal
	const { unclaimedRewards } = usePayouts()
	const { openCanvas } = useOverlay().canvas
	const { activeAddress } = useActiveAccount()
	const { getPendingPoolRewards } = useBalances()
	const { hasEnoughToNominate } = useAccountBalances(activeAddress)
	const { setNominatorSetup, generateOptimalSetup } = useNominatorSetups()

	const pendingRewards = getPendingPoolRewards(activeAddress)

	const baseQuickActions: Record<string, ButtonQuickActionProps> = {
		accounts: {
			onClick: () => {
				openModal({ key: 'Accounts' })
			},
			disabled: false,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faUser} />,
			label: t('accounts', { ns: 'app' }),
		},
		ledger: {
			onClick: () => {
				openModal({
					key: 'ImportAccounts',
					size: 'sm',
					options: { source: 'ledger' },
				})
			},
			disabled: false,
			Icon: () => (
				<LedgerSquareSVG style={{ width: '1.5rem', height: '1.5rem' }} />
			),
			label: 'Ledger',
		},
		vault: {
			onClick: () => {
				openModal({
					key: 'ImportAccounts',
					size: 'sm',
					options: { source: 'polkadot_vault' },
				})
			},
			disabled: false,
			Icon: () => (
				<PolkadotVaultSVG
					style={{
						width: '1.5rem',
						height: '1.5rem',
						fill: 'var(--gray-1000)',
					}}
				/>
			),
			label: 'Vault',
		},
		email: {
			onClick: () => {
				window.open(
					`mailto:${PlatformSupportEmail}`,
					'_blank',
					'noopener,noreferrer',
				)
			},
			disabled: false,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faEnvelope} />,
			label: t('email', { ns: 'app' }),
		},
		discord: {
			onClick: () => {
				window.open(DiscordSupportURL, '_blank', 'noopener,noreferrer')
			},
			disabled: false,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faDiscord} />,
			label: 'Discord',
		},
		send: {
			onClick: () => {
				openModal({
					key: 'Transfer',
					options: {},
					size: 'sm',
				})
			},
			disabled: false,
			Icon: () => <FontAwesomeIcon transform="grow-1" icon={faPaperPlane} />,
			label: t('send', { ns: 'app' }),
		},
		joinPool: {
			onClick: () => {
				if (!advancedMode) {
					// On simple mode, open Join Pool modal
					openModal({ key: 'JoinPool', size: 'xs' })
				} else {
					// On advanced mode, open Pool canvas
					openCanvas({
						key: 'Pool',
						options: {},
						size: 'xl',
					})
				}
			},
			disabled: !activeAddress,
			Icon: () => <FontAwesomeIcon transform="grow-1" icon={faUsers} />,
			label: t('joinPool', { ns: 'modals' }),
		},
		nominate: {
			onClick: async () => {
				if (advancedMode) {
					openModal({
						key: 'StakingOptions',
						options: {},
						size: 'xs',
					})
				} else {
					// Set optimal nominator setup here, ready for modal to display submission form
					setNominatorSetup(await generateOptimalSetup(), 4)
					openModal({
						key: 'SimpleNominate',
						options: {},
						size: 'xs',
					})
				}
			},
			disabled: !hasEnoughToNominate,
			Icon: () => <FontAwesomeIcon transform="grow-1" icon={faChartLine} />,
			label: t('nominate', { ns: 'app' }),
		},
		withdrawPoolRewards: {
			onClick: () => {
				openModal({
					key: 'ClaimReward',
					options: { claimType: 'withdraw' },
					size: 'sm',
				})
			},
			disabled: pendingRewards === 0n,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faCircleDown} />,
			label: t('withdraw', { ns: 'pages' }),
		},
		compoundPoolRewards: {
			onClick: () => {
				openModal({
					key: 'ClaimReward',
					options: { claimType: 'bond' },
					size: 'sm',
				})
			},
			disabled: pendingRewards === 0n,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faCoins} />,
			label: t('compound', { ns: 'pages' }),
		},
		claimNominatorPayouts: {
			onClick: () => {
				openModal({
					key: 'ClaimPayouts',
					size: 'sm',
				})
			},
			disabled: BigInt(unclaimedRewards.total) === 0n,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faCircleDown} />,
			label: t('claim', { ns: 'modals' }),
		},
		updatePayee: {
			onClick: () => {
				openModal({ key: 'UpdatePayee', size: 'sm' })
			},
			disabled: false,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faArrowDown} />,
			label: t('payee.label', { ns: 'app' }),
		},
		nominatorUnstake: {
			onClick: () => {
				openModal({
					key: 'Unstake',
					size: 'sm',
				})
			},
			disabled: false,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faCircleXmark} />,
			label: t('stop', { ns: 'pages' }),
		},
		leavePool: {
			onClick: () => {
				openModal({
					key: 'LeavePool',
					size: 'sm',
				})
			},
			disabled: false,
			Icon: () => <FontAwesomeIcon transform="grow-2" icon={faCircleXmark} />,
			label: t('stop', { ns: 'pages' }),
		},
	}

	const getBondQuickAction = (
		bondFor: 'nominator' | 'pool',
	): ButtonQuickActionProps => ({
		onClick: () => {
			openModal({
				key: 'Bond',
				options: { bondFor },
				size: 'sm',
			})
		},
		disabled: false,
		Icon: () => <FontAwesomeIcon transform="grow-2" icon={faAdd} />,
		label: t('bond', { ns: 'pages' }),
	})

	const getUnbondQuickAction = (
		bondFor: 'nominator' | 'pool',
	): ButtonQuickActionProps => ({
		onClick: () => {
			openModal({
				key: 'Unbond',
				options: { bondFor },
				size: 'sm',
			})
		},
		disabled: false,
		Icon: () => <FontAwesomeIcon transform="grow-2" icon={faMinus} />,
		label: t('unbond', { ns: 'pages' }),
	})

	return { baseQuickActions, getBondQuickAction, getUnbondQuickAction }
}
