// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const ControlsForm = styled.form`
  border-bottom: 1px solid var(--gray-500);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.25rem 1.5rem;
`

export const SearchField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  > span {
    color: var(--gray-900);
    font-family: var(--font-family-semibold);
    font-size: 0.9rem;
  }

  input {
    border: 1px solid var(--gray-500);
    border-radius: 1.75rem;
    color: var(--gray-900);
    font-family: var(--font-family-bold);
    font-size: 1.15rem;
    padding: 0.9rem 1.25rem;
    width: 100%;
  }
`

export const ConfigRow = styled.div`
  align-items: end;
  display: grid;
  gap: 1rem 1.5rem;
  grid-template-columns: minmax(18rem, 1fr) minmax(13rem, 0.45fr) auto;

  @media (max-width: 900px) {
    align-items: stretch;
    grid-template-columns: 1fr;
  }
`

export const FilterGroup = styled.fieldset`
  border: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1.25rem;
  margin: 0;
  min-width: 0;
  padding: 0;

  legend {
    color: var(--gray-900);
    font-family: var(--font-family-semibold);
    font-size: 0.9rem;
    margin-bottom: 0.55rem;
  }
`

export const CheckLabel = styled.label`
  align-items: center;
  color: var(--gray-1000);
  cursor: pointer;
  display: flex;
  font-size: 0.95rem;
  gap: 0.5rem;

  input {
    accent-color: var(--accent-700);
    height: 1rem;
    width: 1rem;
  }
`

export const OrderField = styled.label`
  color: var(--gray-900);
  display: flex;
  flex-direction: column;
  font-family: var(--font-family-semibold);
  font-size: 0.9rem;
  gap: 0.45rem;

  select {
    background: var(--bg-primary);
    border: 1px solid var(--gray-500);
    border-radius: 0.65rem;
    color: var(--gray-1000);
    font-family: var(--font-family-semibold);
    font-size: 0.95rem;
    min-height: 2.65rem;
    padding: 0.55rem 0.75rem;
  }
`

export const Actions = styled.div`
  display: flex;
  gap: 0.65rem;
  justify-content: flex-end;

  @media (max-width: 900px) {
    justify-content: flex-start;
  }
`

export const ResultSummary = styled.div`
  color: var(--gray-900);
  font-family: var(--font-family-semibold);
  padding: 0.75rem 0.5rem 0.25rem;
`

export const ListStatus = styled.div`
  padding: 1.5rem 0.5rem 1rem;

  h3,
  h4 {
    margin: 0;
  }

  button {
    margin-top: 1rem;
  }
`
