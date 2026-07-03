// Copyright 2023 @polkadot-cloud/polkadot-staking-dashboard authors & contributors

import { Padding } from 'ui-core/modal'
import { Title } from 'ui-core/prompt'

export const Disclaimer = () => (
	<>
		<Title title="Disclaimer" />
		<Padding>
			<p>
				This Polkadot Staking Dashboard (“Dashboard”) is made available free of
				charge by JKRB Investments Limited and its affiliates (&quot;Web3
				entities&quot;) as open source software under the{' '}
				<a
					href="https://www.gnu.org/licenses/gpl-3.0.en.html"
					target="_blank"
					rel="noreferrer"
				>
					GPL 3.0 licence
				</a>{' '}
				(a copy of the{' '}
				<a
					href="https://github.com/polkadot-cloud/polkadot-staking-dashboard"
					target="_blank"
					rel="noreferrer"
				>
					dashboard code
				</a>
				).
			</p>
			<p>
				THE DASHBOARD ALLOWS USERS TO JOIN NOMINATION POOLS BUT IS NOT ITSELF A
				STAKING SERVICE. BY USING THE DASHBOARD YOU ARE DEEMED TO HAVE: (I)
				READ, UNDERSTOOD AND AGREED TO THE DISCLAIMER BELOW and THE{' '}
				<a
					href="https://wiki.polkadot.network/docs/learn-nomination-pools"
					target="_blank"
					rel="noreferrer"
				>
					DASHBOARD DOCUMENTATION
				</a>
				; AND (II) ACKNOWLEDGED THE RISKS ASSOCIATED WITH USING THE DASHBOARD
				AND BLOCKCHAIN TECHNOLOGY.
			</p>
			<p>
				Without prejudice to the GPL 3.0 licence, the dashboard and any
				information provided by or in connection with it (“content”) are
				PROVIDED ON AN &apos;AS IS&apos; AND &apos;AS AVAILABLE&apos; BASIS AND
				YOU ARE SOLELY RESPONSIBLE FOR ALL DECISIONS AND ACTIONS YOU TAKE
				REGARDING your USE of the dashboard and content.
			</p>
			<p>
				To the maximum extent permitted by applicable law, the Web3 entities,
				their OFFICERS, EMPLOYEES AND PERSONNEL: (i) make no warranty, condition
				or representation in relation to the dashboard or Content, whether in
				regards to its accuracy, outcomes, fitness for purpose, suitability,
				non-infringement or otherwise; (ii) accept no RESPONSIBILITY for any
				consequences (including without limitation any loss of your DOT, whether
				by slashing or otherwise) arising from your use of the dashboard or
				content or the acts, omissions or decisions of other users of the
				dashboard or nomination pools, such as depositors, nominators,
				state-togglers and roots (&quot;third party acts&quot;) which may impact
				you; and (iii) have no liability (including without limitation under
				negligence) for any loss or damage (whether direct, indirect or
				otherwise) that you may suffer or incur in connection with third party
				acts or your use of the dashboard or Content.
			</p>
			<p>
				As between you and the Web3 entities, your sole and exclusive remedy if
				you are not satisfied with the dashboard or content or have suffered
				loss or damage as a result of the dashboard, content or third party acts
				is to cease using the dashboard.
			</p>
		</Padding>
	</>
)
