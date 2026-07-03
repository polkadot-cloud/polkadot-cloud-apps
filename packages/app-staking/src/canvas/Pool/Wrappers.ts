// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const JoinFormWrapper = styled.div`
  background: var(--gray-300);
  border: 0.75px solid var(--gray-500);
  box-shadow: var(--shadow);
  border-radius: 1.5rem;
  padding: 1.5rem 1.5rem 0;
  width: 100%;

  .head {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    > h2 {
      color: var(--gray-900);
      margin: 0.25rem 0;
      width: auto;
    }
  }

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
    margin: 1.5rem 0 0.5rem 0;
    color: var(--text-tertiary);

    &.underline {
      border-bottom: 1px solid var(--gray-500);
      padding-bottom: 0.5rem;
      margin: 2rem 0 1rem 0;
    }
  }

  > .input {
    border-bottom: 1px solid var(--gray-500);
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

  > .submit {
    margin-top: 2.5rem;
  }
`

export const AddressesWrapper = styled.div`
  flex: 1;
  display: flex;
  padding: 0rem 0.25rem;
  flex-wrap: wrap;

  > section {
    display: flex;
    flex-direction: column;
    flex-basis: 50%;
    margin: 0.9rem 0 0.7rem 0;

    @media (max-width: 600px) {
      flex-basis: 100%;
    }
  }
`

export const NominationsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const InviteHeader = styled.div`
  text-align: center;
  padding: 2rem 1rem;

  h2 {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
    font-family: var(--font-family-bold);
    color: var(--gray-1000);
  }

  h4 {
    color: var(--gray-900);
    max-width: 40rem;
    margin: 0 auto;
  }
`
