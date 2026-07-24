// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

const GenericChain = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
		<defs>
			<linearGradient
				id="genericchain_svg--gradient"
				x1="259.06"
				y1="-669.92"
				x2="256.91"
				y2="-434.66"
				gradientTransform="matrix(1 0 0 -1 1.99 -210.71)"
				gradientUnits="userSpaceOnUse"
			>
				<stop offset="0" stopColor="#fff" />
				<stop offset="0.08" stopColor="#e0e1e0" />
				<stop offset="0.28" stopColor="#9c9c9d" />
				<stop offset="0.46" stopColor="#666" />
				<stop offset="0.63" stopColor="#3a3a39" />
				<stop offset="0.78" stopColor="#1a1a1a" />
				<stop offset="0.91" stopColor="#090909" />
				<stop offset="1" stopColor="#010101" />
			</linearGradient>
		</defs>
		<path fill="#fff" d="M0 0h512v512H0z" />
		<g data-name="Layer 1">
			<path
				fill="#010101"
				d="M274.69 189.05c-.86 39.64-32.74 71.52-72.38 70.66s-71.53-32.71-70.67-72.38 32.75-70.67 71.53-70.67c39.64 0 71.52 31.89 71.52 72.39zm72.39 0c0-76.7-64.63-138.74-143.91-138.74s-144.78 62-144.78 138.74S123 327.79 203.17 327.79s143.91-62.04 143.91-138.74z"
			/>
			<path
				fill="#010101"
				d="M164.39 422.58h294.72c1.72-11.2 3.45-23.26 3.45-35.33 0-106.85-90.49-193-202.51-193s-202.52 86.15-202.52 193A187.84 187.84 0 0061 425.17z"
			/>
			<path
				fill="#fff"
				d="M164.39 351.92c19.82-52.57 77.56-79.28 130.13-59.46 27.57 10.34 50 31.88 59.46 59.46zm-117.2 0h415.37v104.27H47.19z"
			/>
			<path
				d="M166.11 345.89L61 347.61c18.1 62.05 102.55 109.44 202.51 109.44 91.35 0 173.21-34.47 195.62-106H354.84c-19 31-58.6 42.22-91.35 42.22-44.81-.86-81.86-19.82-97.38-47.39"
				fill="url(#genericchain_svg--gradient)"
			/>
		</g>
	</svg>
)

export default GenericChain
