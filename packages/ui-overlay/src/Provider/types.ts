// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentType, FC, ReactNode, RefObject } from 'react'
import type {
	ActiveOverlayInstance,
	AnyJson,
	CanvasSize,
	CanvasStatus,
	ModalSize,
	ModalStatus,
	OverlayInstanceDirection,
	OverlayType,
} from 'types'

export interface OverlayContextInterface {
	openOverlayInstances: number
	setOpenOverlayInstances: (
		direction: OverlayInstanceDirection,
		instanceType: OverlayType,
	) => void
	activeOverlayInstance: ActiveOverlayInstance
	setActiveOverlayInstance: (instance: ActiveOverlayInstance) => void
	canvas: {
		status: CanvasStatus
		config: CanvasConfig
		openCanvas: (config: CanvasConfig) => void
		closeCanvas: () => void
		setCanvasStatus: (status: CanvasStatus) => void
		setCanvasConfig: (config: CanvasConfig) => void
	}
	modal: {
		status: ModalStatus
		config: AnyJson
		modalHeight: number
		modalResizeCounter: number
		modalMaxHeight: number
		openModal: (config: ModalConfig) => void
		closeModal: () => void
		replaceModal: (config: ModalConfig) => void
		setModalHeight: (height: number, transition?: boolean) => void
		setModalResize: () => void
		setModalStatus: (status: ModalStatus) => void
		setModalRef: (modalRef: RefObject<HTMLDivElement | null>) => void
		setModalHeightRef: (heightRef: RefObject<HTMLDivElement | null>) => void
	}
	prompt: PromptContextInterface
}
export interface Fallback {
	fallback: FC
}

export type CanvasProps = Fallback & {
	canvas?: Record<string, ComponentType>
	externalOverlayStatus: CanvasStatus
}

export type ModalProps = Fallback & {
	modals?: Record<string, ComponentType>
	externalOverlayStatus: CanvasStatus
}
export type OverlayProps = ModalProps & CanvasProps
export type ConfigOptions = Record<string, AnyJson>

export interface ModalConfig {
	key: string
	options?: ConfigOptions
	size?: ModalSize
}

export interface CanvasConfig {
	key: string
	scroll?: boolean
	size?: CanvasSize
	options?: ConfigOptions
}

export interface PromptContextInterface {
	setOnClosePrompt: (onClosePrompt: (() => void) | null) => void
	openPromptWith: (
		prompt: PromptContent,
		size?: PromptSize,
		closeOnOutsideClick?: boolean,
	) => void
	closePrompt: () => void
	setStatus: (status: number) => void
	setPrompt: (prompt: PromptContent) => void
	size: PromptSize
	status: number
	Prompt: PromptContent
	closeOnOutsideClick: boolean
	setCloseOnOutsideClick: (canClose: boolean) => void
}

export interface PromptState {
	size: PromptSize
	status: number
	Prompt: PromptContent
	onClosePrompt: (() => void) | null
}

export type PromptContent = ReactNode | null

export type PromptSize = 'sm' | 'lg'
