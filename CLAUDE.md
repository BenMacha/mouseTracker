# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`benmacha/mousetracker` — a Symfony 2.8 bundle (`TrackerBundle`, namespace `benmacha\mousetracker`) that records visitor mouse movements, clicks, and page snapshots (a self-hosted Mouseflow-style tool). Distributed via Packagist as a `symfony-bundle`. PHP >= 5.3.9.

## Common commands

This is a bundle, not an app — there is no standalone runtime. Commands below assume it's installed inside a host Symfony 2.8 app via `composer require benmacha/mousetracker dev-master`.

- Install deps: `composer install`
- Create DB tables (`tracker__client`, `tracker__page`, `tracker__data`): `php app/console doctrine:schema:update --force`
- Build the minified tracker JS bundle (required for `mousetrackerService.build()` to emit a working script tag): `php app/console assetic:dump`
- Tests (per `.travis.yml`): `phpunit --verbose` — note: no test suite exists in the repo yet.

The host app must register the bundle in `AppKernel`, import `@TrackerBundle/Controller/` into routing under prefix `/tracker`, import `@TrackerBundle/Resources/config/services.yml`, expose `@twig_tracker` as the Twig global `mousetrackerService`, and configure assetic with the `scssphp` + `jsqueeze` filters (see `README.md`).

## Architecture

Two halves wired through Doctrine entities:

**Client side — `Resources/public/js/tracker.js`** is a ~25 KB jQuery plugin (`UST` global) that batches mouse moves, clicks, keystrokes, and DOM snapshots, then POSTs them. URLs are injected by `Resources/views/Tracker/Front.html.twig` as JS globals (`URL_data`, `URL_client`, etc.) before the assetic-bundled `tracker.min.js` is loaded. The Twig service `Services/Tracker::build()` renders that fragment — host apps drop `{{ mousetrackerService.build() }}` just before `</body>`.

**Server side — `Controller/DefaultController.php`** exposes the four ingest endpoints the JS calls (routes are annotation-based, prefixed `/tracker` by the host):
- `POST /createClient` — upserts a `Client` and creates a `Page` row per visit
- `POST /addData` — appends a `Data` row (movements/clicks/partial DOM/cached records) to the current `Page`
- `POST /clearPartial`, `POST /addTag` — currently no-op stubs returning `{}`

**Backend UI — `Controller/BackController.php`** (route prefix `/back`) renders `Resources/views/Backend/index.html.twig` and exposes JSON endpoints (`/getPages`, `/getClients`, `/getData`) consumed by an in-bundle replay UI. `BackController::getClientsAction` currently hard-codes browser/ip/timeSpent fields — real values aren't captured yet.

**Entity graph:** `Client` 1—N `Page` 1—N `Data`. `Page.clientID` cascades on delete; `Data.partial` stores JSON-encoded DOM snapshots that the replay UI decodes per-row. `PageRepository::findDsitinct` (sic — typo is in the public API) returns distinct URLs.

**DI quirk:** `DependencyInjection/MouseTrackerExtension::load` mutates the host's `assetic.bundles` parameter to append `'TrackerBundle'` so assetic picks up the bundled JS — without this, `assetic:dump` won't process `tracker.js`.

## Gotchas

- The tracker JS hard-codes IP and User-Agent blocklists (Googlebot IPs, mobile UAs) in `UST.settings`. Changes to recording behavior usually live there, not server-side.
- `tracker.js` requires jQuery >= 1.8.1 to be loaded by the host page *before* `mousetrackerService.build()`.
- Two endpoints (`clearPartial`, `addTag`) are intentional stubs — the JS calls them but the server discards the payload.
- `addDataAction` has a known quirk: when `cachedRecords` is non-null it overwrites `partial` with `cachedRecords` *and* still calls `setCachedRecords`, so both columns get the same value. Treat this as load-bearing unless you've checked the replay UI.
- Repository method name `findDsitinct` is misspelled but referenced from `BackController` — rename in both places if you fix it.
