// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Convert a string to kebab-case (lowercase with dashes for spaces)
// Handles acronyms correctly (e.g., "XMLHttpRequest" -> "xml-http-request")
export const kebabize = (str: string): string =>
	str
		.replace(/([a-z])([A-Z])/g, '$1-$2') // Add dash between camelCase
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Add dash before last letter of acronyms
		.replace(/[\s_]+/g, '-') // Replace spaces and underscores with dashes
		.toLowerCase() // Convert to lowercase
		.replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
