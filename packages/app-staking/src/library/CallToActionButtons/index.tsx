// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { appendOrEmpty } from '@w3ux/utils'
import { CallToActionLoader } from 'library/Loader/CallToAction'
import type { CallToActionButton, CallToActionButtonsProps } from './types'
import { CallToActionWrapper } from './Wrapper'

const getButtonClassName = ({
	kind = 'primary',
	standalone = true,
	disabled,
	pulse,
}: CallToActionButton) =>
	`button ${kind}${appendOrEmpty(standalone, 'standalone')}${appendOrEmpty(
		disabled,
		'disabled',
	)}${appendOrEmpty(pulse, 'pulse')}`

export const CallToActionButtons = ({
	syncing,
	style,
	sections,
}: CallToActionButtonsProps) => (
	<CallToActionWrapper style={style}>
		{syncing ? (
			<CallToActionLoader />
		) : (
			sections.map((section) => (
				<section
					key={
						section.id ??
						section.className ??
						section.buttons
							.map((button) => button.id ?? String(button.label))
							.join('-')
					}
					className={section.className}
				>
					<div className="buttons">
						{section.buttons.map((button) => (
							<div
								key={button.id ?? String(button.label)}
								className={getButtonClassName(button)}
							>
								<button
									type="button"
									onClick={button.onClick}
									disabled={button.disabled}
								>
									{button.icon && button.iconPosition === 'before' && (
										<FontAwesomeIcon
											icon={button.icon}
											transform={button.iconTransform || undefined}
										/>
									)}
									{button.label}
									{button.icon && button.iconPosition !== 'before' && (
										<FontAwesomeIcon
											icon={button.icon}
											transform={button.iconTransform || undefined}
										/>
									)}
								</button>
							</div>
						))}
					</div>
				</section>
			))
		)}
	</CallToActionWrapper>
)
