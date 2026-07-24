// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, useAnimate } from 'motion/react'
import { useEffect, useState } from 'react'
import styles from './index.module.scss'
import type { TipDisplay, TipItemsProps } from './types'

export const Items = ({ items, page }: TipItemsProps) => {
	const [scope, animate] = useAnimate()

	// stores whether this is the initial display of tips
	const [initial, setInitial] = useState<boolean>(true)

	useEffect(() => {
		doControls(true)
		setInitial(false)
	}, [page])

	const doControls = async (transition: boolean) => {
		if (transition) {
			await animate(scope.current, { opacity: 0 }, { duration: 0 })
			await animate(scope.current, { opacity: 1 }, { duration: 0.3 })
		} else {
			await animate(scope.current, { opacity: 1 }, { duration: 0 })
		}
	}

	return (
		<motion.div
			className={styles.itemsWrapper}
			ref={scope}
			initial={{ opacity: 0 }}
		>
			{items.map((item, index: number) => (
				<Item
					key={`tip_${item.id}_${page}`}
					index={index}
					{...item}
					initial={initial}
				/>
			))}
		</motion.div>
	)
}

const Item = ({
	subtitle,
	onTipClick,
	faTipIcon,
	index,
	initial,
}: TipDisplay & { index: number; initial: boolean }) => {
	const [scope, animate] = useAnimate()
	const [isStopped, setIsStopped] = useState<boolean>(true)

	useEffect(() => {
		const delay = index * 75

		if (initial) {
			setTimeout(() => {
				if (isStopped) {
					setIsStopped(false)
				}
				// Animate the item in with spring transition
				animate(
					scope.current,
					{ y: 0, opacity: 1 },
					{
						delay: index * 0.2,
						duration: 0.7,
						type: 'spring' as const,
						bounce: 0.35,
					},
				)
			}, delay)
		} else {
			// Immediate animation without delay for non-initial renders
			animate(
				scope.current,
				{ y: 0, opacity: 1 },
				{
					delay: index * 0.2,
					duration: 0.7,
					type: 'spring' as const,
					bounce: 0.35,
				},
			)
		}
	}, [initial, index])

	return (
		<motion.div
			className={styles.itemWrapper}
			ref={scope}
			initial={{ y: 15, opacity: 0 }}
		>
			<div className={styles.itemInner}>
				<section>
					{faTipIcon && (
						<FontAwesomeIcon icon={faTipIcon} transform="shrink-1" />
					)}
				</section>
				<section>
					<div className={`${styles.desc} ${styles.active}`}>
						{onTipClick ? (
							<button onClick={() => onTipClick()} type="button">
								<h4>{subtitle}</h4>
							</button>
						) : (
							<h4>{subtitle}</h4>
						)}
					</div>
				</section>
			</div>
		</motion.div>
	)
}
