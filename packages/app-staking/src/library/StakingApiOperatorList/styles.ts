// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import { Actions } from '../StakingApiValidatorList/styles'

export {
	Actions,
	ControlsForm,
	ListStatus,
	OrderField,
	OrderTab,
	OrderTabs,
	ResultSummary,
	SearchField,
} from '../StakingApiValidatorList/styles'

export const ConfigRow = styled.div`
  align-items: end;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(18rem, 28rem) auto;
  justify-content: space-between;

  fieldset {
    width: 100%;
  }

  @media (max-width: 800px) {
    align-items: stretch;
    grid-template-columns: 1fr;

    ${Actions} {
      justify-content: flex-start;
    }
  }
`
