# Contractor Data Ownership & Repo Hosting — Vision

> Where a contractor's data lives, how Hire interfaces with it, and the guiding principle that the
> whole thing must stay **dead simple for the contractor**. We learn from Bluesky / AT Protocol, but
> we never push its complexity onto contractors. We want: **sign up → import reviews → done.**

---

## 1. The north star (product principle)

The measure of success is a contractor experience like this:

1. **Sign up** (email / Google — one tap).
2. **Import their reviews** (from other platforms, or as text), optionally tagged with where they came from.
3. **Done.** Their profile + reviews are theirs, portable, and easy to take anywhere later.

All the decentralized "portable repo / DID / PDS" machinery is an **internal design goal that we
evolve into over time** — it must never be something the contractor has to understand, configure, or
care about. If at any point we'd need a contractor to make an "architecture choice" to use the
product, we've lost the plot.

---

## 2. Where the contractor's repo "lives" (the AT-Protocol end-state)

In the full atproto vision, a contractor's repo lives on a **PDS** (Personal Data Server). It can be:

1. **A PDS we (FreeSurf/Hire) run** — the likely default. Like Bluesky runs the `bsky.social` PDS for
   its own users. Simplest for contractors: they get a repo automatically, no decisions needed.
2. **A third-party PDS** the contractor chose.
3. **Self-hosted on their own domain** (`did:web`) — advanced, only for power users, not the default.

**Key mechanism — resolution, not hardcoding:** the repo's *location* is declared in the contractor's
DID document (`#atproto_pds`). To talk to a contractor's data, a service **resolves** handle/DID →
reads the DID doc → finds the *current* PDS → reads records over public XRPC. So the repo could be on
our PDS, their host, or elsewhere — and the contractor can **move hosts without anything breaking**,
because consumers re-resolve.

This indirection is exactly what makes "portable" real rather than our own hosted silo.

---

## 3. How a marketplace interfaces with the repo

- Hire does **not** need to *host* the records to use them. It reads them, **verifies** them
  (content-addressed + signed), and keeps its **own index/mirror** (its own DB) so queries are fast
  and so it can attach moderation **labels / attestation tiers**.
- So the split is:
  - **Repo on the PDS** = source of truth, owned by the contractor.
  - **Hire's index/DB** = fast, labeled, moderated view.
- Staying current = poll repos or subscribe to the firehose.

Because labels/attestations attach to Hire's *index view* (not to the records themselves), a contractor
can carry clean records to another marketplace that does its own labeling. Hire's "right to review the
ids contractors create / label them" is a **view-layer** power, not ownership of the data.

---

## 4. The staged approach (so we don't over-build early)

**Stage 1 — Today (no atproto yet):**
- Contractor profiles/reviews live in **Hire's Supabase DB**, keyed by a FreeSurf handle/email.
- Schema is kept **portable-friendly** so it can be published to atproto later without a rewrite.
- Store provenance fields + an **attestation tier** per review from the start (see CONCEPT_SUMMARY).

**Stage 2 — AT milestone (publish):**
- When a contractor "goes portable," we stand up a repo for them on **our own PDS** by default and
  publish their records there.
- Hire becomes one *reader/labeler* of those records — replaceable by any other marketplace.
- To the contractor, nothing visibly changes: still sign up / import / done.

**Stage 3 — Maturity (robust ecosystem):**
- Support BYO / self-hosted PDS for advanced users.
- The AT-Protocol theory weaved in fully: portable identity, verifiable records, open aggregation.

We deliberately **defer** the hosting complexity until there's real value in it (volume, churn,
multi-marketplace). See "don't over-build" rule in CONCEPT_SUMMARY.

---

## 5. Open decision: our own PDS by default, vs BYO

The fork that decides how much "portable" is real:

- **Run our own PDS for contractors by default (Bluesky-style).** Best UX, one default, we control
  onboarding. Risk: it can quietly become a walled garden "with extra steps" if we never support
  migration out. Mitigation: make repo **export** and **DID move** first-class from the start.
- **BYO / self-host first.** More genuinely decentralized, but forces choices on contractors — bad for
  simplicity.

**Working stance:** default to our own PDS (Stage 2), but design the export/migration path *now* so
"portable" is a real property and not just branding.

---

## 6. What we take from Bluesky / AT Protocol (and what we simplify)

We adopt the *mental model*:
- Identity is separate from any one marketplace.
- Data is signed, portable, and outlives any platform.
- "Reach" (marketplace discovery) is separable from "speech" (the contractor's owned data).
- A marketplace's value is curation/trust, not data hostage.

We deliberately **simplify** for the contractor:
- No DIDs, handles, PDS, or repos that the contractor must know about.
- Import is plain and human: reviews come in labeled by source, verified cheaply, and tagged with an
  attestation tier — hidden/unpublished until Hire's own (cheap) validation is happy.
- All of that complexity is **our job**, never theirs.

---

## Summary

- **Repo lives on a PDS** — by default our own, later optionally theirs or third-party — and consumers
  resolve it via the DID doc rather than hardcoding a host.
- **Hire = a reader/labeler/index** over public, verifiable records; labels live in our view, not the
  contractor's records.
- **Near-term:** data in our DB, kept portable-shaped. **Later:** publish to a PDS we run.
- **Always:** sign up → import reviews → done. Simplicity for the contractor is the non-negotiable.
