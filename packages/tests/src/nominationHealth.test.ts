// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test, vi } from 'vitest'
import {
	createElement,
	type ReactNode,
} from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { NominationHealth } from '../../app-staking/src/library/GenerateNominations/NominationHealth'
import statusClasses from '../../ui-core/src/base/StatusCard/index.module.scss'

vi.mock('hooks/useNominationHealth', () => ({
	useNominationHealth: () => ({ setNominationHealth: vi.fn() }),
}))
vi.mock('library/NominationWarnings', () => ({
	RetainmentThresholdDanger: () => null,
}))
vi.mock('../../app-staking/src/library/GenerateNominations/Wrappers', () => ({
	NominationHealthWrapper: ({ children }: { children: ReactNode }) =>
		createElement('section', {}, children),
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({
			t: (key: string) => key,
			i18n: { resolvedLanguage: 'en' },
		}),
	}),
)

test.each([false, true])(
	'Hetzner-only advisories render orange without retainment data (standalone editor: %s)',
	(standalone) => {
		const markup = renderToStaticMarkup(
			createElement(NominationHealth, {
				allValidatorsWaiting: false,
				isLoading: false,
				retainmentByAddress: new Map(),
				standalone,
				validators: [
					{ address: 'hetzner', prefs: { commission: 0, blocked: false } },
				],
				warnings: { hetzner: ['HETZNER'] },
			}),
		)
		expect(markup).toContain(statusClasses.warning)
		expect(markup).toContain('hetznerValidatorWarning')
		expect(markup).toContain('nominationHealthCheckNeedsAttention')
		expect(markup).not.toContain(statusClasses.danger)
	},
)
