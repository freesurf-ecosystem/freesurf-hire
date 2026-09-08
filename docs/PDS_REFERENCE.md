# PDS — Reference Guide (Personal Data Server)

> A working reference for the Hire team on what a PDS is, where it sits in the AT Protocol, what it
> costs to run one, and whether we can leverage existing infrastructure instead of running our own.
>
> Status: **learning / architecture reference** (not a build plan). Figures & strategy are "as of"
> the writing date and should be re-verified against the live atproto docs before any commitment —
> Bluesky's hosting guidance has shifted over time.

---

## 1. What a PDS is (and the layer it lives in)

**PDS = Personal Data Server.** It is the server that **hosts a user's data repo** (their records:
posts, profiles, reviews) and manages their identity/key material. It is the **data-custody layer** of
AT Protocol.

There is **no single shared PDS.** Each PDS hosts a set of users, and many PDSes can exist. Your data
lives on *your* PDS; the account's *current* PDS is declared in the user's **DID document**
(`#atproto_pds`), which is how other servers find you without hardcoding a host.

### The full stack, at a glance (so PDS isn't confused with the rest)

| Layer | Role | Who runs it |
|---|---|---|
| **DID** (`did:plc` / `did:web`) | Permanent, portable identity | `plc.directory` for plc; your domain for web |
| **PDS** | Holds one account's repo + keys (custody) | Many possible hosts (see §3) |
| **Relay** | Subscribes to *many* PDS streams → one firehose | Bluesky + independent relays |
| **AppView** | Reads firehose → app feeds/index/search | Bluesky + independent appviews |

Analogy:
- **PDS** ≈ your email server (where your mail lives).
- **Relay** ≈ a search engine that crawls the whole web.
- **AppView** ≈ the app that renders results.

The community/ecosystem is sometimes called the **"Atmosphere"** (the "verse" of atproto apps). It is
*not* one PDS — it's many PDSes made to look connected by the shared Relay/AppView aggregation layer.

---

## 2. The key mental model: custody vs. aggregation

Two layers are easy to conflate:

1. **Custody (PDS)** — *decentralized*, per user-server. One account's repo is on one PDS.
2. **Aggregation/indexing (Relay + AppView)** — *this is where sharing happens*. A Relay ingests many
   PDSes into one stream; an AppView builds the app experience.

So when people say "the network is kind of centralized," they usually mean **Bluesky PBC operates the
biggest PDS and the main Relay/AppView today** — not that the protocol requires it. Architecture allows
anyone to run each layer.

---

## 3. Hosting models — who runs the PDS

A PDS for a given user can be run by:

1. **A service operator** (e.g., Bluesky runs the `bsky.social` PDS for its users). *Default for most
   users today.*
2. **The individual** self-hosting their own PDS (power users / enthusiasts).
3. **An organization** running a PDS for *its* users (what Hire would do if we host contractor repos).

All interoperate: a user's repo can sit on any PDS, and consumers find it by resolving the DID.

---

## 4. Can the "Atmosphere" share one PDS? (short answer)

**No.** Data custody is not a single shared resource. It's federated across PDSes. The thing that is
*shared* is the aggregation layer (Relay/AppView), not custody. If Hire gives a contractor a repo, that
repo lives on *a* PDS (ours by default, per CONTRACTOR_REPO_AND_PDS.md) — it does not go into one
planet-wide database.

---

## 5. Cost & effort of running our own PDS

**Honest framing:** running *a* PDS for a modest number of users is **not** inherently expensive in raw
compute — the reference PDS is designed to run on ordinary server hardware, and home/self-hosted use was
an original design goal. The real costs are **operational**, not just the bill:

- **Infra:** a VPS with enough CPU/RAM/storage/bandwidth for the repo size and activity. Small scale =
  modest. Scale = grows with storage + bandwidth of blobs/media.
- **Backups & durability:** repos must be backed up reliably (they're the user's data).
- **Identity & key management:** holding signing/rotation keys, PLC operations, handle/DNS management.
- **Email verification** for account lifecycle.
- **Moderation / takedown tooling** (abuse, illegal content) if you host public records.
- **Maintenance:** patching, uptime, incident response.
- **Portability obligations:** export / migration support so users can leave (see CONTRACTOR_REPO_AND_PDS).

**Important caveat — strategy has shifted:** Bluesky has moved away from pushing "run your own PDS" as
the community vision, toward **account portability** where users are hosted on services but can migrate
(using OAuth/DID rotation). Self-hosting a PDS is now more of an "experts/power-users" path than a
supported mainstream offering. So "we'll just run a PDS" should be validated against current docs and
tooling maturity before we rely on it — treat §5 as direction, not settled fact.

**Rule of thumb:** running a small PDS for our own early users is plausibly fine on modest infra, but the
*ongoing ops burden* (backups, moderation, keys, email, updates) is the real cost. We should not run one
until the AT milestone actually needs it.

---

## 6. Can we "piggyback" on Bluesky's infrastructure?

This is the important one, and the answer is mostly **no — but with useful nuances.**

- **You generally cannot "tenant into" Bluesky's `bsky.social` PDS.** It hosts Bluesky users' repos; it
  is not a B2B service where we attach a custom marketplace/review namespace for our own contractors.
- **However**, you often don't need to *host* a PDS at all:
  - If Hire is mainly a **reader/indexer/labeler** (a marketplace), it can consume the public network
    through a **Relay / firehose** or the public **AppView API** without hosting anyone's repo.
  - A PDS is only required if you must **host records** (give contractors repos you manage, or write
    records into the network).

So the realistic options for a marketplace like Hire:

| Option | You run | When it makes sense |
|---|---|---|
| **Reader/AppView only** | No PDS | Early: we just *read/label* records; contractors use their own PDS/accounts elsewhere |
| **Self-hosted PDS** | Yes (one or more) | We want to issue/own contractor repos under our namespace (AT milestone) |
| **Third-party / hosted PDS provider** | No | Use someone else's PDS hosting for our users (less mature SaaS market — verify availability) |

**Net takeaway:** for most of Hire's early life we **do not need to run a PDS**. We only need to think
seriously about it at the AT milestone, when we decide whether to (a) be a reader/labeler only, (b) host
contractor repos ourselves, or (c) rely on a hosted provider. "Piggyback on Bluesky" mainly works in the
sense of reading their public Relay/AppView — not hosting our repos on their PDS.

---

## 7. Recommendation for Hire

- **Don't run a PDS now.** Keep data in Supabase, shaped portable (Stage 1).
- At the AT milestone, **start as a reader/AppView** over the public network rather than a repo hoster —
  lowest cost, validates the "reviews are portable & open" thesis without ops burden.
- Only if that proves out do we **self-host one PDS for our users** (modest infra), and design export +
  migration as first-class so it isn't a walled garden.
- **Re-verify** current PDS tooling, hosted-provider availability, and Bluesky's hosting guidance before
  committing — strategy here is actively evolving.

---

## 8. Sources & further reading

- AT Protocol overview & identity/portability: https://atproto.com/guides/overview
- The AT Stack (PDS / Relay / AppView roles): https://atproto.com/guides/the-at-stack
- DID spec (did:plc / did:web): https://atproto.com/specs/did
- Account migration guide: https://atproto.com/guides/account-migration
- Repository spec (repo, MST, CAR): https://atproto.com/specs/repository

> **Currency caveat:** PDS self-hosting guidance, hosted-provider options, and Bluesky's operational
> strategy have shifted over time. Treat §5–§7 as direction; confirm specifics against current
> atproto/Bluesky docs before building on them.
