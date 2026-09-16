# Provenance

Lec export and modification date: 2026-09-16.

`@lec/doc-editor` is derived from the open-source Docmost editor extension
package:

- Upstream project: [Docmost](https://github.com/docmost/docmost)
- Upstream package path: `packages/editor-ext`
- Upstream package version: Docmost 0.96.0
- Source position: one commit after tag `v0.96.0` (`v0.96.0-1-g6205bb`)
- Source commit: [`6205bbeb908fe846f87dd6a2cbf562e24777db38`](https://github.com/docmost/docmost/commit/6205bbeb908fe846f87dd6a2cbf562e24777db38)
- Upstream copyright: Docmost contributors
- License: GNU Affero General Public License version 3 only (`AGPL-3.0-only`)

The package was separated from the Docmost monorepo and renamed from
`@docmost/editor-ext` to `@lec/doc-editor`. Its standalone metadata, dependency
manifest, and documentation were added for use from the parent repository at
`packages/lec-doc-editor`. The editor extension source remains under the same
AGPL license; the complete license text is retained in [`LICENSE`](LICENSE).

No Docmost enterprise-edition source or `base-formula` package is included.
