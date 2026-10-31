// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowsRotate,
	faChartSimple,
	faCheckToSlot,
	faCoins,
	faFileSignature,
	faInfo,
	faMobileScreenButton,
	faPenToSquare,
	faServer,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloudSVG from 'assets/icons/cloud.svg?react'
import { PlatformURL } from 'consts'
import {
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { ModalTitle } from 'ui-app/ModalTitle'
import { Padding } from 'ui-core/modal'
import classes from './index.module.scss'

interface CloudApp {
	id: string
	href: string
	graphic: ReactNode
	titleKey?: string
	categoryKey?: string
}

const appSections: { id: string; apps: CloudApp[] }[] = [
	{
		id: 'appsAndTools',
		apps: [
			{
				id: 'staking',
				href: 'https://staking.polkadot.cloud',
				graphic: <FontAwesomeIcon icon={faCoins} />,
			},
			{
				id: 'validators',
				titleKey: 'app:validators',
				href: 'https://validators.polkadot.cloud',
				graphic: <FontAwesomeIcon icon={faServer} />,
			},
			{
				id: 'nominate',
				titleKey: 'app:nominate',
				href: 'https://nominate.polkadot.cloud',
				graphic: <FontAwesomeIcon icon={faCheckToSlot} />,
			},
			{
				id: 'swap',
				href: 'https://swap.polkadot.cloud',
				graphic: <FontAwesomeIcon icon={faArrowsRotate} />,
			},
			{
				id: 'signer',
				categoryKey: 'app:sign',
				href: `${PlatformURL}/signer`,
				graphic: <FontAwesomeIcon icon={faFileSignature} />,
			},
			{
				id: 'companion',
				href: `${PlatformURL}/app`,
				graphic: <FontAwesomeIcon icon={faMobileScreenButton} />,
			},
		],
	},
	{
		id: 'platform',
		apps: [
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
		],
	},
]

export const CloudApps = () => {
	const { t } = useTranslation('modals')
	const descriptionId = useId()
	const iconGradientId = useId()
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
			<svg
				className={classes.iconDefinitions}
				width="0"
				height="0"
				aria-hidden="true"
				focusable="false"
			>
				<defs>
					<linearGradient
						id={iconGradientId}
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stopColor="var(--accent-800)" stopOpacity="0.3" />
						<stop
							offset="50%"
							stopColor="var(--accent-800)"
							stopOpacity="0.65"
						/>
						<stop offset="100%" stopColor="var(--accent-800)" />
					</linearGradient>
				</defs>
			</svg>
			<ModalTitle
				title={t('cloudApps.title')}
				Svg={CloudSVG}
				svgSize="clamp(1.9rem, 3.5vw, 2.5rem)"
				titleStyle={{
					fontFamily: '"DM Serif Display", serif',
					fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)',
					fontWeight: 400,
					lineHeight: 1.2,
				}}
			/>
			<Padding>
				<p id={descriptionId} className={classes.description}>
					{t('cloudApps.description')}
				</p>
				{appSections.map(({ id: sectionId, apps }) => (
					<section
						key={sectionId}
						className={classes.section}
						aria-labelledby={`${descriptionId}-${sectionId}`}
					>
						<h3
							id={`${descriptionId}-${sectionId}`}
							className={classes.sectionTitle}
						>
							{t(`cloudApps.sections.${sectionId}`)}
						</h3>
						<div className={classes.grid}>
							{apps.map(
								({
									id,
									href,
									graphic,
									titleKey = `cloudApps.${id}.title`,
									categoryKey = `cloudApps.${id}.category`,
								}) => (
									<a
										key={id}
										className={
											id === 'home'
												? `${classes.card} ${classes.home}`
												: classes.card
										}
										href={href}
										target="_blank"
										rel="noopener noreferrer"
									>
										{graphic && (
											<div
												className={classes.artwork}
												aria-hidden="true"
												style={{ fill: `url(#${iconGradientId})` }}
											>
												{graphic}
											</div>
										)}
										<span className={classes.category}>{t(categoryKey)}</span>
										<h4>{t(titleKey)}</h4>
										<p>{t(`cloudApps.${id}.description`)}</p>
										<span className={classes.externalLink} aria-hidden="true">
											↗
										</span>
									</a>
								),
							)}
						</div>
					</section>
				))}
			</Padding>
		</div>
	)
}
