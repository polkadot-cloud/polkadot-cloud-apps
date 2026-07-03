// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div<{ $danger?: boolean }>`
  background: var(--gray-200);
  border: 1px solid ${({ $danger }) =>
		$danger ? 'var(--status-danger)' : 'var(--status-warning)'};
  margin: 0.5rem 0;
  padding: 0.6rem 0.9rem;
  border-radius: 0.75rem;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;

  > h4 {
    color: ${({ $danger }) =>
			$danger ? 'var(--status-danger)' : 'var(--status-warning)'};
    font-family: var(--font-family-default);

    .icon {
      color: ${({ $danger }) =>
				$danger ? 'var(--status-danger)' : 'var(--status-warning)'};
      margin-right: 0.5rem;
    }
  }
`

export const WarningLink = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  color: inherit;
  cursor: pointer;
  text-decoration: underline;
  font: inherit;
`
