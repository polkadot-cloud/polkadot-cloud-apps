// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// connect-ledger message codes span both existing namespaces.
const modalMessageKeys: Record<string, string> = {
	methodNotSupported: 'modals:methodNotSupported',
	missingNesting: 'modals:missingNesting',
	queuedTransactionRejected: 'modals:queuedTransactionRejected',
}

export const getLedgerMessageKey = (code: string): string =>
	Object.hasOwn(modalMessageKeys, code) ? modalMessageKeys[code] : code
