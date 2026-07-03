// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary } from 'ui-buttons'
import { Padding } from 'ui-core/modal'

export const ModalBack = ({ onClick }: { onClick: () => void }) => {
	const { t } = useTranslation('modals')

	return (
		<Padding horizontalOnly>
			<div
				style={{
					marginTop: '1.75rem',
				}}
			>
				<ButtonSecondary
					key="button_back"
					text={t('back')}
					iconLeft={faChevronLeft}
					iconTransform="shrink-3"
					onClick={() => onClick()}
				/>
			</div>
		</Padding>
	)
}
