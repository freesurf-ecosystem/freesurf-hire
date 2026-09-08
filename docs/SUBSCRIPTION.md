# FreeSurf Subscriptions — Setup Reference (per-app)

> Monetization model: **per-app subscriptions**, not a cross-app subscription. Each FreeSurf app has its
> own RevenueCat app entry, its own store products, and its own entitlement. A user pays to unlock more
> of *that* tool (e.g., more transcriber minutes), not a shared plan across all tools.
>
> Free tiers use **anonymous, server-side usage metering** (see each app's `*-metering.sql` / worker).
> Subscriptions let a user go past the free cap on a given device/app.

---

## Guiding principles

- **Per-app, not cross-app.** One RevenueCat app per FreeSurf tool. No cross-app entitlement sharing for now.
- **Anonymous-first.** Users don't need an account. Tie the subscription to the app's **stable anonymous
  device id** (RevenueCat supports anonymous customers). Later, if accounts are added, link entitlement to
  the account then.
- **Free + generous.** Keep the free tier meaningful; a subscription removes/raises the cap (see usage
  metering docs).
- **Unlock feature:** the paywall offers more usage/tier of that app; the worker enforces the cap server-side.

---

## Phase 1 — Build the shell (before any store submission)

1. In **RevenueCat**, create an app entry for iOS and Android (per FreeSurf tool).
2. Copy the **RevenueCat public SDK keys** into the app's env/config.
3. In RevenueCat create:
   - entitlement: `pro`
   - offering: `default`
4. In Apple/Google, create the **subscription products** with the exact product IDs you want
   (e.g. `freesurf_tools_transcriber_monthly` — namespace per app).
5. In RevenueCat, add those store products and attach them to the `default` offering and `pro` entitlement.
6. Implement these flows in the app:
   - fetch offerings
   - show package/product
   - purchase
   - restore purchases
   - check entitlement state
7. Treat the paywall as **"shell architecture"** until store products are usable — real code, but catalog
   and store verification still being proven.

> Result: RevenueCat is structurally set up even before Apple has reviewed anything.

---

## Phase 2 — Unblock Android first (fastest verification)

1. Build a **Play-compatible AAB** (not the preview APK).
2. Upload it to a **closed testing** track in Google Play.
3. Add test users in Play Console (license/closed testing).
4. Activate the subscription product in Google Play; wait for product propagation.
5. Install the **closed-test build from Play** (not sideloaded).
6. Test: offerings load → purchase sheet appears → test purchase succeeds → `pro` entitlement active →
   restore works.

> Note: a closed test doesn't mint a new "entitlement key." It gives you a **real Play Billing environment**
> where RevenueCat can verify the subscription end to end.

---

## Phase 3 — Stabilize (auth/account only if/when added)

- Finish any auth/login fixes in TestFlight or local-device testing *before* Apple review.
- Keep RevenueCat wired to the real iOS product IDs.
- Confirm paywall + restore work at the app level.
- Ensure a reviewer can create/sign in (if accounts exist) and reach the subscription screen without getting stuck.

---

## Phase 4 — iOS submission

1. Create the iOS subscription in App Store Connect.
2. Attach it to the app version you plan to submit.
3. Submit the app build **and first subscription together**.
4. After approval, re-test via TestFlight / sandbox as needed.

---

## Per-app checklist (RevenueCat)

- **Entitlement:** create/confirm `pro`.
- **Products:** attach each app's product ID to `pro`.
- **Offering:** confirm a current `default` offering with a monthly package pointing at that product.
- **Package:** monthly package using that product ID.
- **App code:** fetch offerings → show → purchase → restore → check entitlement.

Common failure: the "associated entitlements" section is empty, or the offering has no current
package → the SDK shows a config/empty-offerings error. Fixing the entitlement ↔ offering ↔ product
linkage clears it.

> App Store products start as "Ready to Submit" — real purchase behavior stays limited until Apple-side
> subscription setup is fully active. Don't trust the purchase flow fully until then.

---

## Notes / open

- Namespace product IDs per app so multiple FreeSurf apps never collide in RevenueCat/store consoles.
- When accounts arrive, migrate anon → account entitlement instead of assuming cross-app.
- Revisit cross-app subscriptions only if per-app data later justifies a family/shared plan.
