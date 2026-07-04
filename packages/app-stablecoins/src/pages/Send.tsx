import {
	faArrowDown,
	faChevronDown,
	faPaperPlane,
	faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import usdcSvg from 'assets/token/usdc.svg'
import { useState } from 'react'
import { Page } from 'ui-core/base'
import classes from './Send.module.scss'

export const Send = () => {
	const [amount, setAmount] = useState('1000.00')
	const [address, setAddress] = useState('')

	return (
		<Page.Row>
			<div className={classes.page}>
				<header className={classes.header}>
					<h1 className={classes.title}>Send Assets</h1>
					<p className={classes.subtitle}>
						Transfer liquidity to another address on the same network.
					</p>
				</header>

				<div className={classes.card}>
					<div className={classes.inputSectionTop}>
						<div className={classes.sectionLabelRow}>
							<span className={classes.sectionLabel}>Send From</span>
						</div>
						<div className={classes.addressInput}>
							<FontAwesomeIcon
								icon={faWallet}
								className={classes.addressIcon}
							/>
							<input
								type="text"
								placeholder="Enter sender address..."
								className={classes.addressField}
							/>
						</div>
					</div>

					<div className={classes.directionIndicator}>
						<div className={classes.directionButton}>
							<FontAwesomeIcon
								icon={faArrowDown}
								className={classes.directionIcon}
							/>
						</div>
					</div>

					<div className={classes.inputSectionTop}>
						<div className={classes.sectionLabelRow}>
							<span className={classes.sectionLabel}>Send To</span>
						</div>
						<div className={classes.addressInput}>
							<FontAwesomeIcon
								icon={faWallet}
								className={classes.addressIcon}
							/>
							<input
								type="text"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								placeholder="Enter recipient address..."
								className={classes.addressField}
							/>
						</div>
					</div>

					<div className={classes.inputSection}>
						<div className={classes.assetLabelRow}>
							<span className={classes.sectionLabel}>Asset to Send</span>
							<span className={classes.balanceLabel}>
								Available:{' '}
								<span className={classes.balanceHighlight}>
									750,000.00 USDC
								</span>
							</span>
						</div>
						<div className={classes.inputRow}>
							<input
								type="text"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className={classes.amountInput}
								placeholder="0.00"
							/>
							<button type="button" className={classes.tokenSelector}>
								<img src={usdcSvg} alt="USDC" className={classes.tokenIcon} />
								<span className={classes.tokenName}>USDC</span>
								<FontAwesomeIcon
									icon={faChevronDown}
									className={classes.tokenChevron}
								/>
							</button>
						</div>
					</div>

					<div className={classes.details}>
						<div className={classes.detailRow}>
							<span className={classes.detailLabel}>Network Fee</span>
							<span className={classes.detailValue}>0.002 DOT</span>
						</div>
						<div className={classes.detailRow}>
							<span className={classes.detailLabel}>Estimated Time</span>
							<span className={classes.detailValueGreen}>~6 Seconds</span>
						</div>
					</div>

					<div className={classes.actionWrapper}>
						<button type="button" className={classes.actionBtn}>
							<FontAwesomeIcon
								icon={faPaperPlane}
								className={classes.actionBtnIcon}
							/>
							Send Assets
						</button>
					</div>
				</div>
			</div>
		</Page.Row>
	)
}
