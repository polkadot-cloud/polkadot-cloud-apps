// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import { ListItem } from 'ui-app/ListItem'
import {
	Actions,
	OrderTab as SharedOrderTab,
	OrderTabs as SharedOrderTabs,
} from '../StakingApiValidatorList/styles'

export {
	Actions,
	ControlsForm,
	ListStatus,
	OrderField,
	ResultSummary,
	SearchField,
} from '../StakingApiValidatorList/styles'

export const OrderTabs = styled(SharedOrderTabs)`
	grid-template-columns:
		repeat(2, minmax(max-content, 1.15fr))
		minmax(max-content, 1fr)
		repeat(2, minmax(max-content, 1.25fr));
  overflow-x: auto;
`

export const OrderTab = styled(SharedOrderTab)`
  text-transform: capitalize;
  white-space: nowrap;
`

export const CardSummary = styled(ListItem.Summary)`
  grid-template-columns: repeat(4, minmax(0, 1fr));

  time {
    text-transform: none;
  }

  > div:last-child {
    border-block-end: 0;
    border-inline-start: 0;
    grid-column: 1 / -1;
    padding-block-start: 1.25rem;
    padding-inline: 0;
  }
`

export const ConfigRow = styled.div`
  align-items: end;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(32rem, 55rem) auto;
  justify-content: space-between;

  fieldset {
    width: 100%;
  }

  @media (max-width: 1100px) {
    align-items: stretch;
    grid-template-columns: 1fr;

    ${Actions} {
      justify-content: flex-start;
    }
  }
`
