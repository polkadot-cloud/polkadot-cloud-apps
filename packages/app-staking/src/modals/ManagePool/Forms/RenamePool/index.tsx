// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { stringToU8a } from 'dedot/utils'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export const RenamePool = ({
	setSection,
	section,
	onResize,
}: {
	setSection: Dispatch<SetStateAction<number>>
	section: number
	onResize: () => void
}) => {
	const { t } = useTranslation('modals')
	const { serviceApi } = useApi()
	const { activeProxy } = useActiveProxy()
	const { closeModal } = useOverlay().modal
	const { activeAccount } = useActiveAccount()
	const { isOwner, activePool } = useActivePool()
	const { getSignerWarnings } = useSignerWarnings()
	const { bondedPools, poolsMetaData } = useBondedPools()

	const poolId = activePool?.id

	// Valid to submit transaction
	const [valid, setValid] = useState<boolean>(false)

	// Updated metadata value
	const [metadata, setMetadata] = useState<string>('')

	// Determine current pool metadata and set in state.
	useEffect(() => {
		const pool = bondedPools.find(
			({ addresses }) => addresses.stash === activePool?.addresses.stash,
		)
		if (pool) {
			setMetadata(poolsMetaData[Number(pool.id)] || '')
		}
	}, [section])

	useEffect(() => {
		setValid(isOwner())
	}, [isOwner()])

	const getTx = () => {
		if (!valid || !poolId) {
			return
		}
		return serviceApi.tx.poolSetMetadata(poolId, stringToU8a(metadata))
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: true,
		callbackSubmit: () => {
			closeModal()
		},
	})

	const handleMetadataChange = (e: ChangeEvent<HTMLInputElement>) => {
		setMetadata(e.currentTarget.value)
		setValid(true)
	}

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
				<input
					className="underline"
					style={{ width: '100%' }}
					placeholder={t('poolName')}
					type="text"
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						handleMetadataChange(e)
					}
					value={metadata ?? ''}
				/>
				<p>{t('storedOnChain')}</p>
			</Padding>
			<ModalBack onClick={() => setSection(0)} />
			<SubmitTx
				noMargin
				submitText={t('renamePool', { ns: 'modals' })}
				valid={valid}
				onResize={onResize}
				{...submitExtrinsic}
			/>
		</>
	)
}
