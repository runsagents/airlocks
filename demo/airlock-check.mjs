import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const demoDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(demoDirectory, "..");

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const logPath = resolve(
  option("--log", resolve(demoDirectory, "fake-deploy.log")),
);
const storePath = resolve(
  option("--store", resolve(demoDirectory, "store-state.json")),
);
const claimedBuild = option("--claim-build", "2026.07.14+2");

const log = await readFile(logPath, "utf8");
const store = JSON.parse(await readFile(storePath, "utf8"));
const deployResult = log
  .trim()
  .split("\n")
  .map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  })
  .find((entry) => entry?.kind === "deploy-result");

const naiveVerdict = /success/i.test(log) ? "DEPLOYED" : "NOT DEPLOYED";
const logLabel = relative(projectRoot, logPath);
const storeLabel = relative(projectRoot, storePath);
const exitStatus = Number.isInteger(deployResult?.exitStatus)
  ? deployResult.exitStatus
  : undefined;
const liveBuild =
  typeof store.liveBuild === "string" && store.liveBuild.length > 0
    ? store.liveBuild
    : undefined;
const exitRefutes = exitStatus !== undefined && exitStatus !== 0;
const storeRefutes = liveBuild !== undefined && liveBuild !== claimedBuild;

let verdict;
let reason;
if (exitRefutes || storeRefutes) {
  verdict = "REFUTED";
  reason =
    exitRefutes && storeRefutes
      ? "deploy exited non-zero and the system of record still serves a different build"
      : exitRefutes
        ? "deploy exited non-zero"
        : "the system of record serves a different build";
} else if (exitStatus === undefined || liveBuild === undefined) {
  verdict = "UNVERIFIABLE";
  reason =
    exitStatus === undefined
      ? "the deploy log did not provide a structured exit status"
      : "the system of record did not provide a live build";
} else {
  verdict = "CONFIRMED";
  reason = "deploy exited zero and the system of record serves the claimed build";
}

console.log("SYNTHETIC DEMO — no real deployment or store was queried.");
console.log(
  `NAIVE GREP: ${naiveVerdict} (searched ${logLabel} for \"success\")`,
);
console.log();
console.log("AIRLOCK CHECK");
console.log(`CLAIM:            build ${claimedBuild} deployed`);
console.log(`SYSTEM OF RECORD: ${storeLabel} (liveBuild)`);
console.log(
  `EVIDENCE:         deploy exitStatus=${exitStatus ?? "unavailable"}; liveBuild=${liveBuild ?? "unavailable"}; claimedBuild=${claimedBuild}`,
);
console.log(
  `VERDICT:          ${verdict} (${reason})`,
);
