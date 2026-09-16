# @lec/doc-editor

Shared Tiptap editor extensions for Lec applications. This standalone package is
derived from the AGPL-licensed Docmost `packages/editor-ext` package and is
intended to live at `packages/lec-doc-editor` in its parent repository.

## Use from the parent repository

```json
{
  "dependencies": {
    "@lec/doc-editor": "file:../../packages/lec-doc-editor"
  }
}
```

The package exports its public API from `src/index.ts`. Bundler-based clients
can consume that source entry, while the package build emits CommonJS
JavaScript and declarations to `dist/` for Node services.

## Development

Use Node.js 22.13 or later to run the pinned pnpm version:

```sh
corepack prepare pnpm@11.25.0 --activate
pnpm install
pnpm build
```

React and React DOM are peer dependencies because React node views must share
the consuming application's React runtime.

## License and provenance

Licensed under the GNU Affero General Public License version 3 only. See
[`LICENSE`](LICENSE). Upstream source and attribution details are recorded in
[`PROVENANCE.md`](PROVENANCE.md).
