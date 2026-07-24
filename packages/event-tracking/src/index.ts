// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { onSaEvent } from './util'

// Handle a conversion event based on a utm source
export const onConversionEvent = (utmSource: string) => {
	onSaEvent(`conversion_${utmSource}`)
}

// Record a new user event
export const onNewUserEvent = (attributes: Record<string, unknown> = {}) => {
	onSaEvent('new_user', attributes)
}

// Record a returning user event
export const onReturningUserEvent = (
	attributes: Record<string, unknown> = {},
) => {
	onSaEvent('returning_user', attributes)
}

// Record extension connected
export const onExtensionConnectedEvent = (network: string, id: string) => {
	onSaEvent(`${network.toLowerCase()}_${id}_extension_connected`)
}

// Record page navigation
export const onPageNavigationEvent = (network: string, name: string) => {
	onSaEvent(`${network.toLowerCase()}_${name}_page_visit`)
}

// Record tab navigation
export const onTabVisitEvent = (pageKey: string, tabKey: string) => {
	onSaEvent(`${pageKey.toLowerCase()}_${tabKey.toLowerCase()}_tab_visit`)
}

// New nominator button pressed
export const onNewNominatorButtonPressedEvent = (network: string) => {
	onSaEvent(`${network.toLowerCase()}_nominate_setup_button_pressed`)
}

// Join pool button pressed
export const onJoinPoolButtonPressedEvent = (network: string) => {
	onSaEvent(`${network.toLowerCase()}_pool_join_button_pressed`)
}

// Create pool button pressed
export const onCreatePoolButtonPressedEvent = (network: string) => {
	onSaEvent(`${network.toLowerCase()}_pool_create_button_pressed`)
}

// Locale changed from URL
export const onLocaleFromUrlEvent = (locale: string) => {
	onSaEvent(`locale_from_url_${locale}`)
}

// Locale changed from modal
export const onLocaleFromModalEvent = (locale: string) => {
	onSaEvent(`locale_from_modal_${locale}`)
}

// Transaction submitted
export const onTransactionSubmittedEvent = (
	network: string,
	txLabel: string,
) => {
	onSaEvent(`${network.toLowerCase()}_tx_submitted_${txLabel}`)
}

// Node provider type changed
export const onNodeProviderTypeChangedEvent = (
	network: string,
	method: string,
) => {
	onSaEvent(`${network.toLowerCase()}_node_provider_type_changed_${method}`)
}
