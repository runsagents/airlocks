import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const checker = fileURLToPath(
  new URL("../demo/airlock-check.mjs", import.meta.url),
);

function runChecker(args = []) {
  return spawnSync(process.execPath, [checker, ...args], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function syntheticEvidence(t, { log, store }) {
  const directory = mkdtempSync(join(tmpdir(), "airlocks-test-"));
  const logPath = join(directory, "deploy.log");
  const storePath = join(directory, "store.json");
  writeFileSync(logPath, log);
  writeFileSync(storePath, JSON.stringify({ synthetic: true, ...store }));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return { logPath, storePath };
}

test("refutes a deploy when grep finds success only inside an error", () => {
  const result = runChecker();

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /NAIVE GREP: DEPLOYED/);
  assert.match(result.stdout, /^CLAIM: {12}build 2026\.07\.14\+2 deployed$/m);
  assert.match(
    result.stdout,
    /^SYSTEM OF RECORD: demo\/store-state\.json \(liveBuild\)$/m,
  );
  assert.match(
    result.stdout,
    /^EVIDENCE: {9}deploy exitStatus=1; liveBuild=2026\.07\.14\+1; claimedBuild=2026\.07\.14\+2$/m,
  );
  assert.match(
    result.stdout,
    /^VERDICT: {10}REFUTED \(deploy exited non-zero and the system of record still serves a different build\)$/m,
  );
});

test("confirms a deploy only when the exit status and live build agree", (t) => {
  const { logPath, storePath } = syntheticEvidence(t, {
    log: [
      "# SYNTHETIC EVIDENCE — no real deployment occurred.",
      '{"kind":"deploy-result","build":"build-42","exitStatus":0,"status":"succeeded"}',
      "",
    ].join("\n"),
    store: { liveBuild: "build-42" },
  });

  const result = runChecker([
    "--log",
    logPath,
    "--store",
    storePath,
    "--claim-build",
    "build-42",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /^EVIDENCE: {9}deploy exitStatus=0; liveBuild=build-42; claimedBuild=build-42$/m,
  );
  assert.match(
    result.stdout,
    /^VERDICT: {10}CONFIRMED \(deploy exited zero and the system of record serves the claimed build\)$/m,
  );
});

test("reports unverifiable when the system of record has no live build", (t) => {
  const { logPath, storePath } = syntheticEvidence(t, {
    log: [
      "# SYNTHETIC EVIDENCE — no real deployment occurred.",
      '{"kind":"deploy-result","build":"build-42","exitStatus":0,"status":"succeeded"}',
      "",
    ].join("\n"),
    store: { status: "temporarily-unavailable" },
  });

  const result = runChecker([
    "--log",
    logPath,
    "--store",
    storePath,
    "--claim-build",
    "build-42",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /^EVIDENCE: {9}deploy exitStatus=0; liveBuild=unavailable; claimedBuild=build-42$/m,
  );
  assert.match(
    result.stdout,
    /^VERDICT: {10}UNVERIFIABLE \(the system of record did not provide a live build\)$/m,
  );
});
