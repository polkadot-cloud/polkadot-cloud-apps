// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
	faArrowDown,
	faArrowRightFromBracket,
	faRedoAlt,
	faStop,
} from '@fortawesome/free-solid-svg-icons'
import type { PayeeOption } from 'contexts/NominatorSetups/types'
import { useTranslation } from 'react-i18next'

export interface PayeeItem {
	icon: IconProp
	value: PayeeOption
	title: string
	activeTitle: string
	subtitle: string
}

export const usePayeeConfig = () => {
	const { t } = useTranslation('app')
	const getPayeeItems = (extended?: boolean): PayeeItem[] => {
		let items: PayeeItem[] = [
			{
				value: 'Staked',
				title: t('payee.staked.title', { context: 'default' }),
				activeTitle: t('payee.staked.title', { context: 'active' }),
				subtitle: t('payee.staked.subtitle'),
				icon: faRedoAlt,
			},
			{
				value: 'Stash',
				title: t('payee.stash.title'),
				activeTitle: t('payee.stash.title'),
				subtitle: t('payee.stash.subtitle'),
				icon: faArrowDown,
			},
			{
				value: 'Account',
				title: t('payee.account.title', { context: 'default' }),
				activeTitle: t('payee.account.title'),
				subtitle: t('payee.account.subtitle'),
				icon: faArrowRightFromBracket,
			},
		]

		if (extended) {
			items = items.concat([
				{
					value: 'None',
					title: t('payee.none.title', { context: 'default' }),
					activeTitle: t('payee.none.title', { context: 'active' }),
					subtitle: t('payee.none.subtitle'),
					icon: faStop,
				},
			])
		}

		return items
	}

	return { getPayeeItems }
}
