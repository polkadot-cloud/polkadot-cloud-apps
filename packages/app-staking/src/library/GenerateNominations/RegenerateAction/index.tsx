// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks/useTheme'
import { type ReactNode, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Heading, Popover } from 'ui-core/popover'
import classes from './index.module.scss'

export const RegenerateAction = ({
	children,
	disabled = false,
	onRegenerate,
}: {
	children: ReactNode
	disabled?: boolean
	onRegenerate: () => void
}) => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const [open, setOpen] = useState(false)
	const id = useId()

	return (
		<Popover
			align="start"
			content={
				<div className={classes.container}>
					<Heading
						border
						style={{ margin: '0.25rem 0 0.75rem', paddingBottom: '0.75rem' }}
					>
						{t('method')}
					</Heading>
					<button
						aria-describedby={`${id}-description`}
						aria-labelledby={`${id}-title`}
						className={classes.card}
						disabled={disabled}
						onClick={() => {
							onRegenerate()
							setOpen(false)
						}}
						type="button"
					>
						<span aria-hidden className={classes.candidateList}>
							{[0, 1, 2, 3, 4].map((row) => (
								<span className={classes.candidateRow} key={row} />
							))}
						</span>
						<span className={classes.copy}>
							<span className={classes.title} id={`${id}-title`}>
								{t('optimalSelection')}
							</span>
							<span className={classes.subtitle} id={`${id}-description`}>
								{t('optimalSelectionRegenerateSubtitle')}
							</span>
						</span>
						<span aria-hidden className={classes.arrow}>
							<FontAwesomeIcon icon={faArrowRight} />
						</span>
					</button>
				</div>
			}
			disabled={disabled}
			onOpenChange={setOpen}
			open={open}
			portalContainer={themeElementRef.current || undefined}
			side="bottom"
			sideOffset={8}
			width="min(380px, calc(100vw - 2rem))"
		>
			{children}
		</Popover>
	)
}
