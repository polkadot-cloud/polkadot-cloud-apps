// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import {
	getStablecoinAssetConfig,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import type { DedotClient, SubmittableExtrinsic } from 'dedot'
import { decodeAddress, u8aToHex } from 'dedot/utils'
import type { StablecoinFeeAssetSymbol } from 'types'
import { asTx } from '../util'
import type { BalancePair, StablecoinAdapter } from './shared'
import { toStablecoinBalance, zeroBalance } from './shared'

// Adapter shape for Hydration-only fee currency calls.
export type HydrationStablecoinAdapter = StablecoinAdapter & {
	hydrationFeeCurrency: (
		address: string,
	) => Promise<StablecoinFeeAssetSymbol | undefined>
	setHydrationFeeCurrency: (
		symbol: StablecoinFeeAssetSymbol,
	) => Promise<SubmittableExtrinsic | undefined>
}

// ERC-20 `balanceOf(address)` selector used when querying Hydration EVM assets.
const BALANCE_OF_SELECTOR = '0x70a08231'

// FixedU128 denominator for Hydration fee-asset price multipliers.
const FIXED_U128_DIVISOR = 1_000_000_000_000_000_000n

// Applies a FixedU128 multiplier to a bigint value and rounds up fee estimates.
const multiplyFixedU128 = (value: bigint, multiplier: bigint): bigint => {
	if (value === 0n || multiplier === 0n) {
		return 0n
	}

	return (value * multiplier + FIXED_U128_DIVISOR - 1n) / FIXED_U128_DIVISOR
}

// Reads a Hydration token balance from the Tokens pallet.
const fetchHydrationTokenBalance = async (
	api: DedotClient<HydrationApi>,
	address: string,
	assetId: number,
): Promise<BalancePair> => {
	const info = await api.query.tokens.accounts([address, assetId])
	return {
		free: info.free,
		frozen: info.frozen,
	}
}

// Converts a Substrate address into the EVM address format expected by eth_call.
const toEvmAddress = (address: string): string => {
	if (address.startsWith('0x') && address.length === 42) {
		return address
	}

	return u8aToHex(decodeAddress(address).slice(0, 20))
}

// Calls an ERC-20 contract on Hydration EVM to fetch the holder balance.
const fetchHydrationErc20Balance = async (
	api: DedotClient<HydrationApi>,
	address: string,
	contractAddress: string,
): Promise<BalancePair> => {
	const evmAddress = toEvmAddress(address)
	const callData = `${BALANCE_OF_SELECTOR}000000000000000000000000${evmAddress.slice(
		2,
	)}`
	const result = await api.rpc.eth_call(
		{ to: contractAddress, data: callData },
		'latest',
	)

	return {
		free: BigInt(result),
		frozen: 0n,
	}
}

// Fetches Hydration's native-to-fee-asset price multiplier for a fee asset.
const fetchHydrationFeeAssetPrice = async (
	api: DedotClient<HydrationApi>,
	assetId: number,
): Promise<bigint | undefined> =>
	(await api.query.multiTransactionPayment
		.acceptedCurrencyPrice(assetId)
		.catch(() => undefined)) ??
	(await api.query.multiTransactionPayment
		.acceptedCurrencies(assetId)
		.catch(() => undefined))

// Converts a native Hydration fee into the selected fee asset amount.
const estimateHydrationFee = async (
	api: DedotClient<HydrationApi>,
	symbol: StablecoinFeeAssetSymbol,
	nativeFee: bigint,
): Promise<bigint> => {
	const config = getStablecoinAssetConfig('hydration', symbol)
	if (config?.assetId === undefined) {
		return nativeFee
	}

	if (
		config.assetId === api.consts.multiTransactionPayment.nativeAssetId ||
		nativeFee === 0n
	) {
		return nativeFee
	}

	const price = await fetchHydrationFeeAssetPrice(api, config.assetId)
	if (!price) {
		throw new Error(`Unable to quote ${symbol} transaction fee`)
	}

	return multiplyFixedU128(nativeFee, price)
}

// Creates the Hydration stablecoin adapter.
export const createHydrationStablecoinAdapter = (
	getApi: () => Promise<DedotClient<HydrationApi>>,
): HydrationStablecoinAdapter => ({
	feeAssets: getStablecoinFeeAssets('hydration'),
	balance: async (address, symbol) => {
		const config = getStablecoinAssetConfig('hydration', symbol)
		if (!config) {
			return zeroBalance('hydration', symbol)
		}

		try {
			const api = await getApi()
			if (config.erc20Contract) {
				return toStablecoinBalance(
					'hydration',
					symbol,
					await fetchHydrationErc20Balance(api, address, config.erc20Contract),
				)
			}
			if (config.assetId === undefined) {
				return zeroBalance('hydration', symbol)
			}
			return toStablecoinBalance(
				'hydration',
				symbol,
				await fetchHydrationTokenBalance(api, address, config.assetId),
			)
		} catch {
			return zeroBalance('hydration', symbol)
		}
	},
	transfer: async ({ symbol, recipient, amount }) => {
		const config = getStablecoinAssetConfig('hydration', symbol)
		if (config?.assetId === undefined) {
			return undefined
		}

		const api = await getApi()
		return asTx(
			api.tx.tokens.transferKeepAlive(recipient, config.assetId, amount),
		)
	},
	paymentOptions: () => undefined,
	estimateFee: async ({ symbol, tx, from, payloadOptions }) => {
		const { partialFee: nativeFee } = await tx.paymentInfo(from, payloadOptions)
		return estimateHydrationFee(await getApi(), symbol, nativeFee)
	},
	hydrationFeeCurrency: async (address) => {
		const api = await getApi()
		const assetId = await api.query.multiTransactionPayment
			.accountCurrencyMap(address)
			.catch(() => undefined)

		return getStablecoinFeeAssets('hydration').find((symbol) => {
			const config = getStablecoinAssetConfig('hydration', symbol)
			return config?.assetId === assetId
		})
	},
	setHydrationFeeCurrency: async (symbol) => {
		const config = getStablecoinAssetConfig('hydration', symbol)
		if (config?.assetId === undefined) {
			return undefined
		}

		const api = await getApi()
		return asTx(api.tx.multiTransactionPayment.setCurrency(config.assetId))
	},
})
