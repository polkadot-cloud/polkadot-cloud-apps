// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Locale } from 'date-fns'
import { DefaultLocale, getLoadedDateFormat, loadDateFormat } from 'locales'
import { useEffect, useState } from 'react'

export const useDateFormat = (lng?: string): Locale => {
	const language = lng ?? DefaultLocale
	const [dateFormat, setDateFormat] = useState<Locale>(() =>
		getLoadedDateFormat(language),
	)

	useEffect(() => {
		let mounted = true

		setDateFormat(getLoadedDateFormat(language))
		loadDateFormat(language).then((loadedDateFormat) => {
			if (mounted) {
				setDateFormat(loadedDateFormat)
			}
		})

		return () => {
			mounted = false
		}
	}, [language])

	return dateFormat
}
