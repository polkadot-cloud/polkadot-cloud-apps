// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentType } from 'react'

type ValidatorIconModule = {
	default: ComponentType
}

type ValidatorIconLoader = () => Promise<ValidatorIconModule>

const NullValidatorIcon: ComponentType = () => null

const nullValidatorIconLoader: ValidatorIconLoader = () =>
	Promise.resolve({ default: NullValidatorIcon })

const iconModules = import.meta.glob<ValidatorIconModule>(
	'./*.tsx',
) satisfies Record<string, ValidatorIconLoader>

const getIconPath = (icon: string) => `./${icon}.tsx`

export const getValidatorIconLoader = (
	icon: string | null | undefined,
): ValidatorIconLoader =>
	icon
		? (iconModules[getIconPath(icon)] ?? nullValidatorIconLoader)
		: nullValidatorIconLoader

export const ValidatorIconKeys = Object.keys(iconModules).map((path) =>
	path.replace('./', '').replace('.tsx', ''),
)
