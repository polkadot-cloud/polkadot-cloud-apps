// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const HeaderIdentity = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  gap: 0.6rem;
  height: auto !important;
  min-width: 9rem;

  > div {
    flex: 1 1 auto;
    margin: 0;
    min-width: 0;
    overflow: visible;
  }

  > div > div:first-child {
    background: transparent;
    border: 0 !important;
    border-radius: 0;
    display: grid;
    height: 2.5rem;
    max-width: 2.5rem !important;
    min-width: 2.5rem !important;
    overflow: visible;
    place-items: center;
  }

  && > div > div:last-child {
    height: auto;
    min-width: 0;
    padding-left: 0.45rem;
  }

  && > div > div:last-child > h4 {
    color: var(--gray-1000);
    font-family: var(--font-family-bold);
    font-size: clamp(0.95rem, 2.4cqi, 1.2rem);
    height: auto;
    line-height: 1.2;
    overflow: hidden;
    padding: 0;
    position: static;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
`

export const BlockedBadge = styled.span`
  background: color-mix(in srgb, var(--status-danger) 8%, transparent);
  border: 1px solid
    color-mix(in srgb, var(--status-danger) 22%, transparent);
  border-radius: 0.55rem;
  color: var(--status-danger);
  flex: 0 0 auto;
  font-family: var(--font-family-semibold);
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  padding: 0.35rem 0.5rem;
  text-transform: uppercase;
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 0.35rem;
  height: auto !important;
  overflow: visible;

  @container list-item-card (max-width: 31rem) {
    flex-basis: 100%;
    justify-content: flex-end;
  }
`

export const HeaderIconAction = styled.div`
  flex: 0 0 2.25rem;
  height: 2.25rem;
  position: relative;
  width: 2.25rem;

  && div {
    margin: 0;
  }

  && button,
  && > span {
    background: transparent !important;
    border: 1px solid var(--gray-500);
    border-radius: 0.55rem !important;
    color: var(--gray-800);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.25rem !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 2.25rem !important;
  }

  && button:focus-visible,
  && > span:focus-visible {
    border-color: var(--gray-900);
    outline: 2px solid
      color-mix(in srgb, var(--gray-1000) 18%, transparent);
    outline-offset: 1px;
  }

  && button:hover,
  && > span:hover {
    background: var(--gray-300) !important;
    opacity: 1;
  }

  && button > span {
    justify-content: center;
    width: 100% !important;
  }

  && svg {
    color: var(--gray-800) !important;
    height: 1.2rem !important;
    width: 1.2rem !important;
  }
`

export const HeaderMetricsAction = styled(HeaderIconAction)`
  flex: 0 0 auto;
  width: auto;

  && button {
    font-family: var(--font-family-semibold);
    font-size: 0.95rem;
    letter-spacing: normal;
    padding: 0 0.85rem !important;
    width: auto !important;
  }
`

export const ListItemMenuWrapper = styled.div`
  flex: 0 0 2.25rem;
  height: 2.25rem !important;
  position: relative;
  width: 2.25rem;
`

export const ListItemMenuTrigger = styled.button`
  background: transparent !important;
  border: 1px solid var(--gray-500);
  border-radius: 0.55rem !important;
  color: var(--gray-800);
  display: grid;
  height: 2.25rem !important;
  margin: 0 !important;
  padding: 0 !important;
  place-items: center;
  width: 2.25rem !important;

  &:hover,
  &[aria-expanded='true'] {
    background: var(--gray-300) !important;
    opacity: 1;
  }

  &:focus-visible {
    border-color: var(--gray-900);
    outline: 2px solid
      color-mix(in srgb, var(--gray-1000) 18%, transparent);
    outline-offset: 1px;
  }

  > svg {
    color: var(--gray-800) !important;
    font-size: 0.85rem;
    transition: transform var(--transition-duration) ease;
  }

  &[aria-expanded='true'] > svg {
    transform: rotate(180deg);
  }
`
