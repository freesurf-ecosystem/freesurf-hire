# AT Protocol — Learning Guide (mapped to FreeSurf Hire)

> A technical introduction to the AT Protocol (the decentralized protocol behind Bluesky), written
> as a learning doc for the Hire team. It explains *why* "portable contractor reviews" is exactly the
> kind of thing atproto was designed for, then walks through the real mechanisms (DIDs, PDS, repos,
> records, Lexicons, federation) and maps them onto Hire's `app.freesurf.review` ambition.
>
> Status: **learning / research doc** — not a build plan. MVP does NOT use atproto yet (see
> CONCEPT_SUMMARY: defer `did:plc:`/PDS until the AT milestone; keep the data layer clean so we can
> publish later without a rewrite).

---

## 1. The one-paragraph idea

The AT Protocol separates **identity** from **hosting** and treats your data as a set of
**signed, portable records** living in a **repo you control**, reachable by any compliant app.

That means "let contractors take their reviews with them" is **not** a one-way export feature you
bolt on — it's the *default architecture*. A review is a normal record in a portable repo, keyed to
a portable identity (DID), readable over public HTTP, and aggregatable by any service. If you
"create an API so contractors can port their reviews," you are essentially rebuilding, in miniature,
what atproto already gives you structurally.

The value prop you feel intuitively is real and has a name in atproto terms:

- **Speech (the data layer)** is portable and permissive.
- **Reach (the discovery/aggregation layer)** is a separate, indexable concern.

Bluesky built this for social posts. Hire wants it for contractor reviews. Same shape, different record.

---

## 2. Core building blocks

### 2.1 Identity: DIDs (the durable identifier)
A DID is the **permanent, immutable account identifier**. Two DID methods are "blessed" in atproto:

- **`did:plc`** — created for atproto. Identifier is derived from a **genesis operation**; control
  sits in **rotation keys** (you hold them, e.g. a paper key), so you can change hosting/keys later
  **without the old host's cooperation**. A central directory (`plc.directory`) stores the signed
  operation log and serves the current identity view. The directory's trust is *limited*: it cannot
  change an identity without a signed operation.
- **`did:web`** — the DID doc is just published at `https://<your-domain>/.well-known/did.json`.
  *You* control it via your domain. **No rotation-key / recovery mechanism** if you lose the domain.

A DID resolves to a **DID document** containing:
- the **claimed handle** (`alsoKnownAs`),
- the **atproto signing key** (`verificationMethod`, `#atproto`),
- the **PDS endpoint** (`service`, `#atproto_pds`).

> For Hire: `did:plc:` is the right long-term default (migratable, recoverable). `did:web` is the
> path for true self-hosting of an identity under a domain you own, at the cost of migration ability.

### 2.2 Handles (the human-friendly name, DNS-backed)
Handles are **mutable hostnames**, e.g. `youraccount.bsky.social` or (Hire's idea) `name.freesurf.tools`.
They are NOT the durable identifier — DIDs are. Handle→DID resolution must be **bidirectional**
(handle resolves to DID, and the DID doc must claim the handle back), or anyone could alias someone
else's account.

Two resolution mechanisms:
1. **DNS TXT** (per-individual): TXT record on `_atproto.<handle>` = `did=did:plc:...`.
2. **HTTPS well-known** (for large platforms): `GET https://<handle>/.well-known/atproto-did` returns
   the bare DID. (If the two disagree, DNS TXT wins.)

Clients usually just call `com.atproto.identity.resolveHandle`.

### 2.3 PDS (Personal Data Server)
"Your home in the cloud." The server that hosts a user's repo and handles account lifecycle,
identity resolution, secret-key management (the signing key + PLC rotation key), and repo event
streams. The **authoritative location of an account's repo is its current PDS**, declared in the DID doc.

### 2.4 Repos, records, and the MST (how data is stored)
Each account has **one repo** holding all its **public** data as **records**. Conceptually it's a map
of `repo path (collection/rkey) → record`, stored in a **Merkle Search Tree (MST)**:

- Content-addressed: every node is DAG-CBOR referenced by CID; changing any node cascades CID changes
  to the root.
- Each mutation issues a **new signed commit**: a signature over the **root CID**, with a `rev`
  (monotonic TID), `prev`, and `sig`. So the whole repo is **self-authenticating** — anyone can verify
  it against the public key in the DID doc **without trusting the host**.

> The MST *descends* from CRDT research (Auvolat & Taïani, SRDS 2019), **but** the running repo is a
> single-writer, last-writer-wins signed log hosted on one PDS — **not** an auto-merging CRDT. Don't
> assume conflict-free convergent merging between independently-edited copies.

Repos export as **CAR v1** files (content-addressed archive) — used for sync, backup, and **migration**.

### 2.5 Blobs (large media)
Big files (images/video) are uploaded separately (`com.atproto.repo.uploadBlob`), referenced by CID
from records, **not** stored inside the repo.

### 2.6 Records, the `at://` URI, Lexicon, and NSIDs
- **Record** = an instance of a typed schema, stored at `collection/rkey` in the repo.
- **`at://` URI**: `at://<handle-or-DID>/<collection-nsid>/<rkey>`. It is **not** a network location
  and **not** content-addressed — pair with a CID for strong references; prefer DID form for durable links.
- **Lexicon** = atproto's schema language (JSON). Defines `record`, `query` (GET), `procedure` (POST),
  `subscription` types, plus field types and `format` constraints.
- **NSID** = namespaced identifier naming a Lexicon type, e.g. `app.bsky.feed.post`,
  `com.atproto.repo.createRecord`, or Hire's planned `app.freesurf.review`. Reverse-DNS-ish; authority
  is a domain you control.

---

## 3. Federation & how the network stays reachable

Two layers (and note: **a relay is not required by the spec**):

- **Federation of custody**: many independent PDSes each authoritatively host their users' repos;
  repos are portable + verifiable; servers interoperate over HTTP/WebSocket.
- **Relay / firehose aggregation** (for scale): PDSes push their repo event streams to Relays, which
  merge them into one **firehose** — `com.atproto.sync.subscribeRepos` over WebSocket
  (e.g. `wss://bsky.network/...`). Relays **do not interpret records**; they store + forward.
- **AppView**: a semantically-aware layer downstream of a relay that interprets records under specific
  Lexicons (timelines, feeds, aggregated metrics, search). Bluesky's own AppView understands `app.bsky.*`.
  For a custom Lexicon you'd run (or reuse) an AppView that understands it.

> Hire takeaway: you don't need to build your own peer-to-peer crawler or host everyone's data. To
> aggregate `app.freesurf.review` records network-wide you either (a) pull from known reviewers' PDSes,
> or (b) subscribe to a relay firehose and index the collection you care about.

**Auth model (brief):** primary client/server auth is now **OAuth** (atproto OAuth on OAuth 2.1/DPoP).
A **legacy JWT session** scheme (`com.atproto.server.createSession`) still exists but is labeled
unstable / being superseded — don't build new things on the legacy JWT details. Third-party apps use
**App Passwords**.

---

## 4. Why "port reviews" works (the mechanism, concretely)

1. **Records are already open + signed.** No "export on request" — any compliant client can read public
   records over XRPC; any relay/AppView can index them.
2. **Identity outlives any host.** Your `did:plc` is yours regardless of which PDS hosts it. A
   reviewer's history is addressable by DID even after moving providers or changing handles.
3. **Moving PDSes doesn't break anything.** Export repo as CAR → import to a new PDS → update the DID
   doc (and usually rotate signing key + PLC rotation key) → done. Because the repo is self-authenticating,
   you don't need the old platform's blessing.
4. **Data is app-agnostic.** Records carry machine-readable Lexicons, not rendering code — any app
   that understands the Lexicon can display or aggregate them.
5. **Lock-in is inverted.** Platform disappearance doesn't delete the records; they stay in users' repos,
   resolvable and aggregatable by anyone.

**Candid limitations (be explicit in your mental model):**
- **Public by default.** Repo records are for *public* data. Private/preferences live PDS-side. Don't
  design "private reviews" around portable repo records without a separate story.
- **did:plc depends on a directory** (limited-trust, operation storage only); **did:web depends on domain
  control** and has no recovery path.
- **Hosting status is not self-certifying** — account takedown/deletion is hop-by-hop trust.
- **Schema governance is centralized-by-domain.** Lexicon authority = DNS control of the NSID's domain.
  Forking to a new namespace is the escape hatch for disputes.
- **Not a CRDT.** Single-writer LWW per record path (see §2.4).

---

## 5. Practical API surface (XRPC)

Prefix: `/xrpc/<nsid>`. `query` = GET, `procedure` = POST. Public reads are unauthenticated.

| Purpose | Lexicon | Verb |
|---|---|---|
| Create a record | `com.atproto.repo.createRecord` | POST → `{uri, cid}` |
| Get one record | `com.atproto.repo.getRecord` | GET |
| Create-or-replace (singletons, rkey `self`) | `com.atproto.repo.putRecord` | POST |
| List records in a collection | `com.atproto.repo.listRecords` | GET (cursor paginated) |
| Delete a record | `com.atproto.repo.deleteRecord` | POST |
| Upload a blob | `com.atproto.repo.uploadBlob` | POST |
| Handle → DID | `com.atproto.identity.resolveHandle` | GET |

**Read-after-write caveat:** AppViews are **eventually consistent** (they index from the firehose
async). A just-created record may not appear in an AppView yet. The reference PDS smooths this for the
requesting user's own records; otherwise, read your write via the returned `uri`/`cid`.

---

## 6. End-to-end: a portable "Review" record (Hire-flavored)

This mirrors exactly how Bluesky publishes its own schemas. We design `app.freesurf.review`.

### 6.1 Lexicon schema
```json
{
  "lexicon": 1,
  "id": "app.freesurf.review",
  "description": "A contractor review (portable, user-owned).",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["contractor", "rating", "createdAt"],
        "properties": {
          "contractor": { "type": "string", "format": "at-identifier", "description": "did:plc of the contractor" },
          "rating": { "type": "integer", "minimum": 1, "maximum": 5 },
          "body": { "type": "string", "maxGraphemes": 2000 },
          "createdAt": { "type": "string", "format": "datetime" }
        }
      }
    }
  }
}
```
Notes: records must carry `$type: app.freesurf.review`; datetimes need a timezone + `Z`; integers aren't floats.

### 6.2 Publish a review
```
POST https://<pds>/xrpc/com.atproto.repo.createRecord
{
  "repo": "did:plc:<clientDID>",
  "collection": "app.freesurf.review",
  "record": {
    "$type": "app.freesurf.review",
    "contractor": "did:plc:<contractorDID>",
    "rating": 5,
    "body": "Fast, clean work; great communicator.",
    "createdAt": "2026-09-06T12:00:00.000Z"
  }
}
```
→ returns `{uri: "at://did:plc:<clientDID>/app.freesurf.review/<rkey>", cid: "..."}`.

### 6.3 Read / aggregate
- **Own reads:** `getRecord` / `listRecords` against the author's PDS.
- **Third-party reach without knowing the PDS host:** resolve handle → DID (`resolveHandle`) → resolve
  DID doc → find `#atproto_pds` → `getRecord`. Full chain: handle → DID → PDS → record.
- **Network-wide aggregation:** subscribe to a relay firehose, filter commits touching
  `app.freesurf.review`, verify, index by `(did, collection, rkey)` + CID. Survives reviewers moving PDSes.

### 6.4 Where the schema lives (optional discoverability)
Publish the schema as a `com.atproto.lexicon.schema` record (record key = the NSID) in the repo of the
DID owning the `freesurf.tools` authority, and add a DNS TXT on `_lexicon.freesurf.tools`. Many devs
skip this and just ship the Lexicon JSON in their SDK — publishing only makes it globally resolvable.

---

## 7. Mapping to FreeSurf Hire (how *we* would fit in)

| atproto concept | What it means for Hire |
|---|---|
| DID (`did:plc`) | Each contractor's durable identity (`@name.freesurf.tools` handle is the *nice* name, DID is the source of truth) |
| Handle | `name.freesurf.tools` — the DNS-backed, human-friendly form |
| PDS | Where a contractor's repo (incl. their reviews) is hosted; not necessarily us |
| Repo / records / MST | The contractor's reviews as signed, portable records — user-owned, not "in our DB" |
| Lexicon `app.freesurf.review` | Our schema for what a "review" record is — the thing other apps can understand & render |
| Relay / firehose / AppView | How the wider ecosystem discovers & indexes reviews without us crawling everyone peer-to-peer |
| "Port reviews via an API" | In atproto terms this collapses to: publish a `Review` record + make records resolvable/aggregatable — no bespoke export/import needed |

**Today's seam (MVP):** store profiles keyed by a FreeSurf handle/email in our own DB, shaped so that
the public-profile data can later be **published to atproto** (as the `app.freesurf.review` + a profile
record) without a rewrite. Defer real `did:plc:`/PDS until the AT milestone. Don't fight Links over the
same `freesurf.tools/[username]` path — Hire is the future owner of the public profile record.

---

## 8. If you want to actually play with it (learning exercises)

1. **Publish a custom record** on the reference PDS / public API with the SDK (`client.create()`) and
   read it back — confirms create/get/list + read-after-write behavior.
2. **Resolve an identity:** `com.atproto.identity.resolveHandle` on a known handle → DID → DID doc → PDS.
3. **Read the firehose:** connect to `wss://bsky.network/xrpc/com.atproto.sync.subscribeRepos` (or use
   **Jetstream**, which re-emits plain-JSON events) and watch `#commit` events.
4. **Migrate a repo** between two PDSes in a sandbox (CAR export/import + DID doc update) to feel the
   portability guarantee first-hand.
5. **Define `app.freesurf.review`** and `createRecord` it against a throwaway DID — no permissions needed.

---

## 9. Glossary (quick)

- **DID** — decentralized identifier; permanent account identity (`did:plc`, `did:web`).
- **Handle** — mutable, DNS-backed human name; not durable.
- **PDS** — server hosting a user's repo + identity/secret management.
- **Repo** — one MST per account holding its public records.
- **MST** — Merkle Search Tree; content-addressed key/value store backing the repo.
- **Record** — a typed datum at `collection/rkey`.
- **CID** — content address (hash) of a block/record.
- **Commit** — signed snapshot of the repo root; self-authenticating.
- **CAR** — file format for exporting/syncing repos.
- **Lexicon / NSID** — schema language + namespaced type name.
- **XRPC** — the HTTP RPC layer (`/xrpc/<nsid>`).
- **Relay / firehose** — aggregator of repo event streams; optional for scale.
- **AppView** — semantic index/API downstream of a relay.
- **Blob** — large media referenced by CID, stored outside the repo.

## 10. Further reading (primary sources)

- Protocol Overview — identity/portability & "speech vs reach": https://atproto.com/guides/overview
- The AT Stack (PDS/Relay/AppView roles): https://atproto.com/guides/the-at-stack
- Data Repositories guide: https://atproto.com/guides/data-repos
- Repository spec (MST, commits, CAR, diffs): https://atproto.com/specs/repository
- DID spec: https://atproto.com/specs/did  ·  did:plc: https://github.com/did-method-plc/did-method-plc
- Handle spec: https://atproto.com/specs/handle  ·  Lexicon spec: https://atproto.com/specs/lexicon
- AT URI spec: https://atproto.com/specs/at-uri-scheme  ·  Record Key spec: https://atproto.com/specs/record-key
- XRPC spec: https://atproto.com/specs/xrpc  ·  Auth guide: https://atproto.com/guides/auth
- Sync / streaming (firehose, Jetstream): https://atproto.com/guides/sync · https://atproto.com/guides/streaming-data
- Reading/Writing data: https://atproto.com/guides/reading-data · https://atproto.com/guides/writing-data

> **Currency caveat:** atproto specs are evolving (OAuth becoming primary, "Tap" sync service, repo format
> v3, emerging 2026 revisions). For anything you build on later, re-verify against the current spec/docs.
