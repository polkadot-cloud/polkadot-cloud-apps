// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Validator } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import {
	createElement,
	type ReactNode,
} from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { MenuControls } from '../../app-staking/src/library/GenerateNominations/Controls/MenuControls'
import { SelectionActions } from '../../app-staking/src/library/GenerateNominations/Controls/SelectionActions'
import type { ConfirmActionProps } from '../../app-staking/src/library/GenerateNominations/types'
import { nominationsAreEqual } from '../../app-staking/src/library/GenerateNominations/utils'

const { state, effects, resetSelected, removeFromSelected, updateSetters } =
	vi.hoisted(() => ({
		state: {
			nominations: [] as Validator[],
			defaultNominations: [] as Validator[],
			selected: [] as Validator[],
			fetching: false,
			confirm: undefined as ConfirmActionProps | undefined,
			revert: undefined as
				| { disabled: boolean; onClick: () => void }
				| undefined,
			regenerate: undefined as (() => void) | undefined,
		},
		effects: [] as (() => void)[],
		resetSelected: vi.fn(),
		removeFromSelected: vi.fn(),
		updateSetters: vi.fn(),
	}))

vi.mock('../../app-staking/node_modules/react/index.js', async (original) => ({
	...(await original<typeof import('react')>()),
	useEffect: (effect: () => void) => effects.push(effect),
}))
vi.mock('../../app-staking/node_modules/react-dom/index.js', () => ({
	createPortal: (children: ReactNode) => children,
}))
vi.mock('contexts/List', () => ({
	useList: () => ({
		selected: state.selected,
		resetSelected,
		removeFromSelected,
	}),
}))
vi.mock('contexts/ManageNominations', () => ({
	useManageNominations: () => ({
		...state,
		method: 'manual',
		setMethod: vi.fn(),
		setFetching: (value: boolean) => {
			state.fetching = value
		},
		setNominations: (value: Validator[]) => {
			state.nominations = value
		},
		updateSetters,
	}),
}))
vi.mock('hooks/useNominationHealth', () => ({
	useNominationHealth: () => ({ active: false, isLoading: false }),
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)
vi.mock(
	'../../app-staking/src/library/GenerateNominations/ConfirmAction',
	() => ({
		ConfirmAction: (props: ConfirmActionProps) => {
			state.confirm = props
			return createElement(
				'button',
				{ disabled: props.disabled },
				props.children,
			)
		},
	}),
)
vi.mock('../../app-staking/src/library/GenerateNominations/Revert', () => ({
	Revert: (props: { disabled: boolean; onClick: () => void }) => {
		state.revert = props
		return null
	},
}))
vi.mock(
	'../../app-staking/src/library/GenerateNominations/RegenerateAction',
	() => ({
		RegenerateAction: ({ onRegenerate }: { onRegenerate: () => void }) => {
			state.regenerate = onRegenerate
			return null
		},
	}),
)

const validator = (address: string): Validator => ({ address, prefs: null })
const a = validator('a')
const b = validator('b')
const remove = vi.fn()
const renderSelection = () =>
	renderToStaticMarkup(
		createElement(SelectionActions, {
			disabled: state.fetching,
			target: {} as HTMLDivElement,
			selectHandler: {
				title: 'Remove Selected',
				popover: { text: 'Remove?', callback: remove },
			},
		}),
	)
const renderControls = () =>
	renderToStaticMarkup(
		createElement(MenuControls, {
			setters: [],
			allowRevert: true,
		}),
	)

beforeEach(() => {
	vi.clearAllMocks()
	effects.length = 0
	state.nominations = [a, b]
	state.defaultNominations = [a]
	state.selected = [a, b]
	state.fetching = false
	state.confirm = undefined
	state.revert = undefined
	state.regenerate = undefined
	resetSelected.mockImplementation(() => {
		state.selected = []
	})
	removeFromSelected.mockImplementation((removed: Validator[]) => {
		state.selected = state.selected.filter((item) => !removed.includes(item))
	})
})

test('removing a nominee prunes its selection while retaining valid selections', () => {
	state.nominations = [b]
	expect(renderSelection()).toContain('Remove Selected')
	state.confirm?.onConfirm()
	expect(remove).toHaveBeenCalledWith({
		selected: [b],
		callback: resetSelected,
	})
	for (const effect of effects) effect()
	expect(state.selected).toEqual([b])
	// Adding the removed validator again must not silently select it.
	state.nominations = [a, b]
	renderSelection()
	state.confirm?.onConfirm()
	expect(remove).toHaveBeenLastCalledWith({
		selected: [b],
		callback: resetSelected,
	})
})

test('removing the last selected nominee hides the action before effect cleanup', () => {
	state.selected = [a]
	state.nominations = [b]
	expect(renderSelection()).not.toContain('Remove Selected')
	expect(state.confirm).toBeUndefined()
	for (const effect of effects) effect()
	expect(state.selected).toEqual([])
})

test('the header confirmation is detached and disabled during fetching', () => {
	state.fetching = true
	expect(renderSelection()).toContain('disabled=""')
	expect(state.confirm?.attached).toBe(false)
})

test('Revert clears checkbox selections as it restores default nominations', () => {
	renderControls()
	expect(state.revert?.disabled).toBe(false)
	state.revert?.onClick()
	expect(state.nominations).toEqual([a])
	expect(state.selected).toEqual([])
	expect(updateSetters).toHaveBeenCalledWith([], [a])
	expect(renderSelection()).not.toContain('Remove Selected')
})

test('generation clears checkbox selections before its new candidates arrive', () => {
	renderControls()
	state.regenerate?.()
	expect(state.fetching).toBe(true)
	expect(state.nominations).toEqual([])
	expect(state.selected).toEqual([])
	state.nominations = [a, validator('c')]
	state.fetching = false
	expect(renderSelection()).not.toContain('Remove Selected')
})

test('Revert ignores nominee ordering and refreshed metadata, as Submit does', () => {
	state.defaultNominations = [
		b,
		{ ...a, prefs: { blocked: false, commission: 1 } },
	]
	renderControls()
	expect(state.revert?.disabled).toBe(true)
})

test.each([
	[[], [], true],
	[[a], [], false],
	[[a], [b], false],
	[[a, b], [a], false],
	[[a, b], [b, { ...a }], true],
])(
	'nomination equality compares addresses: %j / %j',
	(current, initial, expected) => {
		expect(nominationsAreEqual(current, initial)).toBe(expected)
	},
)
