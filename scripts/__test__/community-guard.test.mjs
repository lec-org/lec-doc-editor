import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const guard = new URL('../community-guard.mjs', import.meta.url);

// 用真实 CLI 扫描隔离目录，证明守卫会拒绝回流，而不只测试正则自身。
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'lec-community-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (name, value) => {
    mkdirSync(join(root, name, '..'), { recursive: true });
    writeFileSync(join(root, name), value);
  };
  put('package.json', JSON.stringify({ license: 'AGPL-3.0-only' }));
  put('LICENSE', readFileSync(new URL('../../LICENSE', import.meta.url)));
  put('PROVENANCE.md', 'Docmost Community 6205bbeb908fe846f87dd6a2cbf562e24777db38');
  return { root, put, run: () => spawnSync(process.execPath, [guard.pathname, root], { encoding: 'utf8' }) };
}

test('允许合法来源声明与 Community 数据库 import', (t) => {
  const f = fixture(t);
  f.put('src/main.ts', "import { Page } from '@docmost/db/types';");
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
});

test('拒绝 Enterprise 文件，即使没有任何调用方', (t) => {
  const f = fixture(t);
  f.put('src/ee/feature.ts', 'export const enabled = true;');
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /src\/ee\/feature.ts/);
});

for (const [name, content] of [
  ['src/main.ts', "export { x } from '@/ee/ai';"],
  ['src/lazy.ts', "const x = import('../ee/sso');"],
  ['dist/assets/ee-ai-123.js', 'export const enabled = true;'],
  ['dist/assets/main.js', 'const route = "/api/ai/generate";'],
  ['src/brand.ts', 'export const footer = "Powered by Docmost";'],
  ['.gitmodules', '[submodule "ee"]\nurl=https://github.com/docmost/ee.git'],
  ['pnpm-lock.yaml', "'@docmost/base-formula': {}"],
]) {
  test(`拒绝源码、依赖或产物回流：${name}`, (t) => {
    const f = fixture(t);
    f.put(name, content);
    const result = f.run();
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(name), result.stderr);
  });
}

test('拒绝许可证或上游来源被移除', (t) => {
  const f = fixture(t);
  f.put('package.json', '{}');
  f.put('PROVENANCE.md', 'unknown');
  const result = f.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /package.json/);
  assert.match(result.stderr, /PROVENANCE.md/);
});

test('拒绝尚未初始化且没有 .gitmodules 的 gitlink', (t) => {
  const f = fixture(t);
  assert.equal(spawnSync('git', ['init', '-q', f.root]).status, 0);
  assert.equal(spawnSync('git', ['-C', f.root, 'update-index', '--add', '--cacheinfo', '160000,1111111111111111111111111111111111111111,vendor/hidden']).status, 0);
  const result = f.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /gitlink: vendor\/hidden/);
});
