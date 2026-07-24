// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	IconDefinition,
	IconProp,
} from '@fortawesome/fontawesome-svg-core'
import type { MaybeString } from '@w3ux/types'
import type { FunctionComponent, MouseEvent, SVGProps } from 'react'
import type {
	ComponentBase,
	ComponentBaseWithClassName,
	ImportedAccount,
} from 'types'

// Common button props, applied to all buttons.
export interface ButtonCommonProps {
	// whether the button is disabled.
	disabled?: boolean
	// include a left margin
	marginLeft?: boolean
	// include a right margin.
	marginRight?: boolean
	// include x margin around button.
	marginX?: boolean
	// enable flex grow.
	grow?: boolean
	// onClick handler of button.
	onClick?: (e?: MouseEvent<HTMLButtonElement>) => void
	// onMouseOver handler of button.
	onMouseOver?: (e?: MouseEvent<HTMLButtonElement>) => void
	// onMouseMove handler of button.
	onMouseMove?: (e?: MouseEvent<HTMLButtonElement>) => void
	// onMouseOut handler of button.
	onMouseOut?: (e?: MouseEvent<HTMLButtonElement>) => void
}

export type ButtonSize = 'sm' | 'md' | 'lg'

// Button mouse event handler props.
export interface OnMouseHandlersProps {
	onClick?: (e: MouseEvent<HTMLButtonElement>) => void
	onMouseOver?: (e: MouseEvent<HTMLButtonElement>) => void
	onMouseMove?: (e: MouseEvent<HTMLButtonElement>) => void
	onMouseOut?: (e: MouseEvent<HTMLButtonElement>) => void
}

export interface ButtonIconProps {
	iconLeft?: IconProp | IconDefinition
	iconRight?: IconProp | IconDefinition
	iconTransform?: string
}

export type ButtonCopyProps = ComponentBase & {
	onClick?: (e?: MouseEvent<HTMLButtonElement>) => void
	value: string
	size?: string | number
	portalContainer?: HTMLDivElement
	xMargin?: boolean
	tooltipText: {
		copy: string
		copied: string
	}
}

export interface ButtonQuickActionProps {
	onClick?: (e?: MouseEvent<HTMLButtonElement>) => void
	label: string
	disabled?: boolean
	Icon: FunctionComponent<
		SVGProps<SVGSVGElement> & { title?: string | undefined }
	>
}

export type ButtonHelpProps = ComponentBaseWithClassName &
	ButtonCommonProps & {
		background?: 'primary' | 'secondary' | 'none'
		outline?: boolean
		openHelp?: (
			definition: MaybeString,
			anchor: HTMLButtonElement | null,
		) => void
		definition?: string
	}

export type ButtonMonoProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		lg?: boolean
		text: string
	}

export type ButtonMonoInvertProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		lg?: boolean
		text: string
	}

export type ButtonOptionProps = ComponentBaseWithClassName &
	ButtonCommonProps & {
		content?: boolean
	}

export type ButtonPrimaryProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		size?: ButtonSize
		text: string
		asLabel?: boolean
	}

export type ButtonPrimaryInvertProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		lg?: boolean
		text: string
		asLabel?: boolean
	}

export type ButtonSecondaryProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		size?: ButtonSize
		text: string
		variant?: 'warning' | 'danger'
		active?: boolean
		asTab?: boolean
	}

export type ButtonSubmitProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		text: string
		lg?: boolean
		pulse?: boolean
	}

export type ButtonSubmitLargeProps = ComponentBaseWithClassName & {
	submitText: string
	onSubmit: () => void
	icon?: IconProp | IconDefinition
	iconTransform?: string
	disabled?: boolean
	pulse?: boolean
}

export type ButtonSubmitWithFeeProps = ComponentBaseWithClassName & {
	submitText: string
	onSubmit: () => void
	icon?: IconProp | IconDefinition
	iconTransform?: string
	disabled?: boolean
	pulse?: boolean
	fee?: React.ReactNode
}

export type ButtonSubmitInvertProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		text: string
		lg?: boolean
	}

export type ButtonTabProps = ComponentBaseWithClassName &
	ButtonCommonProps & {
		colorSecondary?: boolean
		active?: boolean
		title: string
		badge?: string | number
	}

export type ButtonTabPreloaderProps = ComponentBaseWithClassName & {
	colorSecondary?: boolean
	width?: string | number
}

export type ButtonTertiaryProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		text: string
	}

export type ButtonTextProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		text: string
		size?: Omit<ButtonSize, 'lg'>
		status?: 'danger'
	}

export type ButtonMenuProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		text: string
		status?: 'danger'
		asLabel?: boolean
	}

export type MultiButtonContainerProps = ComponentBase & {
	marginLeft?: boolean
	marginRight?: boolean
	marginX?: boolean
	disabled?: boolean
}

export type MultiButtonButtonProps = ComponentBaseWithClassName &
	ButtonIconProps &
	ButtonCommonProps & {
		text: string
		size?: Omit<ButtonSize, 'lg'>
	}

export type ButtonHeaderProps = ComponentBaseWithClassName & {
	marginRight?: boolean
	marginX?: boolean
	icon: IconProp | IconDefinition
	iconTransform?: string
	active?: boolean
	acknowledged?: boolean
}

export type ButtonAccountLabelProps = ComponentBaseWithClassName & {
	activeAccount: ImportedAccount | null
	readOnly: boolean
	open: boolean
	label?: string
	marginLeft?: boolean
	marginRight?: boolean
	marginX?: boolean
}

export type ButtonAccountStandaloneProps = ComponentBaseWithClassName &
	OnMouseHandlersProps & {
		label: string
		marginLeft?: boolean
		marginRight?: boolean
		marginX?: boolean
		disabled?: boolean
	}

export type ButtonModalProps = ComponentBaseWithClassName &
	ButtonCommonProps & {
		selected: boolean
		text: string
		label?: string
	}

export type ButtonPopoverTabProps = ComponentBaseWithClassName &
	OnMouseHandlersProps & {
		text: string
		status?: 'warning' | 'danger'
		disabled?: boolean
		grow?: boolean
	}

export interface QuickActionFooterButtonProps
	extends ComponentBaseWithClassName {
	icon: IconDefinition
	label: string
	onClick: () => void
}
