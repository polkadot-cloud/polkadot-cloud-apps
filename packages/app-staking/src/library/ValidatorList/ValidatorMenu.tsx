// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ValidatorMenuPopover,
	ValidatorMenuTrigger,
	ValidatorMenuWrapper,
} from './Wrappers'

export const ValidatorMenu = () => {
	const { t } = useTranslation('app')
	const [open, setOpen] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const menuId = useId()

	useEffect(() => {
		if (!open) {
			return
		}

		const handlePointerDown = (event: PointerEvent) => {
			if (!wrapperRef.current?.contains(event.target as Node)) {
				setOpen(false)
			}
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [open])

	const closePlaceholder = () => setOpen(false)

	return (
		<ValidatorMenuWrapper ref={wrapperRef}>
			<ValidatorMenuTrigger
				type="button"
				aria-label={t('validatorActions', {
					defaultValue: 'Validator actions',
				})}
				aria-haspopup="menu"
				aria-controls={menuId}
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
			>
				<FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
			</ValidatorMenuTrigger>
			{open && (
				<ValidatorMenuPopover id={menuId} role="menu">
					<button type="button" role="menuitem" onClick={closePlaceholder}>
						{t('metrics')}
					</button>
					<button type="button" role="menuitem" onClick={closePlaceholder}>
						{t('identityGraph', { defaultValue: 'Identity Graph' })}
					</button>
				</ValidatorMenuPopover>
			)}
		</ValidatorMenuWrapper>
	)
}
