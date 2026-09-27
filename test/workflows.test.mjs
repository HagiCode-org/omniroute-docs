import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("CI and publication run the same verification gate", async () => {
  const ci = await read("../.github/workflows/docs-ci.yml");
  const deploy = await read("../.github/workflows/docs-deploy-gh-pages.yml");
  assert.match(ci, /submodules: true/u);
  assert.match(deploy, /submodules: true/u);
  for (const command of ["npm ci", "npm run check", "npm run build", "npm test"]) {
    assert.ok(ci.includes(`- run: ${command}`), `CI: ${command}`);
    assert.ok(deploy.includes(`- run: ${command}`), `publish: ${command}`);
  }
  assert.match(deploy, /if: \$\{\{ github\.ref == 'refs\/heads\/main' \}\}/u);
  assert.match(deploy, /needs: build/u);
  assert.match(deploy, /contents: read[\s\S]*contents: write/u);
  assert.match(deploy, /cp -R dist\/\. "\$PUBLICATION_DIR\/dist\/"/u);
  assert.match(deploy, /publish_branch: gh-pages/u);
});

test("publication payload includes OmniRoute-owned assets configuration", async () => {
  for (const name of ["esa", "wrangler"]) {
    const config = JSON.parse(await read(`../.github/gh-pages/${name}.jsonc`));
    assert.equal(config.name, "omniroute-docs");
    assert.equal(config.assets.directory, "./dist");
  }
  const deploy = await read("../.github/workflows/docs-deploy-gh-pages.yml");
  assert.match(deploy, /cp \.github\/gh-pages\/esa\.jsonc "\$PUBLICATION_DIR\/esa\.jsonc"/u);
  assert.match(deploy, /cp \.github\/gh-pages\/wrangler\.jsonc "\$PUBLICATION_DIR\/wrangler\.jsonc"/u);
});
