// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import CloudSVG from 'assets/icons/cloud.svg?react'
import { PlatformURL } from 'consts'
import { type KeyboardEvent, useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'
import classes from './index.module.scss'

const apps = [
	{ id: 'validators', href: 'https://validators.polkadot.cloud' },
	{ id: 'nominate', href: 'https://nominate.polkadot.cloud' },
	{ id: 'staking', href: 'https://staking.polkadot.cloud' },
	{ id: 'signer', href: `${PlatformURL}/signer` },
	{ id: 'companion', href: `${PlatformURL}/app` },
	{ id: 'aboutValidators', href: `${PlatformURL}/validators` },
	{ id: 'home', href: PlatformURL },
] as const

export const CloudApps = () => {
	const { t } = useTranslation('modals')
	const { closeModal } = useOverlay().modal
	const titleId = useId()
	const descriptionId = useId()
	const dialogRef = useRef<HTMLDivElement>(null)
	const closeRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		const trigger = document.activeElement
		const settingsButton =
			document.querySelector<HTMLButtonElement>('.header-settings')
		closeRef.current?.focus({ preventScroll: true })
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
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			onKeyDown={trapFocus}
		>
			<button
				ref={closeRef}
				type="button"
				className={classes.close}
				aria-label={t('cloudApps.close')}
				onClick={closeModal}
			>
				<span aria-hidden="true">×</span>
			</button>
			<header className={classes.heading}>
				<div className={classes.wordmark}>
					<CloudSVG aria-hidden="true" />
					<span>Polkadot Cloud</span>
				</div>
				<h1 id={titleId}>{t('cloudApps.title')}</h1>
				<p id={descriptionId}>{t('cloudApps.description')}</p>
			</header>
			<div className={classes.grid}>
				{apps.map(({ id, href }) => (
					<a
						key={id}
						className={`${classes.card} ${classes[id]}`}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
					>
						<div className={classes.artwork} aria-hidden="true">
							<div className={classes.orbit} />
							<div className={classes.sculpture}>
								<span />
								<span />
								<span />
								<span />
								<span />
							</div>
							<span className={classes.spark} />
						</div>
						<div className={classes.copy}>
							<span className={classes.category}>
								{t(`cloudApps.${id}.category`)}
							</span>
							<h2>{t(`cloudApps.${id}.title`)}</h2>
							<p>{t(`cloudApps.${id}.description`)}</p>
							<span className={classes.address}>
								{href.replace('https://', '')}
							</span>
						</div>
						<span className={classes.arrow} aria-hidden="true">
							↗
						</span>
					</a>
				))}
			</div>
			<p className={classes.footnote}>{t('cloudApps.newTab')}</p>
		</div>
	)
}
