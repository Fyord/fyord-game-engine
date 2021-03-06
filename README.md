# fyord-game-engine
Extends fyord into a 2d game engine

This is brand spanking new, more info to come...

## Contributors

[Code of conduct](https://github.com/Fyord/fyord/blob/main/CODE_OF_CONDUCT.md)

### Installation
- `npm i`

### Test
- `npm test`

### Lint
- `npm run lint`

### Build (with source maps)
- `npm run build`

### Publish to npm (manually)
- Update `./dist/package.json` version*.
- `npm login`
- `npm run build-prod`
- `npm run publish`

### Publish to npm (CI)
- Update `./dist/package.json` version*.
- Merge changes to trunk (main) branch.
  - Assuming the build passes and the version in the `./dist/package.json` has been updated, CI will publish the new version.

*Use Semantic Versioning (MAJOR.MINOR.PATCH - 1.1.1)
- MAJOR version when you make incompatible API changes
- MINOR version when you add functionality in a backwards compatible manner
- PATCH version when you make backwards compatible bug fixes.

Consider anything importable via `fyord-game-engine` directly as part of the public api (exports of `src/module.ts`);
