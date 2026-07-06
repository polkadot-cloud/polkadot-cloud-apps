// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

export const Status = () => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { getApiStatus } = useApi()

	const relayStatus = getApiStatus(network)

	return (
		<>
			{relayStatus === 'disconnected' && (
				<motion.p animate={{ opacity: [0, 1] }} transition={{ duration: 0.3 }}>
					{t('disconnected')}
				</motion.p>
			)}
			{relayStatus === 'connecting' && (
				<motion.p animate={{ opacity: [0, 1] }} transition={{ duration: 0.3 }}>
					{t('connecting')}...
				</motion.p>
			)}
			{['connected', 'ready'].includes(relayStatus) && (
				<motion.p animate={{ opacity: [0, 1] }} transition={{ duration: 0.3 }}>
					{t('connectedToNetwork')}
				</motion.p>
			)}
		</>
	)
}
