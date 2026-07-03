// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const FilterListWrapper = styled.div`
  padding-bottom: 0.5rem;

  > .body {
    button:last-child {
      margin-bottom: 0;
    }
  }
`

export const FilterListButton = styled.button<{ $active: boolean }>`
  align-items: center;
  background: var(--gray-400);
  border: 1px solid
    ${(props) => (props.$active ? 'var(--accent-800)' : 'var(--gray-400)')};
  border-radius: 1rem;
  display: flex;
  flex-flow: row wrap;
  margin: 1rem 0;
  padding: 0 1rem;
  transition: border var(--transition-duration);
  width: 100%;

  h4 {
    color: ${(props) =>
			props.$active ? 'var(--accent-800)' : 'var(--gray-900)'};
    transition: color var(--transition-duration);
  }

  svg {
    color: ${(props) =>
			props.$active ? 'var(--accent-800)' : 'var(--gray-900)'};
    margin-left: 0.2rem;
    margin-right: 0.9rem;
    opacity: ${(props) => (props.$active ? 1 : 0.7)};
    transition: color var(--transition-duration);
  }
`

export const FooterWrapper = styled.div`
  margin: 1.5rem 0 0.5rem;
`

export const PromptListItem = styled.div`
  align-items: center;
  border-bottom: 1px solid var(--gray-500);
  display: flex;

  &.inactive {
    opacity: var(--opacity-disabled);
  }
`

export const PromptSelectItem = styled.button`
  align-items: flex-start;
  border-bottom: 1px solid var(--gray-500);
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  padding: 1rem 0.5rem;
  width: 100%;

  > h4 {
    margin-top: 0.3rem;
  }

  &:hover {
    background: var(--gray-500);
  }

  &.inactive {
    h3,
    h4 {
      color: var(--gray-1000);
    }
  }
`

export const ConfirmText = styled.h4`
  padding: 1rem;
`
