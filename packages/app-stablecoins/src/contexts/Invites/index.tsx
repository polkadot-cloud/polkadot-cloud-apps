// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react'

export const useInvites = () => {
	const [acknowledged, setAcknowledged] = useState(true)

	return {
		acknowledged,
		dismissInvite: () => {},
		inviteConfig: undefined,
		setAcknowledged,
	}
}
