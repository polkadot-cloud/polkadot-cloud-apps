# data-gate

One source-neutral hook for a nominator or pool stash's overall nomination status:

```tsx
import { useNominationStatus } from 'data-gate'

const { status, loading, error } = useNominationStatus(stash)
```

`status` is `active`, `inactive`, or `waiting` once resolved. It is `undefined`
while loading, after an initial error, or without an address. `waiting` is a
staking status, not a loading state.

The gate reads the network and `pluginEnabled('staking_api')` from `global-bus`
and subscribes to changes. Supply the shared Dedot service API (`ServiceInterface`)
and its readiness and era from the app:

```tsx
import { DataGateProvider } from 'data-gate'

<DataGateProvider
  node={serviceApi}
  ready={isReady}
  era={activeEra.index}
>
  {children}
</DataGateProvider>
```

- **Staking API:** one request, without waiting for node readiness, validator
  entries, or exposure syncing. Failures remain errors; they never trigger a
  node fallback.
- **Node:** wait for connection readiness and an active era, fetch the stash's
  nominees, then read overviews and all exposure pages for those targets only.
  No global validator or nominator scan is required.

TanStack Query handles shared requests, caching, and cancellation.
Results are keyed by network, source, era, and address. Cached results have no
age-based expiry, and requests do not poll or automatically retry.
Mounting the provider alone fetches nothing.

Each data point declares its options with `dataPointOptions` in `src/query.ts`.
The shared `DataPointConfig<T>` in `src/types.ts` gives both sources the same
result type and a small configuration API:

| Field | Purpose |
| --- | --- |
| `queryKey` | Data point name and inputs that distinguish its results. |
| `node.queryFn`, `stakingApi.queryFn` | Fetch with `{ network, signal }`, or use `skipToken` for missing input. |
| Source `enabled` | Optional readiness condition; defaults to `true`. |

The helper adds network/source cache scoping and runs only the selected source.
The data point's hook calls `useDataGate()` to receive service inputs and react
to global source changes, then passes its options to TanStack's `useQuery`.
Use-case settings stay in the data point's declaration.

`src/nominationStatus/index.ts` is the first implementation. Its `types.ts`
defines the node query contract; `node.ts` and `stakingApi.ts` provide the fetches.

Run `pnpm --filter data-gate check` and
`pnpm --filter tests test -- src/dataGate.test.ts`.
