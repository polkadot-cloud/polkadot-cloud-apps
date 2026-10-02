// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Attached popovers are portaled, so they cannot inherit the bar's local variables.
export const menuColors = (surface: string) => {
	const background = `color-mix(in srgb, ${surface} 35%, var(--nomination-popover-highlight))`
	return {
		background,
		borderColor: `color-mix(in srgb, color-mix(in srgb, ${background} 88%, var(--gray-1000)) 50%, var(--gray-500))`,
	}
}
