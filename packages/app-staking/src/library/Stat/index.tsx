// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Odometer } from '@w3ux/react-odometer'
import { Polkicon } from '@w3ux/react-polkicon'
import { applyWidthAsPadding, minDecimalPlaces } from '@w3ux/utils'
import { getChainIcons } from 'assets'
import { useHelp } from 'hooks/useHelp'
import { useNetwork } from 'hooks/useNetwork'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { ButtonPrimary, ButtonSecondary } from 'ui-buttons'
import type {
	StatAddress,
	StatButtonProps,
	StatOdometerData,
	StatProps,
} from './types'
import { Wrapper } from './Wrapper'

export const Stat = ({
	label,
	stat,
	buttons,
	helpKey,
	icon,
	dimmed = false,
	type = 'string',
	buttonType = 'primary',
}: StatProps) => {
	const { network } = useNetwork()
	const { openHelpTooltip } = useHelp()

	const Token = getChainIcons(network).token
	const containerRef = useRef<HTMLDivElement | null>(null)
	const subjectRef = useRef<HTMLDivElement | null>(null)

	const handleAdjustLayout = () => {
		applyWidthAsPadding(subjectRef, containerRef)
	}

	useLayoutEffect(() => {
		handleAdjustLayout()
	})

	useEffect(() => {
		window.addEventListener('resize', handleAdjustLayout)
		return () => {
			window.removeEventListener('resize', handleAdjustLayout)
		}
	}, [])

	const Button = buttonType === 'primary' ? ButtonPrimary : ButtonSecondary

	let display
	switch (type) {
		case 'address':
			display = (stat as StatAddress).display
			break
		case 'odometer':
			display = (
				<h2>
					<Token
						style={{
							width: '1.9rem',
							height: '1.9rem',
							marginRight: '0.55rem',
						}}
					/>
					<Odometer
						value={minDecimalPlaces((stat as StatOdometerData).value, 2)}
						spaceAfter="0.4rem"
						zeroDecimals={2}
					/>
					{(stat as StatOdometerData)?.unit
						? (stat as StatOdometerData).unit
						: null}
				</h2>
			)
			break
		default:
			display = typeof stat === 'string' ? stat : String(stat)
	}

	return (
		<Wrapper
			$isAddress={type === 'address'}
			style={dimmed ? { opacity: 0.5 } : undefined}
		>
			<h4>
				{label}
				{helpKey !== undefined ? (
					<ButtonHelpTooltip
						definition={helpKey}
						openHelp={openHelpTooltip}
						marginLeft
					/>
				) : null}
			</h4>
			<div className={`content${buttons ? ' withButtons' : ''}`}>
				<div className="text" ref={containerRef}>
					{icon ? (
						<>
							<FontAwesomeIcon icon={icon} transform="shrink-4" />
							&nbsp;
						</>
					) : null}
					{type === 'address' ? (
						<div className="icon" style={{ maxWidth: '2.4rem' }}>
							<Polkicon
								address={(stat as StatAddress)?.address || ''}
								fontSize="2.4rem"
							/>
						</div>
					) : null}
					{display}
					{buttons ? (
						<span ref={subjectRef}>
							{buttons.map((btn: StatButtonProps) => (
								<span key={btn.id ?? btn.title}>
									<Button
										text={btn.title}
										size={btn.large ? 'lg' : undefined}
										iconLeft={btn.icon ?? undefined}
										iconTransform={btn.transform ?? undefined}
										disabled={btn.disabled ?? false}
										onClick={() => btn.onClick()}
										marginRight
									/>
								</span>
							))}
						</span>
					) : null}
				</div>
			</div>
		</Wrapper>
	)
}
