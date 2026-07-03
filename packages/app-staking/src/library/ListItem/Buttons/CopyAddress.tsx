// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonCopy } from 'library/ButtonCopy'
import type { CopyAddressProps } from '../types'

export const CopyAddress = ({ address }: CopyAddressProps) => (
	<ButtonCopy value={address} size="0.95rem" xMargin />
)
