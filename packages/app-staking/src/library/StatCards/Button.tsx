// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Stat } from 'ui-core/base'
import type { ButtonProps } from './types'
import { Wrapper } from './Wrapper'

export const Button = ({
	Icon,
	label,
	title,
	onClick,
	isPreloading,
}: ButtonProps) => {
	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Button>
				<button type="button" onClick={() => onClick()}>
					<Stat.Graphic>{Icon}</Stat.Graphic>
					<Stat.Content>
						<Stat.Title semibold>{title}</Stat.Title>
						<Stat.Subtitle primary>
							{label}
							<FontAwesomeIcon icon={faChevronRight} transform="shrink-5" />
						</Stat.Subtitle>
					</Stat.Content>
				</button>
			</Stat.Button>
		</Wrapper>
	)
}
