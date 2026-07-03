// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const CallToActionWrapper = styled.div`
  --button-border-radius: 2rem;
  --button-vertical-space: 1.1rem;

  height: inherit;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: row;
  flex-flow: row wrap;
  margin-top: 0.38rem;   

  @media (max-width: 650px) {
    flex-wrap: wrap;
  }

  > section {
    display: flex;
    flex-direction: row;
    height: inherit;

    @media (max-width: 650px) {
      margin-top: var(--button-vertical-space);
      flex-grow: 1;
      flex-basis: 100%;

      &:nth-child(1) {
        margin-top: 0;
      }
    }

    &:nth-child(1) {
      flex-grow: 1;
    }
    &:nth-child(2) {
      @media (min-width: 651px) {
        padding-left: 1rem;
      }
    }

    &.standalone {
      border: none;
      padding: 0;
    }

    h3 {
      line-height: 1.4rem;
    }

    .buttons {
      border-radius: var(--button-border-radius);
      display: flex;
      flex-direction: row;
      max-width: 100%;
      width: 100%;

      @media (max-width: 650px) {
        flex-wrap: wrap;
      }

      > .button {
        height: 3.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        transition: filter 0.15s;
        flex-shrink: 1;
        min-width: 0;

        &.primary {
          background-color: var(--gray-1000);
          border-top-left-radius: var(--button-border-radius);
          border-bottom-left-radius: var(--button-border-radius);
          color: var(--gray-100);
          flex-grow: 1;

          &:hover {
            filter: brightness(90%);
          }

          &.disabled {
            background-color: var(--gray-700);

            &:hover {
              filter: none;
            }
          }

          &.pulse {
            box-shadow: 0 0 30px 0 var(--gray-700);
            transform: scale(1);
            animation: pulse 4s infinite;

            @keyframes pulse {
              0% {
                transform: scale(0.98);
                box-shadow: 0 0 0 0 var(--gray-700);
              }

              70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgb(0 0 0 / 0%);
              }

              100% {
                transform: scale(0.98);
                box-shadow: 0 0 0 0 rgb(0 0 0 / 0%);
              }
            }
          }
        }

        &.secondary {
          background-color: var(--gray-400);
          border-top-right-radius: var(--button-border-radius);
          border-bottom-right-radius: var(--button-border-radius);
          color: var(--gray-1000);

          &:hover {
            filter: brightness(95%);
          }

          &.disabled {
            &:hover {
              filter: none;
            }
          }
        }

        &.standalone {
          border-radius: var(--button-border-radius);
          flex-grow: 1;
          margin-left: 0.75rem;

          &:nth-child(1) {
            margin-left: 0;
          }

          @media (max-width: 650px) {
            margin-left: 0;
          }
        }

        @media (max-width: 650px) {
          border-radius: var(--button-border-radius);
          margin-top: var(--button-vertical-space);
          flex-grow: 1;
          flex-basis: 100%;

          &:nth-child(1) {
            margin-top: 0;
          }
        }

        > button {
          color: inherit;
          height: inherit;
          transition: transform 0.25s;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;
          font-size: 1.3rem;
          line-height: 1.3rem;
          width: 100%;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          .counter {
            font-family: var(--font-family-bold);
            font-size: 1.1rem;
            margin-left: 0.75rem;
          }

          > svg {
            margin: 0 0.75rem;
          }

          &:disabled {
            opacity: var(--opacity-disabled);
            cursor: default;
          }
        }

        &.inactive {
          > button {
            cursor: default;
          }
        }

        &:disabled {
          opacity: var(--opacity-disabled);
          cursor: default;
        }
      }
    }
  }
`
