# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security issue in `benmacha/mousetracker`, **please do not
open a public GitHub issue.** Reports involving the replay backend, the
ingest endpoints, or the JavaScript tracker can expose recorded visitor
data, so we want to coordinate a fix before the details are public.

### Private report (preferred)

Use GitHub's **Private Vulnerability Reporting** on this repository:

<https://github.com/BenMacha/mouseTracker/security/advisories/new>

### Email

If GitHub private reporting is unavailable, email **contact@benmacha.tn**
with:

- a description of the issue and its impact,
- the bundle version, PHP version, and Symfony version,
- steps to reproduce (or a minimal proof of concept),
- whether the issue has been disclosed elsewhere.

### What to expect

- Acknowledgement within **72 hours**.
- An initial assessment (accepted / declined / needs-info) within **7
  days**.
- For accepted issues, we aim to ship a patched release within **30 days**
  of the initial report, sooner for actively exploited vulnerabilities.
- You will be credited in the release notes and the GitHub advisory unless
  you request otherwise.

## Out of Scope

The bundle exposes two distinct surfaces with different threat models:

1. **Ingest endpoints** (`/tracker/createClient`, `/tracker/addData`,
   `/tracker/clearPartial`, `/tracker/addTag`) — these are intentionally
   public so the in-page tracker can POST from any visitor's browser.
   Behavior under high-volume or malicious traffic is the host
   application's responsibility (rate limiting, WAF, captchas, etc.).

2. **Backend / replay UI** (`/tracker/back/*`) — these are also public by
   default but are *meant* to be locked behind a firewall in the host's
   `security.yaml`. See the [README security
   notice](README.md#backend-replay-ui). A working install that exposes
   the backend to anonymous users is a misconfiguration of the host app,
   not a bundle vulnerability.

If you are unsure whether something falls in scope, file a private report
and we will triage it together.
