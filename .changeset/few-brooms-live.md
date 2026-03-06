---
'@backstage/cli': patch
'@backstage/cli-module-lint': patch
---

Added oxlint as an alternative lint engine for package and repo lint commands. Packages can opt in by passing `--engine oxlint` to `backstage-cli package lint`, which uses a shared configuration with custom JS plugins that port Backstage-specific ESLint rules. The base config enables react-perf, node, and promise plugins alongside the existing typescript, import, jest, react, jsx-a11y, and unicorn plugins. Monorepo-specific rules (notice header enforcement, Material UI 4 import restrictions) are separated into a root-level `.oxlintrc.json` that cascades down via a new ancestor config merging system — `.oxlintrc.json` files at any directory level between the repo root and a package are merged in outermost-first order, allowing shared overrides at any level of the directory tree. Both `oxlint` and `oxlint-tsgolint` are added as optional peer dependencies.
