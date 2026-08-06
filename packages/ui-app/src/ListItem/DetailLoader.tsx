// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Loader } from 'ui-core/base'

interface DetailLoaderProps {
	borderRadius?: string
	height?: string
	width?: string
}

export const DetailLoader = ({
	borderRadius = '0.35rem',
	height = '1.45rem',
	width = '6rem',
}: DetailLoaderProps) => (
	<Loader
		style={{
			borderRadius,
			display: 'block',
			height,
			maxWidth: '100%',
			width,
		}}
	/>
)
