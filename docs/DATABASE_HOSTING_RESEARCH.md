# Database / Hosting Research

Current working split:

- Cloudflare for hosting, edge delivery, caching, and static or public surfaces.
- Supabase for auth, database records, and the more relational parts of the products.

Use Cloudflare for:

- frontend hosting
- edge routing
- caching
- public page rendering

Use Supabase for:

- shared auth
- invoices
- users
- permissions
- client records
- other relational product data

Rule of thumb:

- If a feature is mostly public, static, or edge-delivered, keep it on Cloudflare.
- If a feature needs structured user data, shared login, or normal relational CRUD, use Supabase.

This is a working reference and can change later based on pricing, usage, and product complexity.

---

## Shared Auth Across cnxt Products

The goal is a Google-style single identity: one account that works across every cnxt product. This is already the architecture in place.

One Supabase project acts as the identity provider. It issues a JWT on sign-in. Every cnxt product — whether a Cloudflare Worker, a Cloudflare Pages app, or a future backend service — independently validates that JWT using the shared `SUPABASE_JWT_SECRET`. No product needs to call Supabase at request time to verify who the user is.

The `sub` field in the JWT is the user's permanent UUID. It is consistent across every product and serves as the universal anchor for all user data, regardless of where that data lives.

```
Supabase Auth (one project)
        │
        ▼ issues JWT (contains sub + email)
        │
   ┌────┴──────────────────────────────┐
   ▼                                   ▼
cnxt-to-links (Cloudflare Worker)   cnxt-to-invoices (Cloudflare Pages)
validates JWT                        validates JWT
stores data in KV / R2               stores data in Supabase DB
keyed by sub                         keyed by auth.uid() = sub
        │                                   │
  future products                    future products
  (any stack)                        (any stack)
```

**What this enables:**
- One login page (potentially `auth.cnxt.to`) that all products redirect to via the PKCE auth flow.
- A unified user dashboard showing the user's data and activity across all cnxt products.
- Shared profile data — cnxt-to-links profile can pre-fill name and avatar in other products since `sub` is the same key everywhere.

**When a second Supabase project would make sense:**
- A product with a completely separate user base (e.g., your clients' end-customers who have no relationship to the cnxt account holder).
- Strict data residency requirements (different geographic region).
- Fully independent billing and quota isolation.

For the cnxt ecosystem where the same person is the user across products, one Supabase project handles auth and scales to 50,000 monthly active users before any paid tier is needed.
