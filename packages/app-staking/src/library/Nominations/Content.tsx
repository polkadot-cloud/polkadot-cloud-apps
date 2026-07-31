// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NominationGroupsData } from 'hooks/useNominationGroups'
import { ListStatusHeader } from 'library/List'
import { useTranslation } from 'react-i18next'
import type { BondFor, MaybeAddress, Validator } from 'types'
import { NominationGroups } from './NominationGroups'

export const Content = ({
	bondFor,
	nominator,
	groups,
	poolDestroying,
	syncing,
}: {
	bondFor: BondFor
	nominator: MaybeAddress
	groups: NominationGroupsData<Validator>
	poolDestroying: boolean
	syncing: boolean
}) => {
	const { t } = useTranslation('pages')
	const nominationCount =
		groups.continuing.length + groups.leaving.length + groups.added.length

	if (syncing) {
		return <ListStatusHeader>{`${t('syncing')}...`}</ListStatusHeader>
	}
	if (!nominator) {
		return <ListStatusHeader>{t('notNominating')}.</ListStatusHeader>
	}
	if (nominationCount > 0) {
		return (
			<NominationGroups bondFor={bondFor} nominator={nominator} {...groups} />
		)
	}
	if (poolDestroying) {
		return <ListStatusHeader>{t('poolDestroy')}</ListStatusHeader>
	}
	return <ListStatusHeader>{t('notNominating')}.</ListStatusHeader>
}
