// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ChatChecklist, ChatDetails } from 'ui-app/Chat'
import type { GuidanceGoal, GuidanceIntake } from '../types'

export const guidanceGoals: GuidanceGoal[] = [
	'MINIMISE_NOMINATIONS',
	'HIGH_RETAINMENT',
]
const goalKeys = {
	MINIMISE_NOMINATIONS: 'minimiseNominations',
	HIGH_RETAINMENT: 'highRetainment',
} as const

export const Goals = ({
	goals,
	onChange,
	currentNominations,
	shareNominations,
	onShareChange,
	disabled,
}: {
	goals: GuidanceGoal[]
	onChange: (goals: GuidanceGoal[]) => void
	currentNominations?: string[]
	shareNominations: boolean
	onShareChange: (share: boolean) => void
	disabled: boolean
}) => {
	const { t } = useTranslation('chat')
	return (
		<ChatDetails label={t('goalsTitle')}>
			<p>{t('goalsPrompt')}</p>
			<ChatChecklist
				legend={t('chooseGoals')}
				options={guidanceGoals.map((goal) => ({
					value: goal,
					label: t(goalKeys[goal]),
					checked: goals.includes(goal),
				}))}
				onChange={(value, checked) =>
					onChange(
						guidanceGoals.filter((goal) =>
							goal === value ? checked : goals.includes(goal),
						),
					)
				}
				disabled={disabled}
			/>
			{currentNominations !== undefined ? (
				<>
					<ChatChecklist
						legend={t('nominationContext')}
						options={[
							{
								value: 'share',
								label: t('shareNominations'),
								checked: shareNominations,
							},
						]}
						onChange={(_value, checked) => onShareChange(checked)}
						disabled={disabled}
					/>
					{currentNominations.length === 0 && <p>{t('noNominations')}</p>}
				</>
			) : (
				<p>{t('nominationsUnavailable')}</p>
			)}
		</ChatDetails>
	)
}

export const GoalsSummary = ({ intake }: { intake: GuidanceIntake }) => {
	const { t } = useTranslation('chat')
	return (
		<ChatDetails label={t('goalsTitle')}>
			<ul>
				{intake.goals.map((goal) => (
					<li key={goal}>{t(goalKeys[goal])}</li>
				))}
			</ul>
			{intake.currentNominations !== undefined ? (
				<p>
					{t(
						intake.currentNominations.length
							? 'nominationsShared'
							: 'noNominations',
					)}
				</p>
			) : (
				<p>{t('nominationsNotShared')}</p>
			)}
		</ChatDetails>
	)
}
