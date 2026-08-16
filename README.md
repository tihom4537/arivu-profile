# arivu-profile

The public librarian profile page — `https://arivumitra.org/librarians/{public_id}/{slug}`,
e.g. `/librarians/42/priya-sharma`.

Built to be shared: it opens in WhatsApp's in-app browser, needs no login, and shows no
phone numbers or internal IDs. Mobile-first; the desktop view is the same layout widened
(the activity feed goes from one column to three).

## How a URL resolves

`public_id` is the only lookup key. The slug is cosmetic — a stale or missing one
redirects to the canonical URL, so renaming a librarian never breaks a link that is
already out in the world.

Test accounts (`is_test`) and librarians who are not `onboarded` return 404. A public
URL must not confirm that an internal row exists.

## Data

One request to arivu-backend returns the whole page:

    GET {ARIVU_API_BASE}/public/api/librarians/{public_id}

Implemented in `arivu-backend/app/public/api_router.py`; every number is computed by the
pure functions in `arivu-backend/app/public/profile_stats.py` (tested in
`arivu-backend/tests/test_profile_stats.py`).

Worth knowing about the numbers:

- **Stars** use the Tuesday-anchored rule from `app/nudges/weekly_star.py` — the same
  one behind the librarian's weekly WhatsApp star message. The admin dashboard uses a
  different rule, so the two can disagree in months with five Tuesdays. That is
  deliberate: this page must never contradict what the librarian was already told.
- **People reached** is an estimate. `activity_report` stores a bucket
  (`lt10 | ten_twenty | twenty_thirty | gt30`), not a headcount, so the figure is a sum
  of bucket midpoints — see `FOOTFALL_MIDPOINTS`.
- **"Who is using the library?"** counts intentionally over-sum against people reached:
  an activity tagged Children + Women + Seniors credits its headcount to all three,
  because the form does not split the number by group.
- **Level** thresholds in `LEVELS` are placeholders pending a real ladder.

Photos are S3 presigned URLs with short-lived signatures, so pages are rendered per
request (`cache: 'no-store'`) and images skip the Next.js optimizer.

## Develop

    npm install
    npm run dev          # http://localhost:3000/librarians/{public_id}/{slug}

Point it at a running backend:

    ARIVU_API_BASE=http://localhost:8001 npm run dev

`basePath: '/librarians'` is set in `next.config.ts`, so route folders are `app/[id]/[slug]`
rather than `app/librarians/[id]/[slug]`, and dev URLs match production exactly.

## Deploy

`.github/workflows/deploy-profile.yml` builds to GHCR and restarts the `arivu-profile`
service in `deploy/chatbot-ec2/docker-compose.yml` on push to `main`.

The container is only reachable through nginx (`location /librarians/`), and it reaches
the profile API over the internal Docker network, so `/public/api` is never exposed.

**One-time step on first deploy:** apply the new `/librarians/` and `/librarian/` blocks
in `deploy/chatbot-ec2/nginx.conf` and reload nginx.

## Assets

`components/art.ts` uses emoji as stand-ins for the illustrated badge and audience icons
from the design mock. Drop the real assets in `public/icons/` and swap the map — nothing
else changes.
