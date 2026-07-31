// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NominationGroupsData } from 'hooks/useNominationGroups'
import { NominationList } from 'library/NominationList'
import { useTranslation } from 'react-i18next'
import type { BondFor, MaybeAddress, NominationStatus, Validator } from 'types'
import { NominationRow } from './Wrapper'

interface NominationRowProps {
	bondFor: BondFor
	nominator: MaybeAddress
	validators: Validator[]
	title?: string
	statusOverride?: NominationStatus
}

const Row = ({
	bondFor,
	nominator,
	validators,
	title,
	statusOverride,
}: NominationRowProps) => {
	if (!validators.length && !title) {
		return null
	}

	return (
		<NominationRow>
			{title && <h4>{title}</h4>}
			<NominationList
				bondFor={bondFor}
				validators={validators}
				nominator={nominator}
				statusOverride={statusOverride}
			/>
		</NominationRow>
	)
}

export const NominationGroups = ({
	bondFor,
	nominator,
	continuing,
	leaving,
	added,
	hasChanges,
	hasActiveEraData,
}: NominationGroupsData<Validator> & {
	bondFor: BondFor
	nominator: MaybeAddress
}) => {
	const { t } = useTranslation('pages')
	const activeStatus = hasActiveEraData ? 'active' : undefined

	return (
		<>
			<Row
				bondFor={bondFor}
				nominator={nominator}
				validators={continuing}
				statusOverride={activeStatus}
			/>
			{hasChanges && (
				<>
					<Row
						bondFor={bondFor}
						nominator={nominator}
						validators={leaving}
						title={t('leavingNextEra')}
						statusOverride="active"
					/>
					<Row
						bondFor={bondFor}
						nominator={nominator}
						validators={added}
						title={t('addedForNextEra')}
					/>
				</>
			)}
		</>
	)
}
