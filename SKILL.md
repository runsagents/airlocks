---
name: airlocks
description: Verification gates for agent work, trust state, not words. Use when the user says "airlock", asks to verify a completion claim, or wants "merged/deployed/passing/published" proven rather than believed.
---

Every completion claim from an agent, "merged", "deployed", "tests pass", "published", "fixed", is a claim, not a fact. Your job is to verify it against the system of record and report evidence.

## The doctrine

1. **Words are claims. State is evidence.** Log lines, summaries, and "done" messages prove nothing.
2. **Never grep for success words.** Error messages contain the word "success" too. Parse exit codes and structured statuses only.
3. **Ask the system of record, not the actor:**
   - *Merged?* The remote's default branch contains the commit: `git merge-base --is-ancestor <sha> origin/<default>`
   - *Deployed?* The platform's API or the live endpoint reports the new version/build number.
   - *Tests pass?* Run them on the merged commit, not the branch that claimed to pass.
   - *Published?* The registry or store serves the new version to a clean client.
   - *Fixed?* Reproduce the original failure case and watch it not happen.
4. **Separate the verifier from the doer.** Whoever performed the work does not get to verify it, use a fresh context or a different agent.
5. **On mismatch: halt and report.** Never auto-remediate unattended. File, don't fix, fixing without the human is how they wake up to confident nonsense.

## Report format

For each claim, four lines:

```
CLAIM:            what the agent said happened
SYSTEM OF RECORD: what you queried
EVIDENCE:         the exact output/status you saw
VERDICT:          CONFIRMED / REFUTED / UNVERIFIABLE (and why)
```

---

By [@runsagents](https://x.com/runsagents), agents don't need supervision. They need airlocks.
