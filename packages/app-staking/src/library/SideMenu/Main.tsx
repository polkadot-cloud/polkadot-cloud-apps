// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { PageCategories, PagesConfig } from 'config'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { useUi } from 'hooks/useUi'
import { useWarnings } from 'hooks/useWarnings'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import type { PageCategory, PageItem, PagesConfigItems } from 'types'
import { Primary } from 'ui-app/SideMenu'
import { Page } from 'ui-core/base'
import { getPagesConfig, pageKeyExistsInCategory } from 'utils'

export const Main = ({
	activeCategory,
	showHeaders = false,
	hidden = false,
}: {
	activeCategory: number | null
	showHeaders?: boolean
	hidden?: boolean
}) => {
	const { t } = useTranslation('app')
	const navigate = useNavigate()
	const { syncing } = useSyncing()
	const { network } = useNetwork()
	const { pathname } = useLocation()
	const { inPool } = useActivePool()
	const { isBonding } = useStaking()
	const { formatWithPrefs } = useValidators()
	const { activeAddress } = useActiveAccount()
	const { sideMenuMinimised, advancedMode } = useUi()
	const { getNominations, getStakingLedger } = useBalances()
	const { warningMessages, getMostSevereWarningFormat } = useWarnings()
	const { controllerUnmigrated } = getStakingLedger(activeAddress)
	const { balances, nominatorBalance } = useAccountBalances(activeAddress)
	const { totalUnlockChunks } = balances.nominator
	
	const menuMinimised = sideMenuMinimised && !advancedMode
	const nominated = formatWithPrefs(getNominations(activeAddress))
	const fullCommissionNominees = nominated.filter(
		(nominee) => nominee.prefs.commission === 100,
	)

	const pages: PageItem[] = getPagesConfig(
		PagesConfig,
		network,
		activeCategory,
		advancedMode,
		{ inPool, isBonding },
	)

	const pageChanged = activeCategory
		? !pageKeyExistsInCategory(PagesConfig, pathname, activeCategory)
		: false

	let i = 0
	for (const { uri } of pages) {
		const handleBullets = (): boolean => {
			if (uri === `${import.meta.env.BASE_URL}`) {
				const warning = !syncing && controllerUnmigrated
				if (warning) {
					pages[i].bullet = 'warning'
					return true
				}
			}
			if (uri === `${import.meta.env.BASE_URL}nominate`) {
				if (isBonding || totalUnlockChunks > 0) {
					pages[i].bullet = 'accent'
					return true
				}
				if (
					(!syncing && controllerUnmigrated) ||
					(isBonding && fullCommissionNominees.length > 0)
				) {
					pages[i].bullet = 'warning'
					return true
				}
			}
			if (uri === `${import.meta.env.BASE_URL}pool`) {
				if (inPool) {
					if (warningMessages.length > 0) {
						pages[i].bullet = getMostSevereWarningFormat()
						return true
					}
					pages[i].bullet = 'accent'
					return true
				}
			}
			if (uri === `${import.meta.env.BASE_URL}stake`) {
				if (inPool || nominatorBalance.isGreaterThan(0)) {
					if (warningMessages.length > 0) {
						pages[i].bullet = getMostSevereWarningFormat()
						return true
					}
					pages[i].bullet = 'accent'
					return true
				}
			}
			return false
		}

		handleBullets()
		if (!handleBullets()) {
			pages[i].bullet = undefined
		}
		i++
	}

	const categories = advancedMode
		? PageCategories
		: PageCategories.filter(({ advanced }) => !advanced)

	const pageConfig = {
		categories,
		pages,
	}

	const pagesToDisplay: PagesConfigItems = Object.values(pageConfig.pages)

	return (
		<>
			{pageConfig.categories.map(
				({ id: categoryId, key: categoryKey }: PageCategory) => (
					<div
						className="inner"
						key={`sidemenu_category_${categoryId}`}
						style={{ opacity: hidden ? 0 : 1 }}
					>
						{showHeaders && (
							<Page.Side.Heading
								title={t(categoryKey)}
								minimised={menuMinimised}
							/>
						)}
						{pagesToDisplay.map(
							({ category, hash, key, faIcon, bullet }: PageItem, index) => {
								return (
									<Fragment key={`sidemenu_page_${categoryId}_${key}`}>
										{category === categoryId && (
											<Primary
												pageKey={key}
												name={t(key)}
												to={() => {
													navigate(hash)
												}}
												active={
													hash === pathname || (index === 0 && pageChanged)
												}
												faIcon={faIcon}
												bullet={bullet}
												minimised={menuMinimised}
												advanced={advancedMode}
											/>
										)}
									</Fragment>
								)
							},
						)}
					</div>
				),
			)}
		</>
	)
}
