// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBaseWithClassName } from 'types'

export type SearchListContainerProps = ComponentBaseWithClassName

export type SearchListColumnProps = ComponentBaseWithClassName

export interface SearchListHeaderProps extends ComponentBaseWithClassName {
	children: React.ReactNode
}

export type SearchListSelectedListProps = ComponentBaseWithClassName

export interface SearchListEmptyStateProps extends ComponentBaseWithClassName {
	message: string
}

export interface SearchListLoadingProps extends ComponentBaseWithClassName {
	message?: string
}

export interface SearchListNoResultsProps extends ComponentBaseWithClassName {
	message?: string
}

export interface SearchListClearButtonProps extends ComponentBaseWithClassName {
	onClick: () => void
	children: React.ReactNode
}

export interface SearchListNominationsCounterProps
	extends ComponentBaseWithClassName {
	current: number
	total: number
	remaining: number
}
