// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ModalBack } from 'library/ModalBack'
import 'rc-slider/assets/index.css'
import { ItemsWrapper } from 'modals/StakingOptions/Wrappers'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonOption } from 'ui-buttons'
import { Padding } from 'ui-core/modal'
import { TaskInnerWrapper } from '../../Wrappers'
import { ManageChangeRate } from './ManageChangeRate'
import { ManageCurrentCommission } from './ManageCurrentCommission'
import { ManageMaxCommission } from './ManageMaxCommission'
import { usePoolCommission } from './provider'

type CommissionView = 'options' | 'commission' | 'maxCommission' | 'changeRate'

export const ManageCommission = ({
	setSection,
	incrementCalculateHeight,
	onResize,
}: {
	setSection: Dispatch<SetStateAction<number>>
	incrementCalculateHeight: () => void
	onResize: () => void
}) => {
	const { t } = useTranslation(['app', 'modals'])
	const { current, hasValue, resetAll, setFeatureEnabled } = usePoolCommission()
	const [view, setView] = useState<CommissionView>('options')

	const handleBack = () => {
		if (view === 'options') {
			setSection(0)
			resetAll()
			return
		}
		setView('options')
		resetAll()
	}

	useEffect(() => {
		incrementCalculateHeight()
	}, [view])

	return (
		<>
			{view === 'options' ? (
				<>
					<ModalBack onClick={handleBack} />
					<Padding horizontalOnly style={{ marginTop: '1rem' }}>
						<ItemsWrapper>
							<ButtonOption
								onClick={() => {
									setView('commission')
								}}
							>
								<TaskInnerWrapper>
									<h3>{t('commissionRate', { ns: 'modals' })}</h3>
									<p>
										{current.commission}% ·{' '}
										{current.payee === null
											? t('manageCommission.payeeNotSetLabel', { ns: 'modals' })
											: t('manageCommission.payeeSetLabel', { ns: 'modals' })}
									</p>
								</TaskInnerWrapper>
							</ButtonOption>
							<ButtonOption
								onClick={() => {
									setFeatureEnabled('maxCommission', true)
									setView('maxCommission')
								}}
							>
								<TaskInnerWrapper>
									<h3>{t('maxCommission', { ns: 'modals' })}</h3>
									<p>
										{hasValue.maxCommission
											? `${current.maxCommission}%`
											: t('manageCommission.maxCommissionSubtitle', {
													ns: 'modals',
												})}
									</p>
								</TaskInnerWrapper>
							</ButtonOption>
							<ButtonOption
								onClick={() => {
									setFeatureEnabled('changeRate', true)
									setView('changeRate')
								}}
							>
								<TaskInnerWrapper>
									<h3>{t('changeRate', { ns: 'modals' })}</h3>
									<p>
										{current.changeRate.maxIncrease}% /{' '}
										{t('manageCommission.blocksLabel', {
											ns: 'modals',
											blocks: current.changeRate.minDelay.toLocaleString(),
										})}
									</p>
								</TaskInnerWrapper>
							</ButtonOption>
						</ItemsWrapper>
					</Padding>
				</>
			) : null}

			{view === 'commission' ? (
				<ManageCurrentCommission onResize={onResize} onBack={handleBack} />
			) : null}
			{view === 'maxCommission' ? (
				<ManageMaxCommission onResize={onResize} onBack={handleBack} />
			) : null}
			{view === 'changeRate' ? (
				<ManageChangeRate onResize={onResize} onBack={handleBack} />
			) : null}
		</>
	)
}
