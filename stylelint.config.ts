// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Config } from 'stylelint'

export default {
	extends: ['stylelint-config-standard-scss'],
	plugins: ['stylelint-order'],
	customSyntax: 'postcss-scss',
	rules: {
		'order/order': ['custom-properties', 'declarations'],
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global', 'local', 'export'],
			},
		],
		'scss/at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['use'],
			},
		],
		'selector-class-pattern': [
			'^[a-z][a-zA-Z0-9]*$',
			{
				message: 'Expected class selector to be camelCase',
			},
		],
	},
} satisfies Config
