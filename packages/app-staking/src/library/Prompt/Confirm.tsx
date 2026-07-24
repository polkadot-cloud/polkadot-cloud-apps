// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOutsideAlerter } from '@w3ux/hooks'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PopoverTab } from 'ui-buttons'
import { ConfirmText } from './Wrappers'

export interface ConfirmProps {
	text: string
	controlKey: string
	onRevert: () => void
	onClose: () => void
}

export const Confirm = ({
	text,
	controlKey,
	onRevert,
	onClose,
}: ConfirmProps) => {
	const { t } = useTranslation('app')
	const popoverRef = useRef<HTMLDivElement>(null)

	useOutsideAlerter(popoverRef, () => {
		onClose()
	}, [controlKey])

	return (
		<div ref={popoverRef}>
			<ConfirmText>{text}</ConfirmText>
			<PopoverTab.Container position="bottom">
				<PopoverTab.Button
					status="danger"
					text={t('cancel')}
					onClick={() => onClose()}
				/>
				<PopoverTab.Button text={t('confirm')} onClick={() => onRevert()} />
			</PopoverTab.Container>
		</div>
	)
}
