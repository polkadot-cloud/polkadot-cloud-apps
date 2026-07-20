// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div<{
	$align: 'left' | 'right'
	$status: string
	$noMargin?: boolean
}>`
  margin-right: ${(props) => (props.$noMargin ? '0' : '0.35rem')};
  border: 1px solid
    ${(props) =>
			props.$status === 'active'
				? 'color-mix(in srgb, var(--status-success) 10%, transparent)'
				: 'var(--gray-400)'};
  border-radius: 0.75rem;
  border-top-left-radius: ${(props) =>
		props.$align === 'left' ? '0.25rem' : '0.75rem'};
  border-top-right-radius: ${(props) =>
		props.$align === 'right' ? '0.25rem' : '0.75rem'};
  border-bottom-right-radius: ${(props) =>
		props.$align === 'left' ? '0.25rem' : '0.75rem'};
  border-bottom-left-radius: ${(props) =>
		props.$align === 'right' ? '0.25rem' : '0.75rem'};
  background: ${(props) =>
		props.$status === 'active'
			? 'color-mix(in srgb, var(--status-success) 2%, transparent)'
			: 'color-mix(in srgb, var(--gray-900) 4%, transparent)'};

  h5 {
    color: ${(props) =>
			props.$status === 'active' ? 'var(--status-success)' : 'var(--gray-900)'};
    opacity: ${(props) => (props.$status === 'active' ? 0.8 : 0.5)};
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    > span:not(.separator) {
      padding: 0.6rem 0.75rem;
    }

    .separator {
      align-self: stretch;
      background: ${(props) => (props.$status === 'active' ? 'color-mix(in srgb, var(--status-success) 20%, transparent)' : 'color-mix(in srgb, var(--gray-900) 20%, transparent)')};
      flex: 0 0 1px;
      transform: skew(-15deg);
    }
  }
`
