// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 1.5rem;

  > .content {
    flex-grow: 1;
    margin-top: 0.75rem;
  }

  > .labels {
    width: 100%;
    margin-top: 0.8rem;
    display: flex;
    flex-direction: row wrap;
    align-items: center;
    justify-content: center;


    > span {
      color: var(--text-tertiary);
      border: 1px solid var(--gray-500);
      border-radius: 0.45rem;
      padding: 0.35rem 0.75rem;
      margin: 0.25rem;
    }
  }
`

export const JoinFormWrapper = styled.div`
  width: 100%;

  @media (max-width: 1000px) {
    margin-top: 1rem;
  }

  &.preload {
    padding: 0;
    opacity: 0.5;
  }

  h4 {
    display: flex;
    align-items: center;
    &.note {
      color: var(--gray-900);
      font-family: var(--font-family-default);
    }
  }

  > h4 {
    color: var(--text-tertiary);
    margin: 1.75rem 0 0.0 0;
    padding-left: 0.4rem;

    &.underline {
      border-bottom: 1px solid var(--gray-500);
      padding-bottom: 0.5rem;
      margin: 2rem 0 1rem 0;
    }
  }

  > .input {
    padding: 0 0.25rem;
    display: flex;
    align-items: flex-end;
    padding-bottom: 1.25rem;

    > div {
      flex-grow: 1;
      display: flex;
      flex-direction: column;

      > div {
        margin: 0;
      }
    }
  }

  > .available {
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
  }
`
