// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks'
import { useUi } from 'hooks/useUI'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from 'ui-core/base'
import type { PrimaryProps } from '../types'
import { Wrapper } from './Wrappers'

export const Primary = ({
	name,
	active,
	to,
	minimised,
	faIcon,
}: PrimaryProps) => {
	const navigate = useNavigate()
	const { setSideMenu } = useUi()
	const { themeElementRef } = useTheme()

	const inner = (
		<Wrapper
			className={`${active ? `active` : `inactive`}${
				minimised ? ` minimised` : ``
			}`}
		>
			<span className="iconContainer">
				<FontAwesomeIcon
					icon={faIcon}
					className="icon"
					transform={minimised ? 'grow-2' : undefined}
				/>
			</span>
			{!minimised && <h4 className="name">{name}</h4>}
		</Wrapper>
	)

	const onNavigate = () => {
		if (typeof to === 'function') {
			to()
		} else {
			navigate(to)
		}
		setSideMenu(false)
	}

	if (minimised) {
		return (
			<Tooltip
				text={name}
				side="right"
				container={themeElementRef.current || undefined}
				onTriggerClick={onNavigate}
				delayDuration={0}
				fadeIn
				inverted
			>
				{inner}
			</Tooltip>
		)
	}

	return (
		<button type="button" onClick={onNavigate}>
			{inner}
		</button>
	)
}
