// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getChainIcons } from 'assets'
import { format, startOfToday, subDays } from 'date-fns'
import { useDateFormat } from 'hooks/useDateFormat'
import { useNetwork } from 'hooks/useNetwork'
import { AnnouncementsList } from 'library/Announcements/AnnouncementsList'
import type { AnnouncementItem } from 'library/Announcements/types'
import { Balance } from 'library/Balance'
import { CardWrapper } from 'library/Card/Wrappers'
import { NominatorList } from 'library/NominatorList'
import type { NominatorListItemData } from 'library/NominatorList/types'
import { useTranslation } from 'react-i18next'
import { CardHeader, Separator } from 'ui-core/base'

interface IncomingPayoutsProps {
	accounts: NominatorListItemData[]
	unit: string
	currency: string
	totalIncoming30d?: number
}

export const IncomingPayouts = ({
	accounts,
	unit,
	currency,
	totalIncoming30d,
}: IncomingPayoutsProps) => {
	const { i18n, t } = useTranslation(['pages', 'app'])
	const { network } = useNetwork()
	const Token = getChainIcons(network).token
	const dateFormat = useDateFormat(i18n.resolvedLanguage)

	const totalIncoming =
		totalIncoming30d ??
		accounts.reduce((acc, item) => acc + item.incomingPayouts30d, 0)

	const announcements: AnnouncementItem[] = [
		{
			label: t('app:last30dIncoming'),
			value: '',
			valueNode: (
				<Balance.WithFiat
					Token={<Token />}
					value={totalIncoming}
					currency={currency}
					caretAsUnit
				/>
			),
		},
	]

	const fromDate = format(subDays(startOfToday(), 30), 'do MMM', {
		locale: dateFormat,
	})
	const toDate = format(startOfToday(), 'do MMM', {
		locale: dateFormat,
	})

	return (
		<CardWrapper>
			<CardHeader>
				<h4>
					{t('incomingPayoutAccounts', {
						defaultValue: 'Incoming Payouts',
					})}
				</h4>
				<h2>
					{fromDate}
					{toDate !== fromDate && <>&nbsp;-&nbsp;{toDate}</>}
				</h2>
			</CardHeader>

			<Separator transparent />
			<AnnouncementsList items={announcements} />
			<Separator transparent />

			<NominatorList items={accounts} unit={unit} />
		</CardWrapper>
	)
}
