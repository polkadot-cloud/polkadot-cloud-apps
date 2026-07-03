// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { LeavePool as LeavePoolModal } from 'modals/LeavePool'
import type { Dispatch, SetStateAction } from 'react'

export const LeavePool = ({
	setSection,
	onResize,
}: {
	setSection: Dispatch<SetStateAction<number>>
	onResize: () => void
}) => <LeavePoolModal onResize={onResize} onClick={() => setSection(0)} />
