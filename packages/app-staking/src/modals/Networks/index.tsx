// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { capitalizeFirstLetter } from '@w3ux/utils'
import { getChainIcons } from 'assets'
import { getEnabledNetworks, getStakingChainData } from 'consts/util'
import { onNodeProviderTypeChangedEvent } from 'event-tracking'
import { setAutoRpc, setProviderType } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useUi } from 'hooks/useUi'
import { Title } from 'library/Modal/Title'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChainId, NetworkId } from 'types'
import { ButtonTertiary } from 'ui-buttons'
import { Checkbox } from 'ui-core/list'
import { Padding } from 'ui-core/modal'
import { useOverlay, usePrompt } from 'ui-overlay'
import { ProvidersPrompt } from './ProvidersPrompt'
import {
	ConnectionButton,
	ConnectionsWrapper,
	ContentWrapper,
	NetworkButton,
} from './Wrapper'

export const Networks = () => {
	const { t } = useTranslation('modals')
	const { isBraveBrowser } = useUi()
	const { openPromptWith } = usePrompt()
	const { network, switchNetwork } = useNetwork()
	const { providerType, autoRpc, getRpcEndpoint } = useApi()
	const { closeModal, setModalResize } = useOverlay().modal
	const networkKey = network
	const { name } = getStakingChainData(network)

	const isLightClient = providerType === 'sc'

	// Likely never going to happen; here just to be safe.
	useEffect(() => setModalResize(), [isBraveBrowser])

	return (
		<>
			<Title title={t('networks')} icon={faGlobe} />
			<Padding>
				<ContentWrapper>
					<h4>{t('selectNetwork')}</h4>
					<div className="items">
						{Object.entries(getEnabledNetworks()).map(([key, item]) => {
							const inline = getChainIcons(key as NetworkId).inline
							const Svg = inline.svg
							const rpcDisabled = networkKey === key

							return (
								<NetworkButton
									$connected={networkKey === key}
									disabled={rpcDisabled}
									key={`network_switch_${key}`}
									type="button"
									onClick={() => {
										if (networkKey !== key) {
											switchNetwork(key as NetworkId)
											closeModal()
										}
									}}
								>
									<div style={{ width: '1.75rem' }}>
										<Svg width={inline.size} height={inline.size} />
									</div>
									<h3>{capitalizeFirstLetter(item.name)}</h3>
									{networkKey === key && (
										<h4 className="selected">{t('selected')}</h4>
									)}
									<div></div>
								</NetworkButton>
							)
						})}
					</div>
					<h4>{t('providerType')}</h4>
					<ConnectionsWrapper>
						<div>
							<ConnectionButton
								$connected={isLightClient}
								className="off"
								type="button"
								onClick={() => {
									setProviderType('sc')
									switchNetwork(networkKey as NetworkId)
									onNodeProviderTypeChangedEvent(networkKey, 'light_client')
									closeModal()
								}}
							>
								<h3>{t('lightClient')}</h3>
								{isLightClient && <h4 className="selected">{t('selected')}</h4>}
							</ConnectionButton>
						</div>
						<div>
							<ConnectionButton
								$connected={!isLightClient}
								disabled={!isLightClient}
								type="button"
								onClick={() => {
									setProviderType('ws')
									switchNetwork(networkKey as NetworkId)
									onNodeProviderTypeChangedEvent(networkKey, 'rpc')
									closeModal()
								}}
							>
								<h3>RPC</h3>
								{!isLightClient && (
									<h4 className="selected">{t('selected')}</h4>
								)}
							</ConnectionButton>
							<div className="provider">
								<Checkbox
									checked={autoRpc}
									onClick={() => {
										setAutoRpc(!autoRpc)
										switchNetwork(networkKey as NetworkId)
										closeModal()
									}}
								/>
								<p style={{ marginLeft: '0.5rem' }}>{t('autoRpc')}</p>
							</div>
							{!autoRpc && (
								<div className="provider">
									<p>{t('provider')}:</p>
									<ButtonTertiary
										text={getRpcEndpoint(name as ChainId)}
										onClick={() => openPromptWith(<ProvidersPrompt />)}
										marginLeft
										disabled={autoRpc}
									/>
								</div>
							)}
						</div>
					</ConnectionsWrapper>
				</ContentWrapper>
			</Padding>
		</>
	)
}
