// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ModalTitle } from 'ui-app/ModalTitle'
import { Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export const Bio = () => {
	const { name, bio } = useOverlay().modal.config.options

	return (
		<>
			<ModalTitle title={name} />
			<Padding>{bio !== undefined && <h4>{bio}</h4>}</Padding>
		</>
	)
}
