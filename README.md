# airlocks — production-stakes verification for agent claims, distinct from similarly named projects

An agent once told me a deploy succeeded. Its evidence: the word "success" appeared in the logs. It appeared inside an error message. The broken build reached TestFlight.

The fix wasn't a better prompt, it was removing trust. `airlocks` is the doctrine, packaged: every "done" gets verified against the **system of record** (the store API, the remote branch, the registry, the reproduced bug), by a context that didn't do the work, with evidence quoted in the report.

## Install

```
npx skills add runsagents/airlocks
```

Then say **"airlock this"** whenever an agent claims something is merged, deployed, passing, published, or fixed.

Compatibility: tested with Claude Code; other hosts are currently untested.

## See it fail

Run the zero-dependency synthetic demo:

```
npm run demo
```

Actual output:

```
> airlocks@1.1.0 demo
> node demo/airlock-check.mjs

SYNTHETIC DEMO — no real deployment or store was queried.
NAIVE GREP: DEPLOYED (searched demo/fake-deploy.log for "success")

AIRLOCK CHECK
CLAIM:            build 2026.07.14+2 deployed
SYSTEM OF RECORD: demo/store-state.json (liveBuild)
EVIDENCE:         deploy exitStatus=1; liveBuild=2026.07.14+1; claimedBuild=2026.07.14+2
VERDICT:          REFUTED (deploy exited non-zero and the system of record still serves a different build)
```

## The five rules

1. Words are claims, state is evidence
2. Never grep for success words, parse exit codes and structured statuses
3. Ask the system of record, not the actor
4. The doer never verifies its own work
5. On mismatch, halt and report, file, don't fix

## Limitations

Verification costs a little time per claim, spend it on anything touching money, releases, or data, and skip it for cosmetic edits. Some claims are genuinely unverifiable from your seat (say so, don't guess). Airlocks catch false "done"s; they don't catch wrong designs, that's what review is for.

License: CC0 · v1.1.0

## Terminology & prior art
This pattern is known in the field as [black-box monitoring](https://sre.google/sre-book/monitoring-distributed-systems/), related to [end-to-end check and retry](https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf).
This implementation adds read-after-write checks against the system of record before accepting completion.
