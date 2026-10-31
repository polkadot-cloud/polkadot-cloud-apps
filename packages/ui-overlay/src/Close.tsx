// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Close as Wrapper } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export const Close = ({ label }: { label?: string }) => {
	const { closeModal } = useOverlay().modal

	return <Wrapper label={label} onClose={() => closeModal()} />
}
