// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export const formatCompactNumber = (value: number, locale?: string) =>
	value.toLocaleString(locale, {
		notation: 'compact',
		maximumFractionDigits: 1,
	})
