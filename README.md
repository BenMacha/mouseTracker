# MouseTrackerBundle

[![CI](https://github.com/BenMacha/mouseTracker/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/BenMacha/mouseTracker/actions/workflows/ci.yml)
[![Latest Stable Version](https://poser.pugx.org/benmacha/mousetracker/version)](https://packagist.org/packages/benmacha/mousetracker)
[![Total Downloads](https://poser.pugx.org/benmacha/mousetracker/downloads)](https://packagist.org/packages/benmacha/mousetracker)
[![License](https://poser.pugx.org/benmacha/mousetracker/license)](https://packagist.org/packages/benmacha/mousetracker)

Self-hosted mouse, click and scroll tracker for **Symfony 5.4 / 6.4 / 7.x**. Captures mousemoves, clicks, scroll positions, form-blur values and DOM snapshots, then ships them to your own database for Mouseflow-style heatmaps and session replay. **No jQuery.**

## Requirements

| Package        | Version            |
|----------------|--------------------|
| PHP            | `>=8.1`            |
| Symfony        | `^5.4 \| ^6.4 \| ^7.0` |
| Doctrine ORM   | `^2.14 \| ^3.0`    |

## Installation

```bash
composer require benmacha/mousetracker:^2.0
```

If you don't use Symfony Flex, register the bundle in `config/bundles.php`:

```php
return [
    // ...
    benmacha\mousetracker\TrackerBundle::class => ['all' => true],
];
```

### Routing

`config/routes/mouse_tracker.yaml`:

```yaml
mouse_tracker:
    resource: '@TrackerBundle/Resources/config/routes.yaml'
    prefix: /tracker
```

### Configuration (optional)

`config/packages/mouse_tracker.yaml`:

```yaml
mouse_tracker:
    record_click: true
    record_move: true
    record_keyboard: true
    percentage_recorded: 100
    disable_mobile: false
    ignore_ips: []
```

### Database

```bash
php bin/console doctrine:schema:update --force
# or, with migrations:
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

This creates three tables: `tracker__client`, `tracker__page`, `tracker__data`.

### Publish assets

```bash
php bin/console assets:install --symlink public/
```

Copies the tracker JavaScript to `public/bundles/tracker/js/tracker.js`.

## Usage

Inject the tracker snippet right before the closing `</body>` tag of any page you want to record:

```twig
{# templates/base.html.twig #}
        {{ mouse_tracker_service.build()|raw }}
    </body>
</html>
```

Expose the service as a Twig global in `config/packages/twig.yaml`:

```yaml
twig:
    globals:
        mouse_tracker_service: '@mouse_tracker'
```

That's it — the tracker boots on `DOMContentLoaded` and starts batching events to `/tracker/createClient` and `/tracker/addData`.

## Backend (replay UI)

The bundle ships a basic backend at `/tracker/back/` for listing sessions and replaying recordings. Lock this down behind your firewall config — by default the routes are public.

## Settings

Client-side settings are forwarded from PHP config into a `window.MouseTrackerConfig.settings` blob. You can also override them after the script loads via `UST.settings`:

```html
<script>
    window.UST && (UST.settings.delay = 100);
</script>
```

| Key                   | Default | Description                                              |
|-----------------------|---------|----------------------------------------------------------|
| `record_click`        | `true`  | Record left/right clicks                                 |
| `record_move`         | `true`  | Record mousemove heatmap data                            |
| `record_keyboard`     | `true`  | Capture input/textarea values on blur (never `password`) |
| `percentage_recorded` | `100`   | % of visitors to sample                                  |
| `disable_mobile`      | `false` | Skip recording on mobile UAs                             |
| `ignore_ips`          | `[]`    | IP allowlist via `l2.io/ip.js` (opt-in)                  |

## Upgrading from 1.x

v2 is a breaking rewrite. See [`CHANGELOG.md`](CHANGELOG.md) for the migration path. Highlights:

- Drops Symfony 2.8, Assetic, Sensio Framework Extra Bundle, jQuery
- Doctrine/route annotations replaced with PHP 8 attributes
- `services.yml` → `services.yaml`; new `routes.yaml` resource
- `mousetrackerService` global → `mouse_tracker_service`
- Tracker JS is now plain vanilla — no jQuery to load first

## License

MIT — see [`Resources/meta/LICENSE`](Resources/meta/LICENSE).
