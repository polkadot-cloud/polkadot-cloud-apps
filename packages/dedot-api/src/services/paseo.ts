// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PaseoAssetHubApi } from '@dedot/chaintypes'
import type { PaseoPeopleApi } from '@dedot/chaintypes/paseo-people'
import {
	type DedotClient,
	ExtraSignedExtension,
	type SmoldotProvider,
	type WsProvider,
} from 'dedot'
import type {
	NetworkConfig,
	NetworkId,
	ServiceInterface,
	SystemChainId,
} from 'types'
import { BaseService } from '../defaultService/baseService'
import type { DefaultServiceClass } from '../defaultService/types'
import { query } from '../query'
import { runtimeApi } from '../runtimeApi'
import { tx } from '../tx'
import { createPool } from '../tx/createPool'

export class PaseoService
	extends BaseService<
		PaseoPeopleApi, // People Chain
		PaseoAssetHubApi, // Asset Hub Chain
		PaseoAssetHubApi // Chain for staking
	>
	implements
		DefaultServiceClass<
			PaseoPeopleApi, // People Chain
			PaseoAssetHubApi, // Asset Hub Chain
			PaseoAssetHubApi // Chain for staking
		>
{
	// Service interface
	interface: ServiceInterface

	constructor(
		public networkConfig: NetworkConfig,
		public ids: [NetworkId, SystemChainId, SystemChainId],
		public apiHub: DedotClient<PaseoAssetHubApi>,
		public providerRelay: WsProvider | SmoldotProvider,
		public providerPeople: WsProvider | SmoldotProvider,
	) {
		super(networkConfig, ids, apiHub, apiHub, providerRelay, providerPeople)

		// Initialize service interface with network-specific routing
		this.interface = {
			stablecoins: {
				query: {
					balances: async () => [],
					balance: async () => undefined,
					hydrationFeeCurrency: async () => undefined,
				},
				tx: {
					transfer: async () => undefined,
					setHydrationFeeCurrency: async () => undefined,
				},
				fee: {
					paymentOptions: () => undefined,
					estimate: async () => 0n,
				},
			},
			query: {
				accountBalance: {
					hub: async (address) =>
						await query.accountBalance(this.apiHub, address),
				},
				claimPermissionsMulti: async (addresses) =>
					await query.claimPermissionsMulti(this.apiHub, addresses),
				erasStakersOverview: async (era, address) =>
					await query.erasStakersOverview(this.apiHub, era, address),
				erasRewardPoints: async (era) =>
					await query.erasRewardPoints(this.apiHub, era),
				erasValidatorReward: async (era) =>
					await query.erasValidatorReward(this.apiHub, era),
				erasValidatorRewardMulti: async (eras) =>
					await query.erasValidatorRewardMulti(this.apiHub, eras),
				bondedPool: async (poolId) =>
					await query.bondedPool(this.apiHub, poolId),
				bondedPoolEntries: async () =>
					await query.bondedPoolEntries(this.apiHub),
				erasStakersOverviewEntries: async (era) =>
					await query.erasStakersOverviewEntries(this.apiHub, era),
				erasStakersPagedEntries: async (era, validator) =>
					await query.erasStakersPagedEntries(this.apiHub, era, validator),
				nominatorsMulti: async (addresses) =>
					await query.nominatorsMulti(this.apiHub, addresses),
				poolMembersMulti: async (addresses) =>
					await query.poolMembersMulti(this.apiHub, addresses),
				poolMetadataMulti: async (poolIds) =>
					await query.poolMetadataMulti(this.apiHub, poolIds),
				identityOfMulti: async (addresses) =>
					await this.identityManager.identityOfMulti(addresses),
				superOfMulti: async (addresses) =>
					await this.identityManager.superOfMulti(addresses),
				validatorEntries: async () => await query.validatorEntries(this.apiHub),
				validatorsMulti: async (addresses) =>
					await query.validatorsMulti(this.apiHub, addresses),
			},
			runtimeApi: {
				balanceToPoints: async (poolId, amount) =>
					await runtimeApi.balanceToPoints(this.apiHub, poolId, amount),
				pendingRewards: async (address) =>
					await runtimeApi.pendingRewards(this.apiHub, address),
				pointsToBalance: async (poolId, points) =>
					await runtimeApi.pointsToBalance(this.apiHub, poolId, points),
			},
			tx: {
				batch: (calls) => tx.batch(this.apiHub, calls),
				createPool: (from, poolId, bond, metadata, nominees, roles) =>
					createPool(
						this.apiHub,
						from,
						poolId,
						bond,
						metadata,
						nominees,
						roles,
					),
				joinPool: (poolId, bond, claimPermission) =>
					tx.joinPool(this.apiHub, poolId, bond, claimPermission),
				newNominator: (bond, payee, nominees) =>
					tx.newNominator(this.apiHub, bond, payee, nominees),
				payoutStakersByPage: (validator, era, page) =>
					tx.payoutStakersByPage(this.apiHub, validator, era, page),
				poolBondExtra: (type, bond) =>
					tx.poolBondExtra(this.apiHub, type, bond),
				poolChill: (poolId) => tx.poolChill(this.apiHub, poolId),
				poolClaimCommission: (poolId) =>
					tx.poolClaimCommission(this.apiHub, poolId),
				poolClaimPayout: () => tx.poolClaimPayout(this.apiHub),
				poolNominate: (poolId, nominees) =>
					tx.poolNominate(this.apiHub, poolId, nominees),
				poolSetClaimPermission: (claimPermission) =>
					tx.poolSetClaimPermission(this.apiHub, claimPermission),
				poolSetCommission: (poolId, commission) =>
					tx.poolSetCommission(this.apiHub, poolId, commission),
				poolSetCommissionChangeRate: (poolId, maxIncrease, minDelay) =>
					tx.poolSetCommissionChangeRate(
						this.apiHub,
						poolId,
						maxIncrease,
						minDelay,
					),
				poolSetCommissionMax: (poolId, max) =>
					tx.poolSetCommissionMax(this.apiHub, poolId, max),
				poolSetMetadata: (poolId, metadata) =>
					tx.poolSetMetadata(this.apiHub, poolId, metadata),
				poolSetState: (poolId, state) =>
					tx.poolSetState(this.apiHub, poolId, state),
				poolUnbond: (who, points) => tx.poolUnbond(this.apiHub, who, points),
				poolUpdateRoles: (poolId, roles) =>
					tx.poolUpdateRoles(this.apiHub, poolId, roles),
				poolWithdraw: (who, numSlashingSpans) =>
					tx.poolWithdraw(this.apiHub, who, numSlashingSpans),
				proxy: (real, call) => tx.proxy(this.apiHub, real, call),
				setController: () => tx.setController(this.apiHub),
				stakingBondExtra: (bond) => tx.stakingBondExtra(this.apiHub, bond),
				stakingChill: () => tx.stakingChill(this.apiHub),
				stakingNominate: (nominees) =>
					tx.stakingNominate(this.apiHub, nominees),
				stakingRebond: (bond) => tx.stakingRebond(this.apiHub, bond),
				stakingSetPayee: (payee) => tx.stakingSetPayee(this.apiHub, payee),
				stakingUnbond: (bond) => tx.stakingUnbond(this.apiHub, bond),
				stakingWithdraw: (numSlashingSpans) =>
					tx.stakingWithdraw(this.apiHub, numSlashingSpans),
				transferKeepAlive: (to, value) =>
					tx.transferKeepAlive(this.apiHub, to, value),
			},
			signer: {
				extraSignedExtension: (
					specName,
					signerAddress,
					payloadOptions = undefined,
				) =>
					new ExtraSignedExtension(this.getLiveApi(specName), {
						signerAddress,
						payloadOptions,
					}),
				metadata: async (specName) =>
					await this.getLiveApi(specName).call.metadata.metadataAtVersion(15),
			},
			spec: {
				ss58: (specName) => this.getLiveApi(specName).consts.system.ss58Prefix,
			},
			codec: {
				$Signature: (specName) =>
					this.getLiveApi(specName).registry.findCodec(
						this.getLiveApi(specName).registry.metadata.extrinsic
							.signatureTypeId,
					),
			},
		}
	}

	async start() {
		await super.start(this.interface)
	}
}
