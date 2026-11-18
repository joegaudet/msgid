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
