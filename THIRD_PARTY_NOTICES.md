# Third-party notices

Pixel Crunch is licensed under `AGPL-3.0-only`. Third-party components remain under their own licenses. Exact dependency resolution is recorded in `pnpm-lock.yaml`.

## Current direct dependencies

| Component | Version | License |
| --- | --- | --- |
| Astro, `@astrojs/react`, `@astrojs/sitemap` | 7.3.3 / 6.0.6 / 3.7.4 | MIT |
| React, React DOM | 19.3.0 | MIT |
| Tailwind CSS, `@tailwindcss/vite` | 4.3.3 | MIT |
| `@imgly/background-removal` | 1.7.0 | GNU AGPL version 3 in the package `LICENSE.md` |
| `onnxruntime-web` | 1.21.0 | MIT, Microsoft Corporation |
| browser-image-compression | 2.0.2 | MIT |
| clsx | 2.1.1 | MIT |
| FileSaver.js | 2.0.5 | MIT |
| gifenc | 1.0.3 | MIT |
| gifuct-js | 2.1.2 | MIT |
| JSZip | 3.10.2 | MIT OR GPL-3.0-or-later; Pixel Crunch uses the MIT option |
| lucide-react | 1.47.0 | ISC |
| react-dropzone | 20.1.2 | MIT |
| Sonner | 2.0.8 | MIT |
| SVGO | 4.1.0 | MIT |
| tailwind-merge | 3.7.0 | MIT |

## Fonts

| Component | Version | License |
| --- | --- | --- |
| Fira Code variable webfont | 6.2 | SIL Open Font License 1.1 |

Pixel Crunch serves Fira Code from the same origin at a versioned path. The upstream license text is preserved in [docs/licenses/FiraCode-OFL-1.1.txt](docs/licenses/FiraCode-OFL-1.1.txt).

Transitive packages and development tools are not relicensed by Pixel Crunch. Their package manifests and license files remain authoritative; release validation uses `pnpm licenses list --prod --json`.

## Background-removal assets

The static build prepares this audited asset set from the pinned upstream archive. Generated files are served from a versioned same-origin path and are intentionally excluded from Git:

| Component | Version | License evidence |
| --- | --- | --- |
| `@imgly/background-removal-data` static asset package | 1.7.0 | GNU AGPL version 3 plus `ThirdPartyLicenses.json` |
| ISNET models | 1.7.0 asset set | Vendor notice says MIT; cited DIS source is Apache-2.0 |

The preparation script verifies the archive and every content-addressed fragment, enforces Cloudflare Pages' per-file limit, and copies the upstream license and notices into the deployed asset directory. Pixel Crunch also preserves the Apache-2.0 license for DIS-derived ISNET assets conservatively. Exact hashes, sizes and distribution rules are in [docs/LICENSING.md](docs/LICENSING.md); relevant texts are under [docs/licenses](docs/licenses).

Copyright and trademark notices identify their respective owners. No endorsement is implied.
