// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LocaleJson, LocaleJsonValue, LocaleProfile } from '../types'

const CacheSchemaVersion = 1
const pluralBaseKey = (key: string) =>
	key.replace(/_(zero|one|two|few|many|other)$/, '')
const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeValue = (
	value: unknown,
	reference: LocaleJsonValue,
): LocaleJsonValue | undefined => {
	if (typeof reference === 'string') {
		return typeof value === 'string' ? value : undefined
	}
	if (Array.isArray(reference)) {
		if (!Array.isArray(value)) return undefined
		const result: LocaleJsonValue[] = []
		for (const [index, item] of value.entries()) {
			const expected = reference[index] ?? reference[0]
			if (expected === undefined) return undefined
			const normalized = normalizeValue(item, expected)
			if (normalized === undefined) return undefined
			result.push(normalized)
		}
		return result
	}
	return isObject(value) ? normalizeObject(value, reference) : undefined
}

const normalizeObject = (
	value: Record<string, unknown>,
	reference: LocaleJson,
): LocaleJson => {
	const result: LocaleJson = {}
	const families = new Map(
		Object.entries(reference).map(([key, item]) => [pluralBaseKey(key), item]),
	)
	for (const [key, item] of Object.entries(value)) {
		const expected = Object.hasOwn(reference, key)
			? reference[key]
			: families.get(pluralBaseKey(key))
		if (expected === undefined) continue
		const normalized = normalizeValue(item, expected)
		if (normalized !== undefined) result[key] = normalized
	}
	return result
}

// Retain only the current profile's keys, including the selected language's plural forms.
export const normalizeResources = (
	resources: unknown,
	fallbackResources: LocaleJson,
): LocaleJson | undefined => {
	if (!isObject(resources)) return undefined
	for (const namespace of Object.keys(fallbackResources)) {
		if (
			!Object.hasOwn(resources, namespace) ||
			!isObject(resources[namespace])
		) {
			return undefined
		}
	}
	return normalizeObject(resources, fallbackResources)
}

export const readCachedResources = (
	cached: string,
	lng: string,
	profile: LocaleProfile,
): LocaleJson | undefined => {
	try {
		const value: unknown = JSON.parse(cached)
		if (
			!isObject(value) ||
			typeof profile.resourceVersion !== 'string' ||
			value.schemaVersion !== CacheSchemaVersion ||
			value.profile !== profile.id ||
			value.resourceVersion !== profile.resourceVersion ||
			value.l !== lng
		) {
			return undefined
		}
		return normalizeResources(value.r, profile.fallbackResources)
	} catch {
		return undefined
	}
}

export const serializeResources = (
	lng: string,
	resources: LocaleJson,
	profile: LocaleProfile,
) =>
	JSON.stringify({
		schemaVersion: CacheSchemaVersion,
		profile: profile.id,
		resourceVersion: profile.resourceVersion,
		l: lng,
		r: resources,
	})
