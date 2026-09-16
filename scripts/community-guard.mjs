import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(process.argv[2] ?? process.cwd());
const failures = [];

function walk(dir = '') {
  for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const path = [dir, entry.name].filter(Boolean).join('/');
    if (/(^|\/)(ee|base-formula)(\/|[-.])/i.test(path) || path === '.gitmodules') failures.push(path);
    if (entry.isSymbolicLink()) failures.push(`${path}: 不允许通过软链绕过扫描`);
    if (entry.isDirectory()) walk(path);
    // 扫描实际源码、静态资源、编译产物和依赖；文档与守卫反例不是运行时代码。
    const runtime = /^(src|public|dist|build|lib)\//.test(path) || /^(package\.json|pnpm-lock\.yaml)$/.test(path);
    if (entry.isFile() && runtime && /\.(?:[cm]?[jt]sx?|json|ya?ml|html|css|svg|map)$/.test(path)) {
      const content = readFileSync(resolve(root, path), 'utf8');
      const prohibited = /(?:@docmost\/(?:ee|base-formula)|["'](?:@|\.{1,2})\/ee(?:\/|["'])|\/api\/(?:ai|scim|siem|bases)(?:\/|["'])|Powered by Docmost|docmost-logo|docmost-favicon)/i;
      if (prohibited.test(content)) failures.push(`${path}: 禁止的 Enterprise 引用、路由或品牌产物`);
    }
  }
}

try {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  if (pkg.license !== 'AGPL-3.0-only') failures.push('package.json: 必须声明 AGPL-3.0-only');
  if (!readFileSync(resolve(root, 'LICENSE'), 'utf8').includes('GNU AFFERO GENERAL PUBLIC LICENSE')) failures.push('LICENSE');
  if (!readFileSync(resolve(root, 'PROVENANCE.md'), 'utf8').includes('6205bbeb908fe846f87dd6a2cbf562e24777db38')) failures.push('PROVENANCE.md: 缺少固定上游提交');
  walk();
  // Gitlink 即使尚未初始化，也不能进入纯 Community 导出仓。
  const git = spawnSync('git', ['-C', root, 'ls-files', '--stage'], { encoding: 'utf8' });
  if (git.status === 0) for (const line of git.stdout.split('\n')) {
    if (line.startsWith('160000 ')) failures.push(`gitlink: ${line.split('\t')[1]}`);
  }
} catch (error) {
  failures.push(error.message);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('Community / AGPL 检查通过');
