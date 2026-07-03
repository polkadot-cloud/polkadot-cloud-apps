// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Loader } from 'ui-core/base'

export const Preloader = () => {
	const TitlePreloader = (
		<Loader
			style={{
				height: '1.5rem',
				width: '30%',
				marginBottom: '1rem',
			}}
		/>
	)
	const SubtitlePreloader = (
		<Loader
			style={{
				height: '2.25rem',
				width: '60%',
			}}
		/>
	)

	return (
		<div
			style={{
				padding: '0.5rem 0',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{TitlePreloader}
			{SubtitlePreloader}
		</div>
	)
}
