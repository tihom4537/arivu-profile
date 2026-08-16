# arivu-profile

The public library profile page — `/{state}/library/{gp-name}`,
e.g. `/KA/library/malve`.

Built to be shared: it opens in WhatsApp's in-app browser, needs no login, and shows no
phone numbers or internal IDs. Mobile-first; the desktop view is the same layout widened
(the activity feed goes from one column to three).

## How a URL resolves

The slug is the gram panchayat name in English, imported from the department's
librarian export. Lookup goes through the `slug` column rather than rebuilding it from
the name, and retired slugs live in `librarian_slug_history` and redirect to the
canonical URL — which matters because the import rewrote ~94 slugs in one pass and
links were already in circulation.

Slugs are ASCII: most librarian names and many GP names are Kannada, and a non-ASCII
slug has to be percent-encoded to travel in a URL, which is unreadable in a WhatsApp
link. A library with no usable English GP name falls back to `library-{public_id}`.

Test accounts (`is_test`) and librarians who are not `onboarded` return 404. A public
URL must not confirm that an internal row exists.

## Data

One request to arivu-backend returns the whole page:

    GET {ARIVU_API_BASE}/arivu/public/api/libraries/{slug}

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
    npm run dev          # http://localhost:3000/KA/library/{gp-name}

Point it at a running backend:

    ARIVU_API_BASE=http://localhost:8001 npm run dev

Route folders carry the whole URL shape (`app/[state]/library/[slug]`), so there is no
basePath and dev URLs match production exactly.

## Deploy

`.github/workflows/build.yml` builds the image to GHCR on push to `main`. It does not
deploy: the target host has under 1 GB of RAM and cannot run a Next.js production
build, so the image is built in CI and pulled on the server.

The container runs on the same box as arivu-backend, defined in
`deploy/chatbot-ec2/docker-compose.yml` of the main repo. Co-located on purpose: the
page fetches over the Docker network (`http://arivu-backend:8001`), so a render costs
a local hop rather than a TLS round trip to the public internet. It is memory-capped
at 256MB, because that box also runs the WhatsApp gateway on 911MB of RAM.

To ship a change:

    # after CI is green
    docker pull ghcr.io/tihom4537/arivu-profile-web:latest
    docker compose -f deploy/chatbot-ec2/docker-compose.yml up -d --no-deps arivu-profile-web

Note `/opt/arivu` on the server is a hand-maintained directory, not a git checkout —
compose changes have to be copied up.

## Design

Built from the design source in `Librarian Profile page/` (index.html + styles.css).
Tokens in `tailwind.config.ts` are named after the CSS custom properties they came
from, so the two can be diffed: `ink` = `--text-dark`, `line` = `--border`, and so on.

The column is a fixed 412px as designed; wider viewports keep that column and only the
activity feed widens, to three across.

Badge artwork is a shield SVG with a portrait laid over it. The overlay insets in
`components/BadgeList.tsx` are the percentages from the design's `.women-icon` /
`.elder-icon` / `.child-icon` rules — they are what make each face sit correctly, so
don't round them.

Inter is self-hosted via `next/font`, so the page makes no external request at runtime.
All 40 icons are served from `public/icons/`.
