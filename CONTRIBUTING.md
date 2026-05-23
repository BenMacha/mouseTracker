# Contributing

Thanks for your interest in improving `benmacha/mousetracker`. This bundle
is a small, focused tool — patches that keep it that way are very welcome.

## TL;DR

```bash
# 1. fork + clone, then:
composer install
npm install

# 2. work on a branch off master:
git checkout -b fix/short-description master

# 3. before you push, make sure all four pass locally:
vendor/bin/phpunit
npx vitest run
vendor/bin/phpstan analyse --no-progress --memory-limit=1G
vendor/bin/php-cs-fixer fix --dry-run --diff
```

Open a PR against `master`. The CI matrix (PHP 8.1/8.2/8.3/8.4 × Symfony
5.4/6.4/7.x) must stay green.

## Project layout

The bundle has two halves — see
[`CLAUDE.md`](CLAUDE.md) for the architecture overview. In short:

- **Client side**: `Resources/public/js/tracker.js` (vanilla JS, ~440 lines)
  and `Resources/views/Tracker/Front.html.twig` for the script tag.
- **Server side**: `Controller/DefaultController.php` (ingest endpoints),
  `Controller/BackController.php` (replay UI), `Entity/*`, `Repository/*`,
  `Services/Tracker.php`, `DependencyInjection/*` for config.

`tests/` mirrors the source tree. JS contract tests live in `tests/js/`
and run under [vitest](https://vitest.dev/) with `happy-dom`.

## What kind of changes are welcome

- **Bug fixes** in ingest behavior, the replay UI, or entity wiring.
- **Symfony / Doctrine / PHP version support** for the matrix listed in
  the README.
- **Test coverage** for currently-untested branches.
- **Documentation** improvements.
- **Performance**: the tracker JS budget is small; we want it to stay
  small.

What is **probably out of scope**:

- New big features in the replay UI — it is intentionally minimal.
- Adding heavyweight frontend dependencies (no React/Vue/jQuery).
- Changes that drop support for one of the matrix versions, unless paired
  with a major version bump and a strong justification.

If you are unsure, **open an issue first** to discuss before writing the
patch.

## Coding standards

- PHP 8.1+, `declare(strict_types=1);` at the top of every PHP file.
- Code style: `@PSR12` + `@Symfony` via PHP-CS-Fixer (see
  `.php-cs-fixer.dist.php`). Run `vendor/bin/php-cs-fixer fix` to format.
- Static analysis: PHPStan **level 8** must stay clean. Run
  `vendor/bin/phpstan analyse`.
- Type hints everywhere, including return types and properties.
- Public API methods (anything a host app might call) get PHPDoc.

## Tests

- **PHP**: `vendor/bin/phpunit`. Unit tests do **not** boot a kernel —
  they verify config trees, extension wiring, and entity behavior in
  isolation. The functional test (`tests/Functional/IngestEndpointsTest`)
  boots a minimal kernel against SQLite.
- **JS**: `npx vitest run`. The tests load `Resources/public/js/tracker.js`
  inside `happy-dom` and verify the tracker boot, the `canRecord` gating,
  the `coord4` round-trip, and the `createClient` POST contract.
- Add a test for any behavior change. Bug fixes should come with a
  failing-then-passing regression test.

## Commits and PRs

- Prefer **small, focused commits** with imperative subject lines:
  `Fix /tracker/addData 500 on empty cachedRecords`, not
  `Update controller`.
- Reference issues in the body when applicable.
- One logical change per PR. Refactors that are not strictly needed for
  the fix go in a separate PR.

## Security issues

**Do not open public issues for security problems.** See
[`SECURITY.md`](SECURITY.md) for the private disclosure process.

## Releasing (maintainers)

1. Make sure `CHANGELOG.md` has an entry dated today under the next
   version heading.
2. Tag: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`.
3. Packagist picks it up automatically via the GitHub webhook.
4. Create a GitHub release with the changelog excerpt as the body.

Thanks again — every patch helps.
