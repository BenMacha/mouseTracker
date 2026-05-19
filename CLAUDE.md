# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`benmacha/mousetracker` — Symfony bundle (`TrackerBundle`, namespace `benmacha\mousetracker`) that records visitor mouse movements, clicks, and DOM snapshots. Self-hosted Mouseflow-style tool. v2.x targets PHP 8.1+ and Symfony 5.4 / 6.4 / 7.x. Distributed via Packagist as a `symfony-bundle`.

## Common commands

This is a bundle, not an app. Commands below are for working on the bundle itself.

- Install deps: `composer install`
- Run tests: `vendor/bin/phpunit`
- Run a single test file: `vendor/bin/phpunit tests/Entity/PageTest.php`
- Run a single test method: `vendor/bin/phpunit --filter testClientAssociationIsBidirectional`
- Lint PHP syntax across the bundle: `find . -path ./vendor -prune -o -name '*.php' -print0 | xargs -0 -n1 php -l`

Host-app integration (consumers of the bundle):

- Create DB tables (`tracker__client`, `tracker__page`, `tracker__data`): `php bin/console doctrine:schema:update --force`
- Publish the tracker JS asset: `php bin/console assets:install --symlink public/`

## Architecture

Two halves wired through Doctrine entities:

**Client side — `Resources/public/js/tracker.js`** is a ~440-line vanilla JS tracker (`UST` global) that batches mouse moves, clicks, keystrokes, and DOM snapshots, then POSTs them via `fetch`. URL endpoints and runtime settings are injected by `Resources/views/Tracker/Front.html.twig` as `window.MouseTrackerConfig`. The Twig service `Services/Tracker::build()` renders that fragment — host apps drop `{{ mouse_tracker_service.build()|raw }}` just before `</body>`.

**Server side — `Controller/DefaultController.php`** exposes the four ingest endpoints the JS calls (routes are attribute-based; host imports `Resources/config/routes.yaml` under prefix `/tracker`):
- `POST /createClient` — upserts a `Client` and creates a `Page` row per visit
- `POST /addData` — appends a `Data` row (movements/clicks/partial DOM/cached records) to the current `Page`
- `POST /clearPartial`, `POST /addTag` — no-op stubs

**Backend UI — `Controller/BackController.php`** (route prefix `/back`) renders the in-bundle replay UI at `Resources/views/Backend/index.html.twig` and exposes JSON endpoints (`/getPages`, `/getClients`, `/getData`) consumed by it. **Public by default — gate behind firewall config in any real deployment.**

**Entity graph:** `Client` 1—N `Page` 1—N `Data`. Foreign keys (`Page.clientID`, `Data.clientPageID`) cascade on delete. `Data.partial` stores JSON-encoded DOM snapshots that the replay UI decodes per-row. `PageRepository::findDistinctUrls()` returns distinct URLs (optionally filtered by domain).

**Config tree (`mouse_tracker:`):** declared by `DependencyInjection/Configuration.php`; loaded into container parameters by `MouseTrackerExtension`. Parameters are passed into the `Tracker` service constructor, then JSON-encoded into the script tag as `window.MouseTrackerConfig.settings`. JS reads them at boot.

## Gotchas

- `tracker.js` is iframe-aware: if it detects `top !== self` it switches to a postMessage receiver that responds to the replay UI's `CSS`/`EL`/`HOV`/`CLK`/`VAL`/`SZ`/`PTH`/`SCR`/`STATIC`/`screenshot` tasks. Changes to event names must be mirrored in `Resources/views/Backend/index.html.twig` (the replay UI script).
- `clearPartial` and `addTag` endpoints are intentional stubs — the JS calls them but the server discards the payload.
- The hard-coded IP allowlist (`l2.io/ip.js`) only runs when `ignore_ips` is non-empty. It's an external network call; disable it by leaving the array empty in config.
- `BackController` and `DefaultController` controllers and `Services/Tracker` are explicitly registered as `public: true` in `services.yaml` so the Twig global alias `mouse_tracker` can resolve them.
- `Resources/` must NOT be in `.gitattributes` export-ignore — it contains the JS and twig views that runtime needs. (v1.x had this bug.)
- v1 used `$page->getClientID()` returning a `Client` object (misleading name). v2 renames to `$page->getClient()`. DB column name unchanged.

## Testing strategy

Tests live in `tests/` and mirror the source tree (e.g., `tests/DependencyInjection/ConfigurationTest.php`). They are unit tests only — no kernel boot, no DB. The `Configuration` test verifies the tree builder, the `Extension` test verifies service registration into a bare `ContainerBuilder`, and entity tests verify bidirectional association methods. Adding integration tests would require booting a Symfony kernel; that scaffolding is not present.

CI matrix (`.github/workflows/ci.yml`): PHP 8.1/8.2/8.3 × Symfony 5.4/6.4/7.x. Uses Symfony Flex to pin the version under test.
