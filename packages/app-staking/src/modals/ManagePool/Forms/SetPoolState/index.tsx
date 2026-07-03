// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import type { SubmittableExtrinsic } from 'dedot'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { ActionItem } from 'library/ActionItem'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import { SubmitTx } from 'library/SubmitTx'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export const SetPoolState = ({
	setSection,
	task = '',
	onResize,
}: {
	setSection: Dispatch<SetStateAction<number>>
	task?: string
	onResize: () => void
}) => {
	const { t } = useTranslation('modals')
	const { serviceApi } = useApi()
	const { closeModal } = useOverlay().modal
	const { activeProxy } = useActiveProxy()
	const { activeAccount } = useActiveAccount()
	const { getSignerWarnings } = useSignerWarnings()
	const { isOwner, isBouncer, activePool } = useActivePool()
	const { updateBondedPools, getBondedPool } = useBondedPools()

	const poolId = activePool?.id

	// valid to submit transaction
	const [valid, setValid] = useState<boolean>(false)

	// ensure account has relevant roles for task
	const canToggle =
		(isOwner() || isBouncer()) &&
		['destroy_pool', 'unlock_pool', 'lock_pool'].includes(task)

	useEffect(() => {
		setValid(canToggle)
	}, [canToggle])

	const content = (() => {
		let title
		let message
		switch (task) {
			case 'destroy_pool':
				title = <ActionItem text={t('setToDestroying')} />
				message = <p>{t('setToDestroyingSubtitle')}</p>
				break
			case 'unlock_pool':
				title = <ActionItem text={t('unlockPool')} />
				message = <p>{t('unlockPoolSubtitle')}</p>
				break
			default:
				title = <ActionItem text={t('lockPool')} />
				message = <p>{t('lockPoolSubtitle')}</p>
		}
		return { title, message }
	})()

	const poolStateFromTask = (s: string) => {
		switch (s) {
			case 'destroy_pool':
				return 'Destroying'
			case 'lock_pool':
				return 'Blocked'
			default:
				return 'Open'
		}
	}

	const getTx = () => {
		if (!valid || poolId === undefined) {
			return
		}
		let tx: SubmittableExtrinsic | undefined
		switch (task) {
			case 'destroy_pool':
				tx = serviceApi.tx.poolSetState(poolId, 'Destroying')
				break
			case 'unlock_pool':
				tx = serviceApi.tx.poolSetState(poolId, 'Open')

				break
			case 'lock_pool':
				tx = serviceApi.tx.poolSetState(poolId, 'Blocked')
				break
		}
		return tx
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: true,
		callbackSubmit: () => {
			closeModal()
		},
		callbackInBlock: () => {
			// reflect updated state in `bondedPools` list.
			if (
				['destroy_pool', 'unlock_pool', 'lock_pool'].includes(task) &&
				poolId
			) {
				const pool = getBondedPool(poolId)
				if (pool) {
					updateBondedPools([
						{
							...pool,
							state: poolStateFromTask(task),
						},
					])
				}
			}
		},
	})

	const warnings = getSignerWarnings(
		activeAccount,
		false,
		submitExtrinsic.proxySupported,
	)

	return (
		<>
			<Padding horizontalOnly>
				{warnings.length > 0 ? (
					<Warnings>
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}
				{content.title}
				{content.message}
			</Padding>
			<ModalBack onClick={() => setSection(0)} />
			<SubmitTx
				noMargin
				submitText={t(
					task === 'destroy_pool'
						? 'destroyPool'
						: task === 'lock_pool'
							? 'lockPool'
							: 'unlockPool',
					{ ns: 'modals' },
				)}
				valid={valid}
				onResize={onResize}
				{...submitExtrinsic}
			/>
		</>
	)
}
