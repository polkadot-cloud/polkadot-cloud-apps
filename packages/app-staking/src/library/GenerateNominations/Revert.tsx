// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTheme } from 'hooks/useTheme'
import { Confirm } from 'library/Prompt/Confirm'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary } from 'ui-buttons'
import { Popover } from 'ui-core/popover'

export const Revert = ({
	disabled,
	onClick,
}: {
	disabled: boolean
	onClick: () => void
}) => {
	const { t } = useTranslation('modals')
	const { themeElementRef } = useTheme()
	const [open, setOpen] = useState(false)

	const onRevert = () => {
		onClick()
		setOpen(false)
	}

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			disabled={disabled}
			portalContainer={themeElementRef.current || undefined}
			side="bottom"
			align="end"
			sideOffset={8}
			content={
				<Confirm
					text={t('revertNominationChanges')}
					controlKey="revert_nominations"
					onClose={() => setOpen(false)}
					onRevert={onRevert}
				/>
			}
		>
			<ButtonSecondary
				asLabel
				className="revert"
				size="lg"
				text={t('revertChanges')}
				disabled={disabled}
			/>
		</Popover>
	)
}
