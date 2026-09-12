# data-gate

`data-gate` is a general-purpose data flow tool for exposing data from different
sources through a consistent hook API. Data points define how each source fetches
or subscribes to data; the shared infrastructure handles source selection,
request sharing, caching, and cancellation.

Nomination status is the first use case. `useNominationStatus` returns a nominator
or pool stash's overall nomination status through one source-neutral hook:

```tsx
import { useNominationStatus } from 'data-gate'

const { status, loading, error, refetch } = useNominationStatus(stash, {
  dependencies: [nominations],
})
```

`status` is `active`, `inactive`, or `waiting` once resolved. It is `undefined`
while loading, after an initial error, or without an address. `waiting` is a
staking status, not a loading state.

The optional `dependencies` array adds serializable values to the query key.
Changed values select a different cache key, fetching if no fresh result exists;
equal values share cached results even if objects are recreated. Include inputs
such as subscribed nominations that can change within an era. The hook still
works with just a stash address.

Call `refetch()` to explicitly refresh the current query or retry an error once
its address and source prerequisites are available. It returns TanStack Query's
result promise. Dependency changes need no refetch effect: query keys handle
request sharing, cancellation, and isolation from late results.

The provider reads the service API, readiness, active era, network, and plugin
selection from `global-bus` and subscribes to changes. No configuration props are
needed:

```tsx
import { DataGateProvider } from 'data-gate'

<DataGateProvider>{children}</DataGateProvider>
```

- **Staking API:** one request, without waiting for node readiness, validator
  entries, or exposure syncing. Failures remain errors; they never trigger a
  node fallback.
- **Node:** wait for connection readiness and an active era, fetch the stash's
  nominees, then read overviews and all exposure pages for those targets only.
  No global validator or nominator scan is required.

TanStack Query handles shared requests, caching, and cancellation.
Results are keyed by network, source, era, address, and optional dependencies.
By default, data-point fetch results remain fresh while cached, and requests do
not poll or automatically retry. Inactive entries can still be garbage-collected
by the query client; freshness does not mean permanent retention.
A fetch source can opt into periodic refresh with
`refreshInterval` (milliseconds), which also sets its cache freshness duration.
Mounting the provider alone fetches nothing.

Each data point declares its options with `dataPointOptions` in `src/query.ts`.
The shared `DataPointConfig<T>` in `src/types.ts` gives both sources the same
result type and a small configuration API:

| Field | Purpose |
| --- | --- |
| `key` | Data point name and inputs, before data gate adds network and source. |
| Source `queryFn` | Fetch with `{ network, signal }`, or use `skipToken` for missing input. |
| Source `subscribe` | Subscribe with `{ network, signal, next, error }`; return an unsubscribe function or a promise of one. May also use `skipToken`. |
| Source `enabled` | Optional readiness condition; defaults to `true`. |
| Fetch source `refreshInterval` | Optional refresh/freshness interval in milliseconds; only applies when that source is selected. Subscriptions use live emissions instead. |

Consumers import named hooks such as `useNomineeStatuses(stash, targets)` from
`data-gate`. Source implementations and selection stay inside this package.
Data-point modules can use the internal `useDataPoint(config)` helper to expose
`{ data, loading, error, refetch }` while keeping query execution centralized.
The helper masks cached `data` while the selected source is disabled. `loading`
describes an unresolved initial result or unmet prerequisites, not a background
refresh; a failed refresh can expose both the previous data and an error. Named
hooks additionally suppress loading for absent inputs or an explicit disabled flag.

The helper adds network/source cache scoping and runs only the selected source.
The data point's hook calls `useDataGate()` to receive service inputs and react
to global source changes, then passes its options to TanStack's `useQuery`.
Use-case settings stay in the data point's declaration.

`src/nominationStatus/index.ts` is the first implementation. Its `nodeSource` and
`stakingApiSource` helpers each return `DataPointSource<T>` and define the source's
prerequisites and query function before combining them with the cache key.
Its `types.ts` defines the node query contract; `node.ts` provides the node fetch,
and the API fetch is imported directly from `plugin-staking-api`.

For example, a one-shot query in `src/balance/index.ts` can use `queryFn` for
both sources. The illustrative `fetchNodeBalance` and `fetchApiBalance` helpers
below return promises of the same balance type and respect the abort signal:

```tsx
import { useQuery } from '@tanstack/react-query'
import { useDataGate } from '../provider'
import { dataPointOptions } from '../query'
import { fetchApiBalance, fetchNodeBalance } from './sources'

export const useBalance = (address: string) => {
  const { node, ready } = useDataGate()

  return useQuery(dataPointOptions({
    key: ['balance', address],
    node: {
      enabled: ready,
      queryFn: ({ signal }) => fetchNodeBalance(node, address, signal),
    },
    stakingApi: {
      queryFn: ({ network, signal }) => fetchApiBalance(network, address, signal),
    },
  }))
}
```

The configuration always has `node` and `stakingApi` fields. Each source chooses
**either** `queryFn` or `subscribe` independently. If both underlying sources
support subscriptions, the same hook can instead be implemented as follows.
These illustrative helpers emit the same balance type through `next(balance)`,
report failures through `error(reason)`, respect the abort signal, and return an
unsubscribe function (or a promise of one):

```tsx
import { useQuery } from '@tanstack/react-query'
import { useDataGate } from '../provider'
import { dataPointOptions } from '../query'
import { subscribeApiBalance, subscribeNodeBalance } from './sources'

export const useBalance = (address: string) => {
  const { node, ready } = useDataGate()

  return useQuery(dataPointOptions({
    key: ['balance', address],
    node: {
      enabled: ready,
      subscribe: ({ signal, next, error }) =>
        subscribeNodeBalance(node, address, { signal, next, error }),
    },
    stakingApi: {
      subscribe: ({ network, signal, next, error }) =>
        subscribeApiBalance(network, address, { signal, next, error }),
    },
  }))
}
```

Only the selected source runs: `stakingApi` when its plugin is enabled, otherwise
`node`. All four combinations are supported:

| Node source | Staking API source |
| --- | --- |
| `queryFn` (one-shot) | `queryFn` (one-shot) |
| `subscribe` (live) | `subscribe` (live) |
| `subscribe` (live) | `queryFn` (one-shot) |
| `queryFn` (one-shot) | `subscribe` (live) |

For a live node and one-shot API, combine `node.subscribe` from the second example
with `stakingApi.queryFn` from the first. For the reverse, combine `node.queryFn`
from the first with `stakingApi.subscribe` from the second. Both sources must
produce the same result type; each source supplies only one of the two methods.

All combinations expose the same consumer API under `DataGateProvider`:

```tsx
const { data, isPending, error, refetch } = useBalance(address)
```

Subscription emissions need no `dependencies` array or refetch effect. Include
inputs that change what is subscribed to in the key (such as `address` above).
Changing those inputs switches to the new key's subscription, starting one if
needed; the old subscription stops when its last consumer leaves.

Subscription sources share one subscription per client and query key. The first
emission resolves the query; later emissions replace its cached value without
another fetch. Errors stop the subscription and surface through `error`, retaining
any previous value. Call `refetch()` to restart and await the first new value;
while the initial request is pending, refetch shares that request.

Changing keys, switching sources, losing readiness, removing the query, or losing
the last consumer aborts the subscription and runs its cleanup. Cleanup that
arrives asynchronously still runs after cancellation. Remounting reconnects a
cached subscription. Imperative `fetchQuery` calls without mounted consumers
return one snapshot and unsubscribe.

The existing nomination-status sources remain fetches; subscription support is
opt-in for data points whose underlying source emits live results.

## Era-stakers consumers

Applications import these unified queries directly from `data-gate`:

```tsx
import {
  useEraNominatorCount,
  useNomineeStatuses,
  useHasEraBacking,
  useValidatorRewardRates,
} from 'data-gate'

const count = useEraNominatorCount()
const nominees = useNomineeStatuses(stash, targets)
const backing = useHasEraBacking(stash)
const rates = useValidatorRewardRates(validators, erasPerDay)
```

All four hooks return `{ data, loading, error, refetch }`. An unresolved `data`
value is `undefined`; a resolved `0`, `false`, or empty collection is valid data.

| Hook | Resolved `data` |
| --- | --- |
| `useEraNominatorCount(enabled?)` | Number of unique nominator stashes across the active era's validators. |
| `useNomineeStatuses(stash, targets)` | Entries with `address`, `status`, and `activeBacking` as a decimal string in planck. Target order and duplicates do not change the cache key. |
| `useHasEraBacking(stash)` | Whether the stash has stake backing any validator in the active era, including nominees removed from its current targets. |
| `useValidatorRewardRates(validators, erasPerDay, enabled?)` | Validator-address-to-reward-rate map. Node rates annualize the previous era's rewards before commission; API mode calls the batch average-rate endpoint with `fromEra = era - 1` and `depth = erasPerDay`. |

The first three hooks require an active era (`era > 0`) in both source modes.
Node mode also requires connection readiness. Stash queries need an address,
and nominee queries need at least one target. Reward-rate queries require a
nonempty validator set and `era - 1 >= 0`, plus readiness in node mode.

Each data point owns its transformations and API adapter in `src/eraNominatorCount`,
`src/nomineeStatuses` or `src/hasEraBacking`. All three use the source-selecting
`useEraStakersQuery` helper in `src/eraStakers/index.ts`. Its API branch calls the
data point's API adapter; it does not fetch raw exposures from the API.
The separate `useNodeEraStakers` hook in `src/eraStakers/node.ts` is node-only:
node mode shares one exposure scan per network and era while the snapshot remains
cached, including concurrent requests from different data points.
The node loader reads exposure pages with one era-wide storage prefix scan, then
groups them by validator and checks page counts against the overview. It does not
start a separate storage operation for every validator. Changing pool tabs while
the scan is pending shares that request; completed tabs reuse the cached result.
The API adapters own validation, batching and status normalization;
`plugin-staking-api` defines GraphQL queries and fetches their raw responses.
Reward-rate queries live separately in `src/validatorRewardRates` and do not load
exposure pages. The legacy app provider also uses the shared node loader for its
remaining consumers. The three source-selecting era-data hooks share that scan
in node mode and never request it in API mode, including after an API error.
Network, source, era, stash and target changes select the appropriate cache entry
automatically. Node exposures are shared
in the in-memory query cache only; a page reload fetches them again when needed.
No exposure data is read from or written to local storage.

The shared raw node overview and exposure queries use query-client retry defaults,
unlike the derived data-point queries, which set `retry: false`. Calling a derived
hook's `refetch()` retries failed prerequisites and recomputes the result, but
reuses successful fresh node snapshots; it does not force another full scan.
HTTP adapters forward abort signals. Node adapters check cancellation between
reads and after exposure scans; already-started RPC calls may still complete.

The API branches of `useEraNominatorCount`, `useNomineeStatuses`, and
`useHasEraBacking` refresh every 60 seconds while enabled, mounted, and in the
foreground, and become stale after 60 seconds. `useNominationStatus` and
`useValidatorRewardRates` do not configure periodic refresh.
The API reports currently indexed data without a completeness marker,
so an initial zero or partial result must be able to update within the same era.
The count requires the API's `eraActiveNominatorCount(network, era)` field to be
deployed before the updated apps.

Validator overview readers use `useValidatorOverviews(addresses)`, which returns the same
era/address-keyed overview entries from either source, including exact bigint
`own` and `total` stake, `nominatorCount`, and `pageCount`. API mode calls
`eraValidatorOverviews(network, era, addresses)` and never starts a node overview or exposure
scan for these readers, including after API errors. It requires a known era but
does not require node readiness. Indexed snapshots refresh every 60 seconds so
empty or partial results can update within the era. Node mode shares the raw
overview cache with the exposure loader. Network, era, and source changes isolate
the selected snapshots. API requests deduplicate and sort addresses, with a maximum
of 100 per request. Empty address sets make no request and do not block syncing.
Lists and detail views call `useValidatorOverviews(addresses)` directly. Lists
fetch their address set once and pass overview values to their rows; summaries
and self-stake displays do not issue per-row queries. Explicit API list summaries
already include status and stake totals, so they need no overview query. Changing the requested set masks the old snapshot
until the new set is available, including validators absent from the response.

`useActiveValidatorCount()` uses `eraActiveValidatorCount(network, era)` in API
mode, backed by a database count. It never downloads overview records just to
count them. Node mode reuses the raw overview cache.

Deploy the staking-api `eraValidatorOverviews` and `eraActiveValidatorCount` GraphQL fields before deploying
apps using this hook. The resolver reads the existing indexed overview table;
no database migration is required.

Pool-list status labels use `useNominationStatus` with the pool stash in API mode
and share the node exposure snapshot in node mode. The Active pool filter still
explicitly requests node exposures (and their overview prerequisite) even in API
mode. That consumer needs a separate migration before API mode can eliminate all
era-stakers reads in the staking app. Mounting the shared era-stakers provider
without exposure consumers, as app-nominate does, starts no era-stakers queries.
Overview demand and loading belong to the calling list or detail view; the era
context retains only legacy exposure state. Node overview readers share one raw
scan through the query cache.

## Validation

Run `pnpm --filter data-gate check` and
`pnpm --filter tests exec vitest run src/dataGate.test.ts src/dataGateSubscriptions.test.ts src/eraStakersData.test.ts src/eraStakersTransport.test.ts`.
