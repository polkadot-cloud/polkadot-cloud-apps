// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronDown, faGlasses } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import classNames from 'classnames'
import type { ButtonAccountLabelProps } from '../types'
import classes from './index.module.scss'

export const Label = ({
	activeAccount,
	readOnly,
	open,
	label,
	className,
	marginLeft,
	style,
}: ButtonAccountLabelProps) => {
	const allClasses = classNames(classes.btnAccount, {
		[classes.marginLeft]: marginLeft,
	})
	const arrowClasses = classNames(classes.arrow, {
		[classes.open]: open,
	})

	const address = activeAccount?.address || ''
	const name = activeAccount?.name || ''

	const accountDisplay: string | null =
		address === null
			? null
			: address !== ''
				? name || ellipsisFn(address)
				: ellipsisFn(address)

	const displayClasses = classNames(classes.display, {
		[classes.minimize]: !!address,
	})

	return (
		<div
			className={`${className ? `${className} ` : ' '}${allClasses}`}
			style={style}
		>
			<span className={classes.polkicon}>
				<Polkicon
					background="transparent"
					address={address}
					transform="grow-9"
				/>
			</span>
			<span className={displayClasses}>{accountDisplay}</span>
			{label && <span className={classes.label}>/ {label}</span>}
			{readOnly && (
				<FontAwesomeIcon icon={faGlasses} className={classes.icon} />
			)}
			<div className={arrowClasses}>
				<FontAwesomeIcon icon={faChevronDown} transform="shrink-5" />
			</div>
		</div>
	)
}
