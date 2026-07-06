// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { onPageNavigationEvent } from 'event-tracking'
import { useNetwork } from 'hooks/useNetwork'
import { useTheme } from 'hooks/useTheme'
import { useUi } from 'hooks/useUi'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from 'ui-core/base'
import type { PrimaryProps } from '../types'
import { BulletWrapper } from '../Wrapper'
import { Wrapper } from './Wrappers'

export const Primary = ({
	pageKey,
	name,
	active,
	to,
	bullet,
	minimised,
	faIcon,
	advanced = false,
}: PrimaryProps) => {
	const { t } = useTranslation('app')
	const navigate = useNavigate()
	const { setSideMenu } = useUi()
	const { network } = useNetwork()
	const { themeElementRef } = useTheme()

	const Inner = (
		<Wrapper
			className={`${active ? `active` : `inactive`}${
				minimised ? ` minimised` : ``
			}${bullet ? ` ${bullet}` : ``}${advanced ? ` advanced` : ``}`}
		>
			<span className="iconContainer">
				<FontAwesomeIcon
					icon={faIcon}
					className="icon"
					transform={minimised ? 'grow-2' : undefined}
				/>
			</span>
			{!minimised && (
				<>
					<h4 className="name">{name}</h4>
					{bullet && (
						<BulletWrapper className={bullet}>
							<FontAwesomeIcon icon={faCircle} transform="shrink-6" />
						</BulletWrapper>
					)}
				</>
			)}
		</Wrapper>
	)

	const onNavigate = () => {
		if (pageKey) {
			onPageNavigationEvent(network, pageKey)
		}

		if (typeof to === 'function') {
			to()
		} else {
			navigate(to)
		}
		if (!active) {
			setSideMenu(false)
		}
	}

	const InnerNoTooltip = (
		<button type="button" onClick={onNavigate}>
			{Inner}
		</button>
	)

	const InnerWithTooltip = (
		<Tooltip
			text={t(name)}
			side="right"
			container={themeElementRef.current || undefined}
			onTriggerClick={onNavigate}
			delayDuration={0}
			fadeIn
			inverted
		>
			{Inner}
		</Tooltip>
	)

	return minimised ? InnerWithTooltip : InnerNoTooltip
}
