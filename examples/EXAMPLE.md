# Illustrative airlock session

> **Illustrative, fully synthetic transcript.** No real repository, commit, deployment, or platform was queried.

**Implementing agent:** PR #184 is merged at `a1b2c3d`, and build `2026.07.14+2` is deployed.

**Verifying agent:** I will verify the merge against the remote default branch and the deployment against the platform API. I will halt on any mismatch rather than remediate it.

```text
CLAIM:            PR #184 is merged at a1b2c3d
SYSTEM OF RECORD: synthetic origin/main remote-tracking ref
EVIDENCE:         git merge-base --is-ancestor a1b2c3d origin/main exited 0
VERDICT:          CONFIRMED (the remote default branch contains the claimed commit)

CLAIM:            build 2026.07.14+2 is deployed
SYSTEM OF RECORD: synthetic platform API GET /apps/example/releases/live
EVIDENCE:         HTTP 200; liveBuild=2026.07.14+1; claimedBuild=2026.07.14+2
VERDICT:          REFUTED (the system of record still serves the previous build)
```

**Verifying agent:** The merge is confirmed, but the deployment claim is refuted. I am stopping here and reporting the mismatch; I have not retried or changed the deployment.
