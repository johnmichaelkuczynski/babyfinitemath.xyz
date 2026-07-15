---
name: esbuild __dirname asset copy
description: Any npm package that reads a sibling file via path.resolve(__dirname, 'file') will break when bundled by esbuild, because the banner rewrites __dirname to the dist/ folder. Fix by copying the asset into dist/ as a post-build step in build.mjs.
---

# esbuild __dirname asset copy

## The rule

Any npm package that loads a data file with `path.resolve(__dirname, 'something.sql')` (or similar) breaks when bundled by esbuild, because the build banner sets:

```js
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
```

…which points at `dist/`, not the original package directory. So the file is looked for at `dist/something.sql` and throws `ENOENT`.

**Why:** esbuild bundles all JS into a single file in `dist/`, but non-JS assets that packages reference by path are not copied there.

## How to apply

In `build.mjs`, after the `await esbuild({...})` call, copy the missing asset into `distDir`:

```js
import { copyFile } from "node:fs/promises";

// after esbuild(...)
await copyFile(
  path.resolve(artifactDir, "../../node_modules/.pnpm/<pkg>/node_modules/<pkg>/file.ext"),
  path.join(distDir, "file.ext")
);
```

## Known affected package

- `connect-pg-simple@10.0.0` — reads `table.sql` via `__dirname`. Already fixed in `artifacts/api-server/build.mjs`.

## Symptoms

- `ENOENT: no such file or directory, open '.../dist/table.sql'`
- Error surfaces at startup or on first session read/write/prune
- Works in dev (where `node_modules` is accessible) but breaks in production esbuild output
