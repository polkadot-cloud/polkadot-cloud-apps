// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Get the initial active section
export const getPageFromUrl = (): string => {
	return window.location.hash.replace(/^#/, '').split('?')[0]
}
