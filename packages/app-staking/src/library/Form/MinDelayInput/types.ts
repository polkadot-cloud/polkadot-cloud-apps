// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface MinDelayProps {
	initial: number
	field: string
	label: string
	handleChange: (field: string, value: number) => void
}
