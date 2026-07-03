// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Title } from 'library/Modal/Title'
import { Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export const Bio = () => {
	const { name, bio } = useOverlay().modal.config.options

	return (
		<>
			<Title title={name} />
			<Padding>{bio !== undefined && <h4>{bio}</h4>}</Padding>
		</>
	)
}
