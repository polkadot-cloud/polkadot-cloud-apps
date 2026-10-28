// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Loader } from 'ui-core/base'

export const BalancePreloader = ({
	height = '1rem',
	width = '5rem',
}: {
	height?: string
	width?: string
}) => <Loader as="span" style={{ height, width }} />
