// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { TipsConfigAdvanced, TipsConfigSimple } from 'consts/tips'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useFillVariables } from 'hooks/useFillVariables'
import { useStaking } from 'hooks/useStaking'
import { useUi } from 'hooks/useUi'
import { DefaultLocale } from 'locales'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { usePrompt } from 'ui-overlay'
import { Tip, type TipDisplay } from 'ui-tips'

export const useTips = () => {
	const { i18n, t } = useTranslation()
	const navigate = useNavigate()
	const { advancedMode } = useUi()
	const { isNominating } = useStaking()
	const { inPool, isOwner } = useActivePool()
	const { fillVariables } = useFillVariables()
	const { activeAddress } = useActiveAccount()
	const { closePrompt, openPromptWith } = usePrompt()
	const { hasEnoughToNominate } = useAccountBalances(activeAddress)

	// Get tips based on app mode
	const config = advancedMode ? TipsConfigAdvanced : TipsConfigSimple

	// Accumulate segments to include in tips
	const segments: number[] = []
	if (!activeAddress) {
		segments.push(1)
	} else if (!isNominating && !inPool) {
		if (hasEnoughToNominate) {
			segments.push(2)
		} else {
			segments.push(3)
		}
		segments.push(4)
	} else {
		if (isNominating) {
			segments.push(5)
		}
		if (inPool) {
			if (!isOwner()) {
				segments.push(6)
			} else {
				segments.push(7)
			}
		}
		segments.push(8)
	}

	// Configure tip items based on segments and staking state
	let items = config.filter((i) => segments.includes(i.s))

	// If user is both nominating and in a pool, and in simple mode, filter out tips that redirect to
	// 'stake' page as the stake page will not be accessible (pool and nominate pages will be
	// accessible instead).
	if (isNominating && inPool && !advancedMode) {
		items = items.filter((i) => i.page !== 'stake')
	}

	const itemsDisplay: TipDisplay[] = items.map((item) => {
		const { id } = item
		const title = t(`${id}.0`, { ns: 'tips' })
		const subtitle = t(`${id}.1`, { ns: 'tips' })
		const description = i18n.getResource(
			i18n.resolvedLanguage ?? DefaultLocale,
			'tips',
			`${id}.2`,
		)

		const onPromptClick = () => {
			closePrompt()
			navigate(`/${item.page}`)
		}

		const filledVars = fillVariables(
			{
				...item,
				title,
				subtitle,
				description,
			},
			['title', 'subtitle', 'description'],
		)

		return {
			...filledVars,
			onTipClick: () => {
				openPromptWith(
					<Tip
						title={filledVars.title}
						description={filledVars.description}
						page={item.page}
						onPromptClick={onPromptClick}
					/>,
					'sm',
				)
			},
		}
	})

	const getPoolWarningTips = (): TipDisplay[] => {
		const warningItems = config.filter((i) => i.s === 9)

		return warningItems.map((item) => {
			const { id } = item
			const title = t(`${id}.0`, { ns: 'tips' })
			const subtitle = t(`${id}.1`, { ns: 'tips' })
			const description = i18n.getResource(
				i18n.resolvedLanguage ?? DefaultLocale,
				'tips',
				`${id}.2`,
			)

			const onPromptClick = () => {
				closePrompt()
				navigate(`/${item.page}`)
			}

			const filledVars = fillVariables(
				{
					...item,
					title,
					subtitle,
					description,
				},
				['title', 'subtitle', 'description'],
			)

			return {
				...filledVars,
				onTipClick: () => {
					openPromptWith(
						<Tip
							title={filledVars.title}
							description={filledVars.description}
							page={item.page}
							onPromptClick={onPromptClick}
						/>,
						'sm',
					)
				},
			}
		})
	}

	return { items: itemsDisplay, getPoolWarningTips }
}
