# Changelog

All notable changes to `benmacha/mousetracker`.

## 2.1.0 — 2026-05-23

### Added
- PHPStan level 8 static analysis, wired into CI on PHP 8.3 / Symfony 7.4.
- Security warning in README about gating `/tracker/back/*` behind a firewall.
- Enriched Packagist keywords (heatmap, click-tracking, session-replay, gdpr, …).

### Changed
- JS dev tooling bumped: `vitest` ^2.1 → ^4.1, `happy-dom` ^15 → ^20.9 (clears open Dependabot advisories on the dev toolchain; no impact on shipped code).
- Controllers cast `Request::get()` values to `string` before passing to entity setters, eliminating mixed-type leaks PHPStan flagged at level 8.

## 2.0.1 — 2026-05-20

### Added
- JS contract suite (vitest + happy-dom) covering tracker.js boot, the `canRecord` gating logic, `coord4` packed-point round-tripping, and the `createClient` POST body shape.
- Symfony functional test (`WebTestCase` + SQLite + `SchemaTool`) exercising the ingest endpoints against shared JSON fixtures.
- CI badge in README.

### Fixed
- Dropped `framework.handle_all_throwables` from the test kernel — Symfony 5.4 rejects it as unrecognized config.
- Functional tests now skip on Symfony <6.1, where the bundle's `routes.yaml` `type: attribute` loader is unavailable.

## 2.0.0 — 2026-05-19

**Breaking rewrite.** Targets Symfony 5.4 / 6.4 / 7.x and PHP 8.1+.

### Removed
- Symfony 2.8 support, `symfony/symfony` meta-package
- Assetic and the `MouseTrackerExtension` hack that injected the bundle into `assetic.bundles`
- Sensio Framework Extra Bundle (`@Method`, `@Route` annotations)
- `patchwork/jsqueeze`, `leafo/scssphp`
- jQuery dependency in `tracker.js`
- l2.io IP check (kept available via opt-in; runs only when `ignore_ips` is non-empty)

### Changed
- PHP 8.1+ required; codebase uses `declare(strict_types=1)`, attributes, readonly props
- Doctrine annotations → PHP 8 attributes; entities use `datetime_immutable`
- Controllers extend `AbstractController`; routes use `#[Route]` with explicit `methods:`
- Repositories extend `ServiceEntityRepository` and are auto-wired
- `services.yml` → `services.yaml`; service IDs use FQCN; `mouse_tracker` alias replaces `twig_tracker`
- New `Resources/config/routes.yaml` — host apps import this instead of pointing at `Controller/`
- `Tracker::build()` now returns a string (was: `display()` void) so Twig templates can `|raw` it
- `Page::clientID` → `Page::client` (proper Doctrine convention; column name unchanged in DB)
- `Page::data` (collection) uses `getData()`; same name as before
- `findDsitinct` typo renamed to `findDistinctUrls`, signature accepts optional domain filter
- BackController hard-coded browser/IP fields removed — real `source` (referrer) now used
- Tracker JS rewritten in vanilla JS (~440 lines, no external deps), uses `fetch` and `URLSearchParams`
- Twig template uses direct asset URL (`{{ asset(...) }}`) instead of Assetic `{% javascripts %}`

### Added
- `Configuration` class — proper config tree under `mouse_tracker:` root key
- PHP unit tests covering configuration, extension wiring, entities, and the tracker service
- GitHub Actions CI matrix (PHP 8.1/8.2/8.3 × Symfony 5.4/6.4/7.x)
- `CHANGELOG.md`, `CLAUDE.md`

### Fixed
- `.gitattributes` no longer excludes `Resources/` from composer dist — previously a release tarball was unusable because the JS and templates were stripped
- `addData`: `cachedRecords` no longer overwrites `partial` with the wrong column

## 1.x — pre-rewrite history

No `1.x` tags were ever cut for the maintenance branch — Packagist consumers tracked `dev-master` against the `1.x-dev` branch alias. The notes below are reconstructed from `git log` commit messages and diffs.

### 1.0.x — 2025-02-25 (commit `40d173e`)
- Docs: README polish (minor edit, no code changes).

### 1.0.x — 2018-11-10 (commit `ab47e71`)
- CI: Travis matrix updated — added PHP 7.3, dropped 5.5.

### 1.0.x — 2017-03-16 (commit `4299091`)
- Backend: full session-replay UI added under `Resources/public/back/` — ~2,350 lines across `clientList.js`, `userTrack.js`, `userTrackAjax.js`, `userTrackRecords.js`, `userTrackHeatmap.js`, `userTrackScrollmap.js`, `userTrackUI.js`, plus vendored `heatmap.js`, `html2canvas.js`, `alertify`, `qtip`, `uniform`.

### 1.0.x — 2017-03-13 (commits `d2b0e78`, `bdcc189`, `9b8b22e`)
- `BackController` refactored; replay-UI scripts (`userTrackAjax`, `userTrackRecords`, `userTrackUI`) trimmed by ~50 lines.
- Bug fixes in the replay UI and backend index template.
- Documentation corrections.

### 1.0.x — 2017-03-10 (commits `768755f`, `1100c36`, `f8f60ad`, `8df032f`)
- Several bug fixes in `Resources/views/Backend/index.html.twig` (the replay UI loader).
- `composer.json` PHP constraint tightened.

### 1.0.0 — 2017-03-10 (tag, off-tree commit `f6bbba8`)
- First tagged release. **Note:** the `1.0.0` tag points at a commit that is not in the `master` ancestry — it was tagged on a sibling branch and never merged.

### 0.x — 2017-03-08 (commits `68598e4` through `ea9b000`)
- Initial import: `TrackerBundle.php`, `Controller/DefaultController.php`, `Entity/{Client,Page,Data}.php`, `Services/Tracker.php`, `Resources/public/js/tracker.js` (~25 KB, jQuery-based), `Resources/views/Tracker/Front.html.twig`.
- Symfony 2.8 support via `symfony/symfony: 2.8.*`.
- Assetic + scssphp + jsqueeze pipeline for the tracker JS bundle.
