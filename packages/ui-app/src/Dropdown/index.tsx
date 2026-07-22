// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'
import classes from './index.module.scss'
import type { DropdownProps } from './types'

export type { DropdownOption, DropdownProps } from './types'

export const Dropdown = <T extends string>({
	options,
	selected,
	onSelect,
	variant = 'compact',
}: DropdownProps<T>) => {
	const [isOpen, setIsOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isOpen) {
			return
		}

		const handlePointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen])

	return (
		<div className={classes.wrapper} ref={ref}>
			<button
				type="button"
				className={`${classes.trigger} ${
					variant === 'full' ? classes.triggerFull : classes.triggerCompact
				}`}
				aria-expanded={isOpen}
				onClick={() => setIsOpen((open) => !open)}
			>
				<span className={classes.value}>
					{selected.icon && (
						<img
							src={selected.icon}
							alt={selected.label}
							className={classes.icon}
						/>
					)}
					<span className={classes.selectedLabel}>{selected.label}</span>
				</span>
				<FontAwesomeIcon icon={faChevronDown} className={classes.chevron} />
			</button>

			{isOpen && (
				<div
					className={`${classes.menu} ${
						variant === 'full' ? classes.menuTopLayer : ''
					}`}
				>
					{options.map((option) => {
						const selectedOption = option.value === selected.value

						return (
							<button
								type="button"
								key={option.value}
								className={`${classes.option} ${
									selectedOption ? classes.optionActive : ''
								}`}
								onClick={() => {
									onSelect(option)
									setIsOpen(false)
								}}
							>
								<span className={classes.value}>
									{option.icon && (
										<img
											src={option.icon}
											alt={option.label}
											className={classes.icon}
										/>
									)}
									<span>{option.label}</span>
								</span>
								{selectedOption && (
									<FontAwesomeIcon icon={faCheck} className={classes.check} />
								)}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
