// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useFilters } from 'contexts/Filters'
import { useValidatorFilters } from 'hooks/useValidatorFilters'
import { FilterListButton, FilterListWrapper } from 'library/Prompt/Wrappers'
import { useTranslation } from 'react-i18next'
import { Title } from 'ui-core/prompt'
import { usePrompt } from 'ui-overlay'

export const FilterValidators = () => {
	const { t } = useTranslation('app')
	const { closePrompt } = usePrompt()
	const { getFilters, toggleFilter } = useFilters()
	const { excludesToLabels, includesToLabels } = useValidatorFilters()

	const includes = getFilters('include', 'validators')
	const excludes = getFilters('exclude', 'validators')

	return (
		<FilterListWrapper>
			<Title title={t('filterValidators')} onClose={closePrompt} />
			<div className="body">
				<h4>{t('include')}:</h4>
				{Object.entries(includesToLabels).map(([f, l]) => (
					<FilterListButton
						$active={includes?.includes(f) ?? false}
						key={`validator_include_${f}`}
						type="button"
						onClick={() => {
							toggleFilter('include', 'validators', f)
						}}
					>
						<FontAwesomeIcon
							transform="grow-4"
							icon={includes?.includes(f) ? faCheckCircle : faCircle}
						/>
						<h4>{l}</h4>
					</FilterListButton>
				))}

				<h4>{t('exclude')}:</h4>
				{Object.entries(excludesToLabels).map(([f, l]) => (
					<FilterListButton
						$active={excludes?.includes(f) ?? false}
						key={`validator_exclude_${f}`}
						type="button"
						onClick={() => {
							toggleFilter('exclude', 'validators', f)
						}}
					>
						<FontAwesomeIcon
							transform="grow-5"
							icon={excludes?.includes(f) ? faCheckCircle : faCircle}
						/>
						<h4>{l}</h4>
					</FilterListButton>
				))}
			</div>
		</FilterListWrapper>
	)
}
