// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import { SystemChainList } from 'consts/networks'
import { getStakingChainData } from 'consts/util/chains'
import { getRpcEndpoints, setRpcEndpoints } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { PromptSelectItem } from 'library/Prompt/Wrappers'
import { useTranslation } from 'react-i18next'
import { Title } from 'ui-core/prompt'
import { usePrompt } from 'ui-overlay'

export const ProvidersPrompt = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { closePrompt } = usePrompt()
	const { getRpcEndpoint } = useApi()

	const { name } = getStakingChainData(network)
	const rpcProviders = SystemChainList[name].endpoints.rpc

	return (
		<>
			<Title
				title={t('rpcProviders', { ns: 'modals' })}
				onClose={closePrompt}
			/>
			<div className="padded">
				<h4 className="subheading">
					{t('selectRpcProvider', {
						ns: 'modals',
						network: capitalizeFirstLetter(network),
					})}
				</h4>
				{Object.entries(rpcProviders)?.map(([key, url]) => {
					const isDisabled = getRpcEndpoint(network) === key

					return (
						<PromptSelectItem
							key={`favorite_${key}`}
							className={isDisabled ? 'inactive' : undefined}
							onClick={() => {
								closePrompt()
								// NOTE: Currently, we can only update the relay chain RPC endpoint
								setRpcEndpoints(network, {
									...getRpcEndpoints(),
									[name]: key,
								})
							}}
						>
							<h3>
								{key} {isDisabled && `  (${t('selected', { ns: 'modals' })})`}
							</h3>
							<h4>{url}</h4>
						</PromptSelectItem>
					)
				})}
			</div>
		</>
	)
}
