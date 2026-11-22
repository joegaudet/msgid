# msgid

The shared translator contract for [ember-joinery](https://github.com/joegaudet/ember-joinery),
[ember-formwright](https://github.com/joegaudet/ember-formwright) and
[real-enums](https://github.com/joegaudet/real-enums): its types, an English formatter, a
pseudo-locale, adapters for gettext, i18next, FormatJS/ember-intl and Lingui, and a catalog CLI.

| Package                   | For                                        |
| ------------------------- | ------------------------------------------ |
| [`msgid`](packages/msgid) | The contract, `format()`, adapters and CLI |

Start with the [package README](packages/msgid/README.md) and the
[contract](packages/msgid/CONTRACT.md).

## Developing

```sh
pnpm install
pnpm build && pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
```

Releases use changesets: add one with `pnpm changeset`, and a tag `v<version>` on `main` makes
`.github/workflows/release.yml` publish to npm.

## Site and API reference

The site at [joegaudet.com/msgid](https://joegaudet.com/msgid/) is hand-written HTML in
`docs/site/`. The [API reference](https://joegaudet.com/msgid/api/) under it is generated: TypeDoc
builds it from the package's TSDoc (`pnpm docs:api`, after `pnpm build`) into `docs/api/`, styled
by `docs/api.css` and `scripts/typedoc-site.mjs`, with `docs/api/llms-full.txt` beside it.
`.github/workflows/pages.yml` deploys both, building the reference from the latest release tag's
sources; `release.yml` runs it after each release. Every TypeDoc warning fails `pnpm test`: an
export without a doc comment, a broken `{@link}`, or an exported signature that names a type the
package doesn't export.

```sh
pnpm build && pnpm docs:api && rm -rf _site && cp -R docs/site _site && cp -R docs/api _site/api
python3 -m http.server 8766 --directory _site
```
