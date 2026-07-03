// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { defaultClaimPermission } from 'global-bus'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { ClaimPermissionInput } from 'library/Form/ClaimPermissionInput'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import { SubmitTx } from 'library/SubmitTx'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import type { ClaimPermission } from 'types'
import { Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export const SetClaimPermission = ({
	setSection,
	section,
	onResize,
}: {
	section: number
	setSection: Dispatch<SetStateAction<number>>
	onResize: () => void
}) => {
	const { serviceApi } = useApi()
	const { activeProxy } = useActiveProxy()
	const { closeModal } = useOverlay().modal
	const { getPoolMembership } = useBalances()
	const { isOwner, isMember } = useActivePool()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()

	const { membership } = getPoolMembership(activeAddress)

	// Valid to submit transaction.
	const [valid, setValid] = useState<boolean>(false)

	// Updated claim permission value.
	const [claimPermission, setClaimPermission] = useState<
		ClaimPermission | undefined
	>(membership?.claimPermission)

	// Determine current pool metadata and set in state.
	useEffect(() => {
		const current = membership?.claimPermission
		if (current) {
			setClaimPermission(membership?.claimPermission)
		}
	}, [section, membership])

	useEffect(() => {
		setValid(isOwner() || (isMember() && claimPermission !== undefined))
	}, [isOwner(), isMember()])

	const getTx = () => {
		if (!valid || !claimPermission) {
			return
		}
		return serviceApi.tx.poolSetClaimPermission(claimPermission)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: true,
		callbackSubmit: () => {
			closeModal()
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

				<ClaimPermissionInput
					current={membership?.claimPermission || defaultClaimPermission}
					onChange={(val: ClaimPermission | undefined) => {
						setClaimPermission(val)
					}}
				/>
			</Padding>
			<ModalBack onClick={() => setSection(0)} />
			<SubmitTx
				noMargin
				valid={valid && claimPermission !== membership?.claimPermission}
				onResize={onResize}
				{...submitExtrinsic}
			/>
		</>
	)
}
