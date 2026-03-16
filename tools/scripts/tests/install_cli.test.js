const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  getSharedAgentsPath,
  getTargets,
  readInstallManifest,
  uninstallForTarget,
  writeInstallManifest,
} = require("../../bin/install.js");

const home = process.env.HOME || process.env.USERPROFILE;

assert.strictEqual(
  getTargets({ codex: true }).at(0).path,
  path.join(home, ".agents", "skills"),
  "--codex should install into ~/.agents/skills",
);

assert.strictEqual(
  getSharedAgentsPath(),
  path.join(home, ".agents", "skills"),
  "shared agents path should resolve under ~/.agents/skills",
);

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agents-curated-skills-test-"));
const targetPath = path.join(tempRoot, "skills");
fs.mkdirSync(targetPath, { recursive: true });

for (const name of ["alpha-skill", "beta-skill"]) {
  fs.mkdirSync(path.join(targetPath, name), { recursive: true });
  fs.writeFileSync(path.join(targetPath, name, "SKILL.md"), `# ${name}\n`);
}
fs.mkdirSync(path.join(targetPath, "docs"), { recursive: true });
fs.writeFileSync(path.join(targetPath, "docs", "guide.md"), "# guide\n");

writeInstallManifest(targetPath, ["alpha-skill", "beta-skill"], true);

const manifest = readInstallManifest(targetPath);
assert.deepStrictEqual(
  manifest.skillNames,
  ["alpha-skill", "beta-skill"],
  "manifest should round-trip installed skill names",
);

uninstallForTarget(null, { name: "Test", path: targetPath });

assert.ok(!fs.existsSync(path.join(targetPath, "alpha-skill")), "uninstall should remove manifest skills");
assert.ok(!fs.existsSync(path.join(targetPath, "beta-skill")), "uninstall should remove manifest skills");
assert.ok(!fs.existsSync(path.join(targetPath, "docs")), "uninstall should remove managed docs");
assert.ok(
  !fs.existsSync(path.join(targetPath, ".agents-curated-skills-manifest.json")),
  "uninstall should remove the install manifest",
);

fs.rmSync(tempRoot, { recursive: true, force: true });
