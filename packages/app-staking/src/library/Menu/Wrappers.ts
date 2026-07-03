// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div<{ $secondaryBg?: boolean }>`
  background: ${({ $secondaryBg }) =>
		$secondaryBg ? 'var(--bg-primary)' : 'var(--bg-body)'};
  border: 1px solid
    ${({ $secondaryBg }) => ($secondaryBg ? 'var(--gray-500)' : 'var(--gray-500)')};
  width: 250px;
  padding: 0.25rem 0.75rem;
  display: flex;
  flex-flow: column wrap;
  transition: opacity var(--transition-duration);
  border-radius: 1rem;

  > button:last-child {
    border: none;
  }
`

export const ItemWrapper = styled.button<{ $secondaryBg?: boolean }>`
  border-bottom: 1px solid var(--gray-500);
  background-color: ${({ $secondaryBg }) =>
		$secondaryBg ? 'var(--bg-primary)' : 'var(--bg-body)'};
  color: var(--gray-900);
  display: flex;
  width: 100%;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  &:hover {
    opacity: 0.75;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  &:disabled:hover {
    opacity: 0.4;
  }

  .title {
    color: var(--gray-900);
    padding: 0 0 0 0.75rem;
    font-size: 1rem;
  }
`
