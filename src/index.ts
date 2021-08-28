#!/usr/bin/env node
import "dotenv/config";

import { spawnSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { program } from "commander";

if (!process.env.GITHUB_TOKEN) {
  console.warn(`No GITHUB_TOKEN available as environment variable, skipping GitHub Release`);
  process.exit(0);
}

const { name, version }: { name: string; version: string } = require(resolve(
  process.cwd(),
  "package.json"
));

if (!name || !version) {
  console.error("Error: Couldn't find package.json with valid name & version");
  process.exit(0);
}

program
  .version(require(resolve(__dirname, "../package.json")).version)
  .description("Changesets GitHub Release");

const packageJsonRepoField = existsSync(resolve(process.cwd(), "package.json"))
  ? (
      JSON.parse(
        readFileSync(resolve(process.cwd(), "package.json"), {
          encoding: "utf-8",
        })
      ) as { repository?: { url?: string } | string }
    )?.repository
  : undefined;

function cleanRepoUrl(repoUrl: string | undefined) {
  if (typeof repoUrl !== "string") return;

  return repoUrl.replace("git+", "").replace(".git", "").replace("https://github.com/", "");
}

let repo: string | undefined =
  process.env.GITHUB_REPO ||
  (typeof packageJsonRepoField === "string"
    ? cleanRepoUrl(packageJsonRepoField)
    : cleanRepoUrl(packageJsonRepoField?.url));

program.option("--repo <github-repo>", "Target repo, it should have the format: 'owner/repo-name'");

program.parse(process.argv);

repo = program.opts().repo || repo;

if (typeof repo !== "string") {
  console.error("[GitHub Release] Target repository not specified");

  process.exit(0);
}

let [owner, repoName] = repo.split("/").map((v) => v.trim());

if (!owner || !repoName) {
  console.error("Not following format: 'owner/repo-name'");

  process.exit(1);
}

let body: string = "NO CHANGELOG AVAILABLE FOR: v" + version;

const changelogPath = resolve(process.cwd(), "./CHANGELOG.md");
if (existsSync(changelogPath)) {
  const changelog = readFileSync(changelogPath, {
    encoding: "utf-8",
  });

  if (changelog) {
    const lines = changelog.split(/\r\n|\n/g);

    const versionLine = lines.findIndex((line) => line.startsWith(`## ${version}`));

    if (versionLine !== -1) {
      const prevVersionLine = lines
        .slice(versionLine + 1)
        .findIndex((line) => line.startsWith("## "));

      let newBody: string;

      if (prevVersionLine !== -1) {
        newBody = lines
          .slice(versionLine, versionLine + 1 + prevVersionLine)
          .join("\n")
          .trim();
      } else {
        newBody = lines.slice(versionLine).join("\n").trim();
      }

      if (newBody) {
        body = newBody;
      }
    }
  }
}

try {
  spawnSync(
    "node",
    [
      resolve(__dirname, "./github-api.js"),
      "upload",
      "--owner",
      owner,
      "--repo",
      repoName,
      "--tag",
      `${name}@${version}`,
      "--release-name",
      `${name}@${version}`,
      "--body",
      body,
      "--token",
      process.env.GITHUB_TOKEN,
    ],
    {
      stdio: "inherit",
    }
  );
} catch (err) {
  console.error(err);
}
