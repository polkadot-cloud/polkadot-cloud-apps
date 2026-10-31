// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowsRotate,
	faChartSimple,
	faCheckToSlot,
	faCoins,
	faInfo,
	faMobileScreenButton,
	faPenToSquare,
	faServer,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloudSVG from 'assets/icons/cloud.svg?react'
import CloudOutlineSVG from 'assets/icons/cloudOutline.svg?react'
import { PlatformURL } from 'consts'
import { type KeyboardEvent, useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalTitle } from 'ui-app/ModalTitle'
import { Padding } from 'ui-core/modal'
import classes from './index.module.scss'

const apps = [
	{
		id: 'validators',
		href: 'https://validators.polkadot.cloud',
		graphic: <FontAwesomeIcon icon={faServer} />,
	},
	{
		id: 'nominate',
		href: 'https://nominate.polkadot.cloud',
		graphic: <FontAwesomeIcon icon={faCheckToSlot} />,
	},
	{
		id: 'staking',
		href: 'https://staking.polkadot.cloud',
		graphic: <FontAwesomeIcon icon={faCoins} />,
	},
	{
		id: 'signer',
		href: `${PlatformURL}/signer`,
		graphic: <CloudOutlineSVG />,
	},
	{
		id: 'companion',
		href: `${PlatformURL}/app`,
		graphic: <FontAwesomeIcon icon={faMobileScreenButton} />,
	},
	{
		id: 'swap',
		href: 'https://swap.polkadot.cloud',
		graphic: <FontAwesomeIcon icon={faArrowsRotate} />,
	},
	{
		id: 'aboutValidators',
		href: `${PlatformURL}/validators`,
		graphic: <FontAwesomeIcon icon={faInfo} />,
	},
	{
		id: 'accountability',
		href: `${PlatformURL}/accountability`,
		graphic: <FontAwesomeIcon icon={faChartSimple} />,
	},
	{
		id: 'blog',
		href: `${PlatformURL}/blog`,
		graphic: <FontAwesomeIcon icon={faPenToSquare} />,
	},
	{ id: 'home', href: PlatformURL, graphic: null },
] as const

export const CloudApps = () => {
	const { t } = useTranslation('modals')
	const descriptionId = useId()
	const dialogRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const trigger = document.activeElement
		const settingsButton =
			document.querySelector<HTMLButtonElement>('.header-settings')
		dialogRef.current
			?.querySelector<HTMLButtonElement>('button')
			?.focus({ preventScroll: true })
		return () => {
			const returnFocus =
				trigger instanceof HTMLElement &&
				trigger !== document.body &&
				trigger.isConnected
					? trigger
					: settingsButton
			returnFocus?.focus({ preventScroll: true })
		}
	}, [])

	const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== 'Tab') return
		const controls =
			dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href]')
		if (!controls?.length) return
		const first = controls[0]
		const last = controls[controls.length - 1]
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault()
			last.focus()
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault()
			first.focus()
		}
	}

	return (
		<div
			ref={dialogRef}
			className={classes.directory}
			role="dialog"
			aria-modal="true"
			aria-label={t('cloudApps.title')}
			aria-describedby={descriptionId}
			onKeyDown={trapFocus}
		>
			<ModalTitle
				title={t('cloudApps.title')}
				Svg={CloudSVG}
				svgSize="clamp(2.1rem, 4vw, 2.8rem)"
				titleStyle={{
					fontFamily: '"DM Serif Display", serif',
					fontSize: 'clamp(2.1rem, 4vw, 2.8rem)',
					fontWeight: 400,
					lineHeight: 1.2,
				}}
			/>
			<Padding>
				<p id={descriptionId} className={classes.description}>
					{t('cloudApps.description')}
				</p>
				<div className={classes.grid}>
					{apps.map(({ id, href, graphic }) => (
						<a
							key={id}
							className={`${classes.card} ${classes[id]}`}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
						>
							{graphic && (
								<div className={classes.artwork} aria-hidden="true">
									<div className={classes.icon}>{graphic}</div>
								</div>
							)}
							<div className={classes.copy}>
								<span className={classes.category}>
									{t(`cloudApps.${id}.category`)}
								</span>
								<h2>{t(`cloudApps.${id}.title`)}</h2>
								<p>{t(`cloudApps.${id}.description`)}</p>
							</div>
							<span className={classes.externalLink} aria-hidden="true">
								↗
							</span>
						</a>
					))}
				</div>
			</Padding>
		</div>
	)
}
