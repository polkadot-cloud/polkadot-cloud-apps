// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHelp } from 'hooks/useHelp'
import type { CSSProperties, FunctionComponent, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonHelp } from 'ui-buttons'
import { Header, Title as Wrapper } from 'ui-core/modal'
import { Close } from 'ui-overlay'

interface ModalTitleProps {
	title?: string
	titleStyle?: CSSProperties
	icon?: IconProp
	Svg?: FunctionComponent<SVGProps<SVGSVGElement>>
	svgSize?: string
	fixed?: boolean
	helpKey?: string
	paddingTop?: string
	paddingLeft?: string
}

export const ModalTitle = ({
	helpKey,
	title,
	titleStyle,
	icon,
	fixed,
	Svg,
	svgSize = '1.5rem',
	paddingTop,
	paddingLeft,
}: ModalTitleProps) => {
	const { t } = useTranslation('modals')
	const { openHelpTooltip } = useHelp()

	const graphic = Svg ? (
		<Svg style={{ width: svgSize, height: svgSize }} />
	) : icon ? (
		<FontAwesomeIcon transform="grow-3" icon={icon} />
	) : null

	const style = {
		paddingLeft,
		paddingTop,
	}

	return (
		<>
			<Close label={t('close')} />
			<Header fixed={fixed} style={style}>
				<div>
					{graphic}
					{title && (
						<Wrapper style={titleStyle}>
							{title}
							{helpKey ? (
								<ButtonHelp
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
