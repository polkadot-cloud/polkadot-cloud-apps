// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronCircleRight,
	faWarning,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useThemeValues } from 'contexts/ThemeValues'
import { CardWrapper } from 'library/Card/Wrappers'
import { ButtonPrimary } from 'ui-buttons'
import { ButtonRow, Page } from 'ui-core/base'
import type { WarningPromptProps } from './types'

export const WarningPrompt = ({
	title,
	subtitle,
	buttonText,
	onClick,
	icon = faWarning,
}: WarningPromptProps) => {
	const { getThemeValue } = useThemeValues()

	return (
		<Page.Row>
			<CardWrapper
				style={{
					border: `1px solid ${getThemeValue('--status-warning')}`,
				}}
			>
				<div className="content">
					<h3>
						<FontAwesomeIcon icon={icon} /> {title}
					</h3>
					<h4>{subtitle}</h4>
					<ButtonRow yMargin>
						<ButtonPrimary
							iconLeft={faChevronCircleRight}
							iconTransform="grow-1"
							text={buttonText}
							onClick={onClick}
						/>
					</ButtonRow>
				</div>
			</CardWrapper>
		</Page.Row>
	)
}
