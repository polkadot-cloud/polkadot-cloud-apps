// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHelp } from 'hooks/useHelp'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import type { FunctionComponent, SVGProps } from 'react'
import { Header, Title as Wrapper } from 'ui-core/modal'
import { Close } from 'ui-overlay'

interface TitleProps {
	title?: string
	icon?: IconProp
	Svg?: FunctionComponent<SVGProps<unknown>>
	fixed?: boolean
	helpKey?: string
	paddingTop?: string
	paddingLeft?: string
}

export const Title = ({
	helpKey,
	title,
	icon,
	fixed,
	Svg,
	paddingTop,
	paddingLeft,
}: TitleProps) => {
	const { openHelpTooltip } = useHelp()

	const graphic = Svg ? (
		<Svg style={{ width: '1.5rem', height: '1.5rem' }} />
	) : icon ? (
		<FontAwesomeIcon transform="grow-3" icon={icon} />
	) : null

	const style = {
		paddingLeft,
		paddingTop,
	}

	return (
		<>
			<Close />
			<Header fixed={fixed} style={style}>
				<div>
					{graphic}
					{title && (
						<Wrapper>
							{title}
							{helpKey ? (
								<ButtonHelpTooltip
									marginLeft
									definition={helpKey}
									openHelp={openHelpTooltip}
								/>
							) : null}
						</Wrapper>
					)}
				</div>
			</Header>
		</>
	)
}
