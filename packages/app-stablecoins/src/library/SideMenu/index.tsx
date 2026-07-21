// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	DefaultMenu,
	FloatingMenu,
	type SideMenuMainRenderProps,
} from 'ui-app/SideMenu'
import { Main } from './Main'

export const SideMenu = ({
	enableAdvancedMenu,
}: {
	enableAdvancedMenu: false
}) => {
	const renderMain = (_props: SideMenuMainRenderProps) => <Main />

	return (
		<>
			<DefaultMenu
				barItems={[]}
				getActivePageForCategory={() => '/send'}
				localCategory="stake"
				pageCategories={[]}
				pagesConfig={[]}
				renderMain={renderMain}
				title="Cloud"
				enableAdvancedMenu={enableAdvancedMenu}
			/>
			<FloatingMenu
				renderMain={renderMain}
				title="Cloud"
				enableAdvancedMenu={enableAdvancedMenu}
			/>
		</>
	)
}
