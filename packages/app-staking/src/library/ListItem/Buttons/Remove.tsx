// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'contexts/Themes'
import { Confirm } from 'library/Prompt/Confirm'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'
import { HeaderButton } from 'ui-core/list'
import { Popover } from 'ui-core/popover'

export const Remove = ({
	address,
	onRemove,
	displayFor,
}: {
	address: string
	onRemove: () => void
	displayFor: DisplayFor
}) => {
	const { t } = useTranslation()
	const { themeElementRef } = useTheme()

	const [open, setOpen] = useState<boolean>(false)

	const controlKey = `selected_${address}`

	return (
		<Popover
			open={open}
			key={controlKey}
			portalContainer={themeElementRef.current || undefined}
			onTriggerClick={() => setOpen(true)}
			content={
				<Confirm
					text={t('removeFromNominees', { ns: 'app' })}
					controlKey={controlKey}
					onClose={() => setOpen(false)}
					onRevert={() => {
						onRemove()
						setOpen(false)
					}}
				/>
			}
		>
			<HeaderButton outline={['modal', 'canvas'].includes(displayFor)} noMargin>
				<span>
					<FontAwesomeIcon
						icon={faXmark}
						transform="grow-4"
						className={controlKey}
					/>
				</span>
			</HeaderButton>
		</Popover>
	)
}
