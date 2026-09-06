# FreeSurf Hire — Concept Summary

> North star: a **free, open-source contractor hiring hub** built on the **AT Protocol**, so a
> contractor's reputation (reviews) is **portable and user-owned** rather than trapped on a
> platform. Longer-term it becomes an open-source, skills-focused social network.

## Why

- Most marketplaces (TaskRabbit, Thumbtack, Fiverr, Upwork) keep reputation inside a closed,
  payment-first platform because that lock-in is profitable.
- A healthier model: give professionals **ownership of their own profile and reviews**, make the
  underlying data portable, and run on free, open-source tools with **no subscription necessary**.

## Vision

1. **Contractor hiring hub** — a free, accessible alternative to TaskRabbit / Thumbtack / Fiverr /
   Upwork.
2. **Later: social layer** — an open-source, skill-focused alternative to LinkedIn.
3. Built as one product in the FreeSurf ecosystem ("free tools, no subscription necessary").

## The public profile is the core object (and the future owner is Hire)

- A user's **profile** should be **flexible** — it can be a **hiring/service profile** (services,
  reviews, availability) or a **link-in-bio page** (for creators: YouTube, portfolio, booking,
  contact). Same object, different emphasis.
- **Hire is the future owner of the public profile.** When someone builds a link-in-bio page (today
  in the Links repo), they are effectively creating a profile in the Hire repo.
- This resolves the current **enmeshment** between the Links and Hire repos (both producing
  `freesurf.tools/[username]`): over time the public profile record should live in Hire, and Links
  should point to it. Near-term we need a clean seam so the two don't fight over the same path/data.

## AT Protocol (the differentiator + the hard part)

- Make **reviews a portable, user-owned record** on the AT Protocol:
  - a `did:plc:` identity / handle (e.g. `@name.freesurf.tools`),
  - a PDS repo where records live,
  - a lexicon (e.g. `app.freesurf.review`) + an app-view/feed to read them.
- Reviews can then move with the contractor across any atproto app.
- This is a **research/design milestone**, not a bolt-on. Plan: build the product with a clean data
  layer now, structured so it can be **published to atproto later** without a rewrite.

**Traditional "port reviews" API**
- The reviews live in our database.
- We are the gatekeeper. We build an API and, at our discretion, let a contractor export their data to another marketplace.
- The contractor has no direct power — they're relying on our goodwill and the other marketplace cooperating with us. Control sits with us.
**atproto repos**
- The reviews live in the contractor's own repo on a PDS. Custody is separated from any single marketplace.
- The contractor holds the identity and the keys.
- Another marketplace doesn't need to ask us for anything — it reads the public records directly over the network.
- The contractor can move their repo to a different host, change their handle, or get indexed by someone else — without our permission and without our cooperation.

**tagging reviews**
Instead, tag each review with where it came from and what's been verified. Something like an attestation tier:
Tier 1 — contractor-claimed / unverified: contractor imported or typed it in; no independent check yet. Treated as their claim about themselves.
Tier 2 — cross-checked: we found corroborating signal (matches a public profile, reviewer reachable, date/name consistent). Partially credible.
Tier 3 — peer-attested / engagement-verified: tied to a real job that happened on-platform, or the reviewer is a real verified account. Highest trust.

**Moderation / labels** 
So your instinct — "hide if tampering suspected until the contractor fills the gap" — is a reasonable moderation policy. Pair it with the tier labels so it's a policy, not an accusation.

## MVP (barebones — current focus)

- People **create a profile**.
- Add: **phone number**, **website(s)**, **Google listing** (public Google Maps / Business URL).
- No payments, no booking, no reviews yet (reviews belong to the AT-protocol milestone).
- Minimal, public-information-only posture: "don't carry anything that isn't basically already
  public" (see DEVELOPMENT_ROADMAP / privacy).

## Privacy stance

- Only store what is already effectively public (profiles/reviews are meant to be public and
  portable). Keep this in mind for design and store disclosures.

## Open decisions / next steps

- Exact public-profile URL seam between Links and Hire for the MVP.
- Identity: defer real `did:plc:` + PDS handles until the AT-protocol milestone (store profiles in
  our DB keyed by a FreeSurf handle/email first).
- Confirm whether the Google listing is just a public URL field for the MVP.
- Fill this doc out so agents can quickly understand the mission (in progress).

*written, discussed w/ ai, human concepts*