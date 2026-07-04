// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import i18n from 'i18next'

export const i18next = i18n.createInstance()

void i18next.init({
	lng: 'en',
	fallbackLng: 'en',
	defaultNS: 'app',
	interpolation: {
		escapeValue: false,
	},
	resources: {
		en: {
			app: {
				connectAccounts: 'Connect Accounts',
				currency: 'Currency',
				darkMode: 'Dark Mode',
				network: 'Network',
				notification: 'Notification',
				notification_other: 'Notifications',
				selectAccount: 'Select Account',
				send: 'Send',
				switchAccount: 'Switch Account',
				wallets: 'Wallets',
				webExtensions: 'Web Extensions',
			},
			modals: {
				accounts: 'Accounts',
				cancel: 'Cancel',
				connect: 'Connect',
				developerTools: 'Developer Tools',
				disconnect: 'Disconnect',
				disconnectFromExtension: 'Disconnect from this extension?',
				hardware: 'Hardware',
				free: 'Free',
				noActiveAccount: 'No active account.',
				notInstalled: 'Not Installed',
				proxy: 'Proxy',
				readOnly: 'Read Only',
				readOnlyAccounts: 'Read Only Accounts',
			},
		},
	},
})
