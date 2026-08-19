// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
`

export const Spacer = styled.div`
  width: 100%;
  height: 1px;
  margin: 0.75rem 0;
`

export const Subheading = styled.div`
  margin: 0.4rem 0 1rem 0;

  h3,
  h4 {
    margin-top: 0;
    margin-left: 0;
    display: flex;
    align-items: center;

    > button {
      margin-left: 0.75rem;
    }
  }
`

export const StandaloneStatus = styled.div<{ $active?: boolean }>`
  align-items: center;
  align-self: flex-start;
  color: var(--text-tertiary);
  display: flex;
  font-family: var(--font-family-semibold);
  font-size: 1.25rem;
  gap: 0.55rem;
  line-height: 1.35;
  margin-bottom: 0.5rem;
  margin-top: 0.8rem;

  ${({ $active }) =>
		$active &&
		`&::before {
      background: var(--status-success);
      border-radius: 50%;
      content: '';
      flex: 0 0 0.5rem;
      height: 0.5rem;
      width: 0.5rem;
    }`}
`
