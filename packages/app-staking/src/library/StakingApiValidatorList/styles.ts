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
  display: block;

  input {
    background: var(--gray-200);
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
  gap: 1.25rem;
  grid-template-columns: max-content minmax(31rem, 36rem) auto;
  justify-content: space-between;

  @media (max-width: 1350px) {
    align-items: stretch;
    grid-template-columns: 1fr;
    justify-content: stretch;
  }
`

export const FilterGroup = styled.fieldset`
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
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

export const FilterButtons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.55rem;
`

export const FilterButton = styled.button`
  background: var(--bg-primary);
  border: 1px solid var(--gray-500);
  border-radius: 0.75rem;
  color: var(--gray-900);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: var(--font-family-semibold);
  font-size: 1rem;
  min-height: 2.95rem;
  padding: 0.6rem 0.85rem;
  transition:
    background var(--transition-duration),
    border-color var(--transition-duration),
    color var(--transition-duration),
    transform var(--transition-duration);
  white-space: nowrap;

  &:hover {
    border-color: var(--gray-700);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--gray-900);
    outline-offset: 2px;
  }
`

export const SwitchTrack = styled.span<{ $active: boolean }>`
  background: ${(props) =>
		props.$active ? 'var(--gray-1000)' : 'var(--gray-600)'};
  border-radius: 1rem;
  display: flex;
  flex: 0 0 auto;
  height: 1.15rem;
  padding: 0.14rem;
  transition: background var(--transition-duration);
  width: 2.1rem;

  &::after {
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgb(0 0 0 / 25%);
    content: '';
    height: 0.87rem;
    transform: translateX(${(props) => (props.$active ? '0.95rem' : '0')});
    transition: transform var(--transition-duration);
    width: 0.87rem;
  }
`

export const OrderField = styled.fieldset`
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
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

export const OrderTabs = styled.div`
  background: var(--gray-500);
  border: 1px solid var(--gray-500);
  border-radius: 0.8rem;
  display: grid;
  gap: 0.25rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 0.25rem;
`

export const OrderTab = styled.button<{ $active: boolean }>`
  background: ${(props) =>
		props.$active ? 'var(--bg-primary)' : 'transparent'};
  border: 0;
  border-radius: 0.6rem;
  color: ${(props) => (props.$active ? 'var(--gray-1000)' : 'var(--gray-900)')};
  cursor: pointer;
  font-family: var(--font-family-semibold);
  font-size: 1rem;
  line-height: 1.2;
  min-height: 2.35rem;
  padding: 0.4rem 0.65rem;
  transition:
    background var(--transition-duration),
    color var(--transition-duration);
  white-space: nowrap;

  &:hover {
    background: var(--bg-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--gray-900);
    outline-offset: 1px;
  }
`

export const Actions = styled.div`
  display: flex;
  gap: 0.65rem;
  justify-content: flex-end;

  @media (max-width: 1350px) {
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
