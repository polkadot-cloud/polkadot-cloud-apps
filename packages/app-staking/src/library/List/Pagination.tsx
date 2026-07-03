// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginationWrapper } from '.'
import type { PaginationProps } from './types'

export const Pagination = ({
	page,
	total,
	hasNext,
	setter,
	disabled = false,
}: PaginationProps) => {
	const { t } = useTranslation('app')
	const [next, setNext] = useState<number>(
		total === undefined || page + 1 <= total ? page + 1 : total,
	)
	const [prev, setPrev] = useState<number>(page - 1 < 1 ? 1 : page - 1)

	useEffect(() => {
		setNext(total === undefined || page + 1 <= total ? page + 1 : total)
		setPrev(page - 1 < 1 ? 1 : page - 1)
	}, [page, total])

	const prevActive = page !== 1
	const nextActive = total === undefined ? !!hasNext : page !== total

	return (
		<PaginationWrapper $prev={prevActive} $next={nextActive}>
			<div>
				<h4>
					{total === undefined
						? t('pageNumber', { page })
						: t('page', { page, total })}
				</h4>
			</div>
			<div>
				<button
					type="button"
					className="prev"
					onClick={() => {
						setter(prev)
					}}
					disabled={disabled || !prevActive}
				>
					{t('prev')}
				</button>
				<button
					type="button"
					className="next"
					onClick={() => {
						setter(next)
					}}
					disabled={disabled || !nextActive}
				>
					{t('next')}
				</button>
			</div>
		</PaginationWrapper>
	)
}
