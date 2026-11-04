// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Keep the component stable while each test captures its own hook results.
export const HookProbe = ({ callback }: { callback: () => void }) => {
	callback()
	return null
}
