// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { Loader } from 'ui-core/base'
import classes from './index.module.scss'

const Shadow = ({ className }: { className: string }) => (
	<Loader className={classNames(classes.shadow, className)} />
)

const CardSkeleton = () => (
	<div className={classes.card} aria-hidden="true">
		<div className={classes.cardRegion}>
			<div className={classes.cardHeader}>
				<Shadow className={classes.avatar} />
				<div className={classes.identity}>
					<Shadow className={classes.identityPrimary} />
					<Shadow className={classes.identitySecondary} />
				</div>
				<div className={classes.actions}>
					<Shadow className={classes.action} />
					<Shadow className={classes.action} />
					<Shadow className={classes.actionWide} />
				</div>
			</div>
		</div>
	</div>
)

const BarSkeleton = () => (
	<div className={classes.bar} aria-hidden="true">
		<div className={classes.barRegion}>
			<Shadow className={classes.avatar} />
			<div className={classes.identity}>
				<Shadow className={classes.identityPrimary} />
				<Shadow className={classes.identitySecondary} />
			</div>
		</div>
	</div>
)

export const DetailedListSkeleton = ({ format }: { format: 'row' | 'col' }) =>
	format === 'row' ? <BarSkeleton /> : <CardSkeleton />
