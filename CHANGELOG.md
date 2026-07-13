# Changelog

## v1.1.0 — 2026-07-14

The skill previously documented production verification doctrine only in prose, without runnable evidence that its core checks distinguish a success-word grep from actual deployment state.

Added:

- A zero-dependency synthetic demo with a grep trap, structured deploy status, and synthetic system-of-record state.
- A CLI checker that reports `CONFIRMED`, `REFUTED`, or `UNVERIFIABLE` using the skill's four-line evidence format.
- Node test coverage for the grep-trap, confirmed, and unverifiable cases.
- A clearly illustrative merged-and-deployed session transcript.
- Tested-host compatibility guidance and the demo's actual output in the README.
