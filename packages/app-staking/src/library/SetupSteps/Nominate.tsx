// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { MaxNominations } from 'consts'
import {
	ManageNominationsProvider,
	useManageNominations,
} from 'contexts/ManageNominations'
import { useNominatorSetups } from 'contexts/NominatorSetups'
import type { NominatorProgress } from 'contexts/NominatorSetups/types'
import type { PoolProgress } from 'hooks/usePoolSetups'
import { usePoolSetups } from 'hooks/usePoolSetups'
import { InlineControls } from 'library/GenerateNominations/Controls/InlineControls'
import { Footer } from 'library/SetupSteps/Footer'
import { Header } from 'library/SetupSteps/Header'
import { MotionContainer } from 'library/SetupSteps/MotionContainer'
import { Subheading } from 'pages/Nominate/Wrappers'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'
import { GenerateNominations } from '../GenerateNominations'
import type { NominationsProps } from './types'

export const Inner = ({ bondFor, section }: NominationsProps) => {
	const { t } = useTranslation('app')
	const { activeAddress } = useActiveAccount()
	const { setNominations } = useManageNominations()
	const { getPoolSetup, setPoolSetup } = usePoolSetups()
	const { getNominatorSetup, setNominatorSetup } = useNominatorSetups()

	const setup =
		bondFor === 'nominator'
			? getNominatorSetup(activeAddress)
			: getPoolSetup(activeAddress)

	const { progress } = setup

	// Handler for updating setup.
	const handleSetupUpdate = (value: NominatorProgress | PoolProgress) => {
		setNominations(value.nominations)
		if (bondFor === 'nominator') {
			setNominatorSetup(value as NominatorProgress)
		} else {
			setPoolSetup(value as PoolProgress)
		}
	}

	// Generation component props
	const displayFor: DisplayFor = 'modal'
	const setters = [
		{
			current: {
				callable: true,
				fn: () =>
					(bondFor === 'nominator'
						? getNominatorSetup(activeAddress)
						: getPoolSetup(activeAddress)
					).progress,
			},
			set: handleSetupUpdate,
		},
	]

	return (
		<>
			<Header
				thisSection={section}
				complete={progress.nominations.length > 0}
				title={t('nominate')}
				bondFor={bondFor}
			/>
			<MotionContainer thisSection={section} activeSection={setup.section}>
				<Subheading>
					<h4>
						{t('chooseValidators', {
							maxNominations: MaxNominations,
						})}
					</h4>
				</Subheading>
				<InlineControls displayFor={displayFor} allowRevert setters={setters} />
				<GenerateNominations setters={setters} displayFor={displayFor} />
				<Footer complete={progress.nominations.length > 0} bondFor={bondFor} />
			</MotionContainer>
		</>
	)
}

export const Nominate = (props: NominationsProps) => {
	const { getPoolSetup } = usePoolSetups()
	const { activeAddress } = useActiveAccount()
	const { getNominatorSetup } = useNominatorSetups()
	const setup =
		props.bondFor === 'nominator'
			? getNominatorSetup(activeAddress)
			: getPoolSetup(activeAddress)

	const { progress } = setup

	return (
		<ManageNominationsProvider nominations={progress.nominations}>
			<Inner {...props} />
		</ManageNominationsProvider>
	)
}
