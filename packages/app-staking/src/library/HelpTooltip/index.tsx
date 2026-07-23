// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowUpRightFromSquare,
	faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { camelize } from '@w3ux/utils'
import { HelpNoDocs } from 'config'
import { PlatformDocsURL } from 'consts'
import { useFillVariables } from 'hooks/useFillVariables'
import { useHelp } from 'hooks/useHelp'
import { useTheme } from 'hooks/useTheme'
import { DefaultLocale } from 'locales'
import { Popover } from 'radix-ui'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary } from 'ui-buttons'
import { kebabize } from 'utils'
import { CloseButton, PopoverContent } from './Wrapper'

export const HelpTooltip = () => {
	const { t, i18n } = useTranslation('help')
	const { themeElementRef } = useTheme()
	const { fillVariables } = useFillVariables()
	const { isTooltipOpen, tooltipDefinition, tooltipAnchor, closeHelpTooltip } =
		useHelp()
	const [position, setPosition] = useState({ top: 0, left: 0 })

	// Update position when anchor changes
	useEffect(() => {
		if (tooltipAnchor && isTooltipOpen) {
			const rect = tooltipAnchor.getBoundingClientRect()
			setPosition({
				top: rect.bottom + 8,
				left: rect.left + rect.width / 2,
			})
		}
	}, [tooltipAnchor, isTooltipOpen])

	// Close tooltip on scroll or resize
	useEffect(() => {
		if (!isTooltipOpen) {
			return
		}

		const handleScrollOrResize = () => {
			closeHelpTooltip()
		}

		window.addEventListener('scroll', handleScrollOrResize, true)
		window.addEventListener('resize', handleScrollOrResize)

		return () => {
			window.removeEventListener('scroll', handleScrollOrResize, true)
			window.removeEventListener('resize', handleScrollOrResize)
		}
	}, [isTooltipOpen, closeHelpTooltip])

	if (!isTooltipOpen || !tooltipDefinition || !tooltipAnchor) {
		return null
	}

	const localeKey = camelize(tooltipDefinition)
	const docsKey = kebabize(tooltipDefinition)
	const { title, description } = fillVariables(
		{
			title: t(`definitions.${localeKey}.0`, { ns: 'help' }),
			description: i18n.getResource(
				i18n.resolvedLanguage ?? DefaultLocale,
				'help',
				`definitions.${localeKey}.1`,
			),
		},
		['title', 'description'],
	)

	return (
		<Popover.Root open={isTooltipOpen} onOpenChange={closeHelpTooltip}>
			<Popover.Anchor
				style={{
					position: 'fixed',
					top: `${position.top}px`,
					left: `${position.left}px`,
					pointerEvents: 'none',
				}}
			/>
			<Popover.Portal container={themeElementRef.current}>
				<PopoverContent side="bottom" align="center" sideOffset={0}>
					<CloseButton onClick={closeHelpTooltip} aria-label="Close">
						<FontAwesomeIcon icon={faXmark} />
					</CloseButton>
					<h4>{title}</h4>
					{Array.isArray(description) ? (
						description.map((desc) => <p key={desc}>{desc}</p>)
					) : (
						<p>{description}</p>
					)}
					{!HelpNoDocs.includes(localeKey) ? (
						<ButtonSecondary
							text={t('readMoreOnStakingDocs', { ns: 'app' })}
							iconRight={faArrowUpRightFromSquare}
							iconTransform="shrink-2"
							onClick={() => {
								window.open(
									`${PlatformDocsURL}/${i18n.language}/glossary?a=${docsKey}`,
									'_blank',
									'noopener,noreferrer',
								)
								closeHelpTooltip()
							}}
							style={{
								color: 'var(--gray-1000)',
							}}
							size="md"
						/>
					) : null}
				</PopoverContent>
			</Popover.Portal>
		</Popover.Root>
	)
}
