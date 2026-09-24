// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faComments } from '@fortawesome/free-regular-svg-icons'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLayoutEffect, useRef, useState } from 'react'
import classes from './index.module.scss'
import type { ChatMessagesProps } from './types'

/** Preserve the reading position when prepending history; follow only near bottom. */
export const ChatMessages = ({
	messages,
	label,
	olderLabel,
	latestLabel,
	hasOlder,
	loadingOlder,
	onLoadOlder,
	empty,
	loading = false,
	prompt,
}: ChatMessagesProps) => {
	const scroll = useRef<HTMLDivElement>(null)
	const previous = useRef({ first: '', height: 0 })
	const following = useRef(true)
	const [atBottom, setAtBottom] = useState(true)
	useLayoutEffect(() => {
		const element = scroll.current
		if (!element) {
			return
		}
		const first = messages[0]?.id ?? ''
		if (previous.current.first && first !== previous.current.first) {
			element.scrollTop += element.scrollHeight - previous.current.height
		} else if (following.current) {
			element.scrollTop = element.scrollHeight
		}
		previous.current = { first, height: element.scrollHeight }
	}, [messages])
	return (
		<div className={classes.history}>
			<div
				className={classes.scroll}
				ref={scroll}
				onScroll={(event) => {
					const element = event.currentTarget
					following.current =
						element.scrollHeight - element.scrollTop - element.clientHeight < 80
					setAtBottom(following.current)
				}}
			>
				{hasOlder && (
					<button
						type="button"
						className={classes.historyButton}
						disabled={loadingOlder}
						onClick={onLoadOlder}
					>
						{olderLabel}
					</button>
				)}
				{messages.length ? (
					<ol
						className={classes.messages}
						role="log"
						aria-label={label}
						aria-relevant="additions text"
					>
						{messages.map((message) => (
							<li
								key={message.id}
								className={classes.message}
								data-mine={message.mine}
							>
								<div className={classes.bubble}>
									<strong>{message.author}</strong>
									<p>{message.body}</p>
									{message.content}
								</div>
								<time dateTime={message.createdAt}>
									{new Date(message.createdAt).toLocaleString(undefined, {
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</time>
							</li>
						))}
					</ol>
				) : prompt ? null : (
					<div className={classes.empty} role="status">
						<div className={classes.emptyIcon} aria-hidden="true">
							{loading ? (
								<span className={classes.loadingDots}>
									<span />
									<span />
									<span />
								</span>
							) : (
								<FontAwesomeIcon icon={faComments} />
							)}
						</div>
						{empty}
					</div>
				)}
				{prompt}
			</div>
			{!atBottom && (
				<button
					className={classes.latest}
					type="button"
					onClick={() => {
						if (scroll.current) {
							scroll.current.scrollTop = scroll.current.scrollHeight
						}
						following.current = true
						setAtBottom(true)
					}}
				>
					<FontAwesomeIcon icon={faArrowDown} />
					{latestLabel}
				</button>
			)}
		</div>
	)
}
