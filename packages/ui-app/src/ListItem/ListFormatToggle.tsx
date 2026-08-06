// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export type ListItemFormat = 'row' | 'col'

interface ListFormatToggleProps {
	hideOnCompact?: boolean
	onChange: (format: ListItemFormat) => void
	value: ListItemFormat
}

const Wrapper = styled.div<{ $hideOnCompact: boolean }>`
  display: flex;
  align-items: center;

  button {
    color: var(--gray-900);
    font-size: 1.1rem;
    margin: 0 0.5rem 0 0.75rem;
    opacity: 0.6;
    transition: all var(--transition-duration);

    &[aria-pressed='true'],
    &:hover {
      color: var(--gray-1000);
      opacity: 1;
    }
  }

  @media (max-width: 1199px) {
    display: ${(props) => (props.$hideOnCompact ? 'none' : 'flex')};
  }
`

export const ListFormatToggle = ({
	hideOnCompact = false,
	onChange,
	value,
}: ListFormatToggleProps) => {
	const { t } = useTranslation('app')

	return (
		<Wrapper $hideOnCompact={hideOnCompact}>
			<button
				type="button"
				onClick={() => onChange('row')}
				aria-label={t('rowView', {
					defaultValue: 'Compact row view',
				})}
				aria-pressed={value === 'row'}
			>
				<FontAwesomeIcon icon={faBars} />
			</button>
			<button
				type="button"
				onClick={() => onChange('col')}
				aria-label={t('cardView', {
					defaultValue: 'Detailed card view',
				})}
				aria-pressed={value === 'col'}
			>
				<FontAwesomeIcon icon={faGripVertical} />
			</button>
		</Wrapper>
	)
}
