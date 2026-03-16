#!/usr/bin/env node

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { resolveSafeRealPath } = require("../lib/symlink-safety");

const REPO = "https://github.com/c0ze/agents-curated-skills.git";
const HOME = process.env.HOME || process.env.USERPROFILE || "";
const MANIFEST_FILE = ".agents-curated-skills-manifest.json";

function getSharedAgentsPath() {
  return path.join(HOME, ".agents", "skills");
}

function resolveDir(p) {
  if (!p) return null;
  const s = p.replace(/^~($|\/)/, HOME + "$1");
  return path.resolve(s);
}

function parseArgs(argv = process.argv.slice(2)) {
  const a = argv;
  let pathArg = null;
  let versionArg = null;
  let tagArg = null;
  let action = "install";
  let cursor = false,
    claude = false,
    gemini = false,
    codex = false,
    antigravity = false,
    kiro = false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--help" || a[i] === "-h") return { help: true };
    if (a[i] === "install") {
      action = "install";
      continue;
    }
    if (a[i] === "uninstall" || a[i] === "--uninstall") {
      action = "uninstall";
      continue;
    }
    if (a[i] === "--path" && a[i + 1]) {
      pathArg = a[++i];
      continue;
    }
    if (a[i] === "--version" && a[i + 1]) {
      versionArg = a[++i];
      continue;
    }
    if (a[i] === "--tag" && a[i + 1]) {
      tagArg = a[++i];
      continue;
    }
    if (a[i] === "--cursor") {
      cursor = true;
      continue;
    }
    if (a[i] === "--claude") {
      claude = true;
      continue;
    }
    if (a[i] === "--gemini") {
      gemini = true;
      continue;
    }
    if (a[i] === "--codex") {
      codex = true;
      continue;
    }
    if (a[i] === "--antigravity") {
      antigravity = true;
      continue;
    }
    if (a[i] === "--kiro") {
      kiro = true;
      continue;
    }
  }

  return {
    action,
    pathArg,
    versionArg,
    tagArg,
    cursor,
    claude,
    gemini,
    codex,
    antigravity,
    kiro,
  };
}

function getTargets(opts) {
  const targets = [];
  if (opts.pathArg) {
    return [{ name: "Custom", path: resolveDir(opts.pathArg) }];
  }
  if (opts.cursor) {
    targets.push({ name: "Cursor", path: path.join(HOME, ".cursor", "skills") });
  }
  if (opts.claude) {
    targets.push({ name: "Claude Code", path: path.join(HOME, ".claude", "skills") });
  }
  if (opts.gemini) {
    targets.push({ name: "Gemini CLI", path: path.join(HOME, ".gemini", "skills") });
  }
  if (opts.codex) {
    targets.push({ name: "Codex CLI", path: getSharedAgentsPath() });
  }
  if (opts.kiro) {
    targets.push({ name: "Kiro", path: path.join(HOME, ".kiro", "skills") });
  }
  if (opts.antigravity) {
    targets.push({ name: "Antigravity", path: path.join(HOME, ".gemini", "antigravity", "skills") });
  }
  if (targets.length === 0) {
    targets.push({ name: "Antigravity", path: path.join(HOME, ".gemini", "antigravity", "skills") });
  }
  return targets;
}

function printHelp() {
  console.log(`
agents-curated-skills — installer

  npx agents-curated-skills [install|uninstall] [options]

  Install or remove the skills repo from your agent's skills directory.

Options:
  --cursor       Install to ~/.cursor/skills (Cursor)
  --claude       Install to ~/.claude/skills (Claude Code)
  --gemini       Install to ~/.gemini/skills (Gemini CLI)
  --codex        Install to ~/.agents/skills (Codex CLI shared path)
  --kiro         Install to ~/.kiro/skills (Kiro CLI)
  --antigravity  Install to ~/.gemini/antigravity/skills (Antigravity)
  --uninstall    Remove installed skills instead of installing them
  --path <dir>   Install to <dir> (default: ~/.gemini/antigravity/skills)
  --version <ver>  After clone, checkout tag v<ver> (e.g. 4.6.0 -> v4.6.0)
  --tag <tag>      After clone, checkout this tag (e.g. v4.6.0)

Examples:
  npx agents-curated-skills
  npx agents-curated-skills --cursor
  npx agents-curated-skills uninstall --codex
  npx agents-curated-skills --kiro
  npx agents-curated-skills --antigravity
  npx agents-curated-skills --version 4.6.0
  npx agents-curated-skills --path ./my-skills
  npx agents-curated-skills --claude --codex    Install to multiple targets
`);
}

function copyRecursiveSync(src, dest, rootDir = src, skipGit = true) {
  const stats = fs.lstatSync(src);
  const resolvedSource = stats.isSymbolicLink()
    ? resolveSafeRealPath(rootDir, src)
    : src;

  if (!resolvedSource) {
    console.warn(`  Skipping symlink outside cloned skills root: ${src}`);
    return;
  }

  const resolvedStats = fs.statSync(resolvedSource);
  if (resolvedStats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(resolvedSource).forEach((child) => {
      if (skipGit && child === ".git") return;
      copyRecursiveSync(path.join(resolvedSource, child), path.join(dest, child), rootDir, skipGit);
    });
  } else {
    fs.copyFileSync(resolvedSource, dest);
  }
}

function getRepoSkillNames(tempDir) {
  const repoSkills = path.join(tempDir, "skills");
  if (!fs.existsSync(repoSkills)) {
    console.error("Cloned repo has no skills/ directory.");
    process.exit(1);
  }
  return fs.readdirSync(repoSkills).filter((name) => {
    const full = path.join(repoSkills, name);
    return (
      fs.existsSync(full) &&
      fs.statSync(full).isDirectory() &&
      fs.existsSync(path.join(full, "SKILL.md"))
    );
  });
}

function getManifestPath(targetPath) {
  return path.join(targetPath, MANIFEST_FILE);
}

function readInstallManifest(targetPath) {
  const manifestPath = getManifestPath(targetPath);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    console.warn(`  Ignoring unreadable manifest at ${manifestPath}: ${error.message}`);
    return null;
  }
}

function writeInstallManifest(targetPath, skillNames, docsInstalled) {
  const manifest = {
    version: 1,
    repo: REPO,
    installedAt: new Date().toISOString(),
    skillNames,
    docsInstalled,
  };
  fs.writeFileSync(getManifestPath(targetPath), JSON.stringify(manifest, null, 2) + "\n");
}

function removeRecursiveSync(targetPath) {
  if (fs.rmSync) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } else {
    fs.rmdirSync(targetPath, { recursive: true });
  }
}

/** Copy contents of repo's skills/ into target so each skill is target/skill-name/ (for Claude Code etc.). */
function installSkillsIntoTarget(tempDir, target) {
  const repoSkills = path.join(tempDir, "skills");
  const skillNames = getRepoSkillNames(tempDir);
  skillNames.forEach((name) => {
    const src = path.join(repoSkills, name);
    const dest = path.join(target, name);
    copyRecursiveSync(src, dest, repoSkills);
  });
  const repoDocs = path.join(tempDir, "docs");
  let docsInstalled = false;
  if (fs.existsSync(repoDocs)) {
    const docsDest = path.join(target, "docs");
    if (!fs.existsSync(docsDest)) fs.mkdirSync(docsDest, { recursive: true });
    copyRecursiveSync(repoDocs, docsDest, repoDocs);
    docsInstalled = true;
  }
  writeInstallManifest(target, skillNames, docsInstalled);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) process.exit(r.status == null ? 1 : r.status);
}

function installForTarget(tempDir, target) {
  if (fs.existsSync(target.path)) {
    const gitDir = path.join(target.path, ".git");
    if (fs.existsSync(gitDir)) {
      console.log(`  Migrating from full-repo install to skills-only layout…`);
      const entries = fs.readdirSync(target.path);
      for (const name of entries) {
        const full = path.join(target.path, name);
        const stat = fs.lstatSync(full);
        if (stat.isDirectory() && !stat.isSymbolicLink()) {
          if (fs.rmSync) {
            fs.rmSync(full, { recursive: true, force: true });
          } else {
            fs.rmdirSync(full, { recursive: true });
          }
        } else {
          fs.unlinkSync(full);
        }
      }
    } else {
      console.log(`  Updating existing install at ${target.path}…`);
    }
  } else {
    const parent = path.dirname(target.path);
    if (!fs.existsSync(parent)) {
      try {
        fs.mkdirSync(parent, { recursive: true });
      } catch (e) {
        console.error(`  Cannot create parent directory: ${parent}`, e.message);
        process.exit(1);
      }
    }
    fs.mkdirSync(target.path, { recursive: true });
  }

  installSkillsIntoTarget(tempDir, target.path);
  console.log(`  ✓ Installed to ${target.path}`);
}

function uninstallForTarget(tempDir, target) {
  if (!fs.existsSync(target.path)) {
    console.log(`  Nothing to uninstall at ${target.path}`);
    return;
  }

  const manifest = readInstallManifest(target.path);
  const skillNames = manifest?.skillNames || getRepoSkillNames(tempDir);
  let removedCount = 0;

  for (const name of skillNames) {
    const full = path.join(target.path, name);
    if (!fs.existsSync(full)) {
      continue;
    }
    removeRecursiveSync(full);
    removedCount += 1;
  }

  if (manifest?.docsInstalled) {
    const docsPath = path.join(target.path, "docs");
    if (fs.existsSync(docsPath)) {
      removeRecursiveSync(docsPath);
    }
  }

  const manifestPath = getManifestPath(target.path);
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
  }

  console.log(`  ✓ Removed ${removedCount} skill(s) from ${target.path}`);
}

function main() {
  const opts = parseArgs();
  const { action, tagArg, versionArg } = opts;

  if (opts.help) {
    printHelp();
    return;
  }

  const targets = getTargets(opts);
  if (!targets.length || !HOME) {
    console.error(
      "Could not resolve home directory. Use --path <absolute-path>.",
    );
    process.exit(1);
  }

  const needsRepo = action === "install" || targets.some((target) => !readInstallManifest(target.path));
  const tempDir = needsRepo ? fs.mkdtempSync(path.join(os.tmpdir(), "ag-skills-")) : null;
  const originalCwd = process.cwd();

  try {
    if (needsRepo) {
      console.log("Cloning repository…");
      run("git", ["clone", REPO, tempDir]);
    }

    const ref =
      tagArg ||
      (versionArg
        ? versionArg.startsWith("v")
          ? versionArg
          : `v${versionArg}`
        : null);
    if (ref && tempDir) {
      console.log(`Checking out ${ref}…`);
      process.chdir(tempDir);
      run("git", ["checkout", ref]);
      process.chdir(originalCwd);
    }

    console.log(`\n${action === "uninstall" ? "Uninstalling" : "Installing"} for ${targets.length} target(s):`);
    for (const target of targets) {
      console.log(`\n${target.name}:`);
      if (action === "uninstall") {
        uninstallForTarget(tempDir, target);
      } else {
        installForTarget(tempDir, target);
      }
    }

    if (action === "uninstall") {
      console.log("\nUninstall complete.");
    } else {
      console.log(
        "\nPick a bundle in docs/users/bundles.md and use @skill-name in your AI assistant.",
      );
    }
  } finally {
    try {
      if (tempDir && fs.existsSync(tempDir)) {
        removeRecursiveSync(tempDir);
      }
    } catch (e) {
      // ignore cleanup errors
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  copyRecursiveSync,
  getRepoSkillNames,
  getSharedAgentsPath,
  getTargets,
  installSkillsIntoTarget,
  installForTarget,
  parseArgs,
  readInstallManifest,
  uninstallForTarget,
  writeInstallManifest,
  main,
};
