# Cloud Signer integration

This local workspace package connects Cloud Apps to the optional Cloud Signer extension. It uses Dedot directly and has no dependency on a sibling checkout, fixed extension ID, private key, or vault password.

`startCloudMetadataSync(client, { decimals, tokenSymbol })` synchronizes through the injected provider on client initialization, reconnect, and runtime upgrade. Absent or not-yet-authorized wallets are normal background failures; the transaction wrapper awaits synchronization before signing and surfaces errors. Call its `stop()` when disposing a client explicitly.

`prepareCloudSigner(client, signer, chainInfo)` returns a `metadataHash` for Dedot's payload options and a wrapped signer that rechecks the cache and exact payload version/hash before every signature request. Always use native chain token properties for the digest, not a selected alternate fee asset. Runtime changes reject an old payload instead of silently modifying it.

The shared `dedot-api` starts synchronization for its Asset Hub client. `tx-submit` uses the wrapper only for account source `cloud-signer`; other wallet sources retain their existing signing options. Wallet discovery, selected-account subscriptions, and permissions use the existing connect package and the injected provider. Cloud Signer is registered in `consts/extensions` and `assets`.

The extension remains node-free; Cloud Apps fetches metadata and submits/watches transactions. Raw/message signing is not supported. The installed extension and user-approved testnet submission still need release verification. An independent wallet audit is separate from these engineering tests.

Run `pnpm --filter cloud-signer-client test`, `pnpm --filter dedot-api test`, and the application typecheck/build. Tests cover initial/upgrade/reconnect synchronization, eviction recovery, and rejection of stale payloads before they reach the signer.
