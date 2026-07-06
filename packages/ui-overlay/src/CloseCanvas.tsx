// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Close as Wrapper } from 'ui-core/canvas'
import { useOverlay } from 'ui-overlay'

export const CloseCanvas = ({ style }: { style?: React.CSSProperties }) => {
	const { closeCanvas } = useOverlay().canvas

	return <Wrapper onClose={() => closeCanvas()} style={style} />
}
