// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FormEvent } from 'react'
import { SearchInputWrapper } from '.'
import type { SearchInputProps } from './types'

export const SearchInput = ({
	value,
	handleChange,
	placeholder,
	secondary = false,
}: SearchInputProps) => (
	<SearchInputWrapper>
		<input
			type="text"
			value={value}
			className={`search ${secondary ? 'secondary' : ''}`}
			placeholder={placeholder}
			onChange={(e: FormEvent<HTMLInputElement>) => handleChange(e)}
		/>
	</SearchInputWrapper>
)
