# Dedot signing compatibility

`@dedot__api@1.4.0.patch` applies the fix from
[dedot PR #755](https://github.com/dedotdev/dedot/pull/755) to both ESM and CommonJS.
The workspace-level `patchedDependencies` entry applies it to all apps and shared
packages using `@dedot/api@1.4.0`, including wallet transaction submission.

Asset Hub metadata V16 exposes multiple transaction-extension sets. Dedot 1.4.0
reads the entire extension table when signing, which incorrectly includes
`VerifyMultiSignature` from another set. The patch selects extension version zero
in metadata order, matching `PortableRegistry.$Extra()` and version 4 transaction
encoding. This also fixes wallet payload processing and additional signed data.

Run `pnpm --filter dedot-api test` for offline regression coverage. These tests also
run through the existing workspace test command in CI. They check both module
formats, extension ordering and encoded signing data, older metadata's single-set
layout, and rejection of unsupported extensions in the selected set.

Remove this patch and its `patchedDependencies` entry after upgrading to an upstream
release containing the fix, then regenerate the lockfile and rerun the tests.
