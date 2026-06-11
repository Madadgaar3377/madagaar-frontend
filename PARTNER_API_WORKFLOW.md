# Partner API Key — Complete Workflow & Architecture

> **Purpose:** Let verified Madadgaar partners connect their **own website / panel / ERP** to Madadgaar using an **API key**, so they can manage installments, applications, and dashboard data without logging into `partner.madadgaar.com.pk` for every action.

**Base API (production):** `https://api.madadgaar.com.pk/api`  
**Partner panel (human UI):** `https://partner.madadgaar.com.pk`  
**Partner API docs (panel):** `https://partner.madadgaar.com.pk/settings/api-keys/docs`  
**This document (repo):** `docs/PARTNER_API_WORKFLOW.md`  
**Backend repo:** `backend-Nodejs-Express/`  
**Partner panel repo:** `partner-panel/`

---

## Table of contents

0. [**API paths quick reference (create key + where to use it)**](#0-api-paths-quick-reference-create-key--where-to-use-it)
1. [Executive summary](#1-executive-summary)
2. [Current system (what exists today)](#2-current-system-what-exists-today)
3. [Target system (new feature)](#3-target-system-new-feature)
4. [High-level architecture](#4-high-level-architecture)
5. [Partner onboarding & API key lifecycle](#5-partner-onboarding--api-key-lifecycle)
6. [Authentication flows](#6-authentication-flows)
7. [Installment CRUD workflow](#7-installment-crud-workflow)
8. [Application / request management workflow](#8-application--request-management-workflow)
9. [Dashboard & analytics workflow](#9-dashboard--analytics-workflow)
10. [Multi-partner product rules](#10-multi-partner-product-rules)
11. [Full API surface (`/api/v1/partner`)](#11-full-api-surface-apiv1partner)
12. [Scopes & permissions matrix](#12-scopes--permissions-matrix)
13. [Security, rate limits & audit](#13-security-rate-limits--audit)
14. [Gaps to fix before launch](#14-gaps-to-fix-before-launch)
15. [Implementation phases](#15-implementation-phases)
16. [Partner panel UI additions](#16-partner-panel-ui-additions)

---

## 0. API paths quick reference (create key + where to use it)

Madadgaar uses **two separate URL groups**. Do not mix them.

| Group | Base path | Auth | Who calls it |
|-------|-----------|------|--------------|
| **A — Key management** | `/api/v1/partner/keys` | Partner **JWT** (login) | Partner panel UI only |
| **B — Partner integration** | `/api/v1/partner` | **API key** | Partner website / ERP / custom panel |
| **C — Public catalog** | `/api` (legacy paths) | None / user JWT | Partner site embed, Madadgaar app |

```mermaid
flowchart LR
    subgraph A["A — Create & manage keys<br/>JWT only"]
        A1["POST /api/v1/partner/keys"]
        A2["GET /api/v1/partner/keys"]
        A3["DELETE /api/v1/partner/keys/:keyId"]
    end

    subgraph B["B — Use key on your systems<br/>API key only"]
        B1["GET /api/v1/partner/installments"]
        B2["POST /api/v1/partner/installments"]
        B3["GET /api/v1/partner/applications"]
        B4["PATCH /api/v1/partner/applications/:id/status"]
        B5["GET /api/v1/partner/dashboard"]
    end

    PP[Partner Panel<br/>settings/api-keys] --> A1
    A1 -->|returns mg_live_... once| ENV[Partner server .env]
    ENV --> B1
    ENV --> B3
```

---

### 0.1 Where partners create API keys (UI + API)

#### Partner panel (recommended)

| What | URL |
|------|-----|
| API Keys list | `https://partner.madadgaar.com.pk/settings/api-keys` |
| Generate key modal | Same page → **Generate Key** button |
| API documentation | `https://partner.madadgaar.com.pk/settings/api-keys/docs` |
| Link in navbar | **Settings → API Keys** |

#### Backend — key management endpoints (JWT only)

> **Never** call these with an API key. Use the JWT from `POST /api/login`.

| Action | Method | Full endpoint |
|--------|--------|---------------|
| **Create API key** | `POST` | `https://api.madadgaar.com.pk/api/v1/partner/keys` |
| List my keys | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/keys` |
| Get one key meta | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/keys/:keyId` |
| Update name/scopes | `PATCH` | `https://api.madadgaar.com.pk/api/v1/partner/keys/:keyId` |
| Revoke key | `DELETE` | `https://api.madadgaar.com.pk/api/v1/partner/keys/:keyId` |
| OpenAPI spec | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/openapi.json` |
| Health / key test | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/me` |

**Create key — request example:**

```http
POST https://api.madadgaar.com.pk/api/v1/partner/keys
Authorization: Bearer <partner_jwt_from_login>
Content-Type: application/json

{
  "name": "Production Website",
  "scopes": [
    "installments:read",
    "installments:write",
    "applications:read",
    "applications:write",
    "dashboard:read"
  ],
  "expiresAt": null
}
```

**Create key — response (secret shown once):**

```json
{
  "success": true,
  "message": "API key created. Copy the secret now — it will not be shown again.",
  "data": {
    "keyId": "key_8f3a2b1c",
    "name": "Production Website",
    "keyPrefix": "mg_live_a8f2",
    "apiKey": "mg_live_a8f2k9XmP4nQ7vR2wL5yH8jT1cB6dF0",
    "scopes": ["installments:read", "installments:write", "applications:read", "applications:write", "dashboard:read"],
    "status": "active",
    "createdAt": "2026-05-19T10:00:00.000Z",
    "expiresAt": null
  }
}
```

Store `apiKey` in the partner server environment:

```env
MADADGAAR_API_KEY=mg_live_a8f2k9XmP4nQ7vR2wL5yH8jT1cB6dF0
MADADGAAR_API_BASE=https://api.madadgaar.com.pk/api/v1/partner
```

---

### 0.2 Where partners **use** the API key (integration endpoints)

Base URL for all partner system calls:

```
https://api.madadgaar.com.pk/api/v1/partner
```

**Auth header (choose one):**

```http
Authorization: Bearer mg_live_a8f2k9XmP4nQ7vR2wL5yH8jT1cB6dF0
```

or

```http
X-API-Key: mg_live_a8f2k9XmP4nQ7vR2wL5yH8jT1cB6dF0
```

#### Installments — full paths

| Action | Method | Full URL |
|--------|--------|----------|
| List my products | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/installments` |
| List (paginated) | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/installments?page=1&limit=20` |
| Create product | `POST` | `https://api.madadgaar.com.pk/api/v1/partner/installments` |
| Get one product | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/installments/:installmentPlanId` |
| Update product | `PUT` | `https://api.madadgaar.com.pk/api/v1/partner/installments/:installmentPlanId` |
| Delete product / remove plans | `DELETE` | `https://api.madadgaar.com.pk/api/v1/partner/installments/:installmentPlanId` |
| Add payment plan | `POST` | `https://api.madadgaar.com.pk/api/v1/partner/installments/:installmentPlanId/plans` |
| Remove payment plan | `DELETE` | `https://api.madadgaar.com.pk/api/v1/partner/installments/:installmentPlanId/plans/:planId` |

#### Applications (requests) — full paths

| Action | Method | Full URL |
|--------|--------|----------|
| List incoming requests | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/applications` |
| Filter by status | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/applications?status=pending` |
| Get request detail | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/applications/:applicationId` |
| Approve / reject / update | `PATCH` | `https://api.madadgaar.com.pk/api/v1/partner/applications/:applicationId/status` |
| Delete request | `DELETE` | `https://api.madadgaar.com.pk/api/v1/partner/applications/:applicationId` |

#### Dashboard & profile — full paths

| Action | Method | Full URL |
|--------|--------|----------|
| Dashboard stats | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/dashboard` |
| Partner profile | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/me` |
| Test key is valid | `GET` | `https://api.madadgaar.com.pk/api/v1/partner/me` |

**Test key — curl example:**

```bash
curl -s https://api.madadgaar.com.pk/api/v1/partner/me \
  -H "Authorization: Bearer $MADADGAAR_API_KEY"
```

**List installments — curl example:**

```bash
curl -s "https://api.madadgaar.com.pk/api/v1/partner/installments?page=1&limit=10" \
  -H "X-API-Key: $MADADGAAR_API_KEY"
```

**Update application status — curl example:**

```bash
curl -s -X PATCH \
  "https://api.madadgaar.com.pk/api/v1/partner/applications/APP123/status" \
  -H "Authorization: Bearer $MADADGAAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","note":"Customer verified"}'
```

---

### 0.3 Public paths (partner website — no API key)

Use these on the **customer-facing** partner website to show catalog. No API key required.

| Action | Method | Full URL |
|--------|--------|----------|
| Public product detail | `GET` | `https://api.madadgaar.com.pk/api/getInstallment/:id` |
| Public catalog | `GET` | `https://api.madadgaar.com.pk/api/getAllInstallments` |
| Search products | `GET` | `https://api.madadgaar.com.pk/api/search/installments?q=samsung` |
| Customer apply | `POST` | `https://api.madadgaar.com.pk/api/applyInstallment` (end-user JWT today) |

> **Phase 2:** `POST https://api.madadgaar.com.pk/api/v1/public/apply` with partner referral token so customers apply without Madadgaar login.

---

### 0.4 Path map — one diagram

```mermaid
flowchart TB
    subgraph Panel["Partner Panel (browser)"]
        UI1["/settings/api-keys"]
        UI2["/settings/api-keys/docs"]
        UI3["/installments"]
    end

    subgraph KeysAPI["Key management — JWT"]
        K1["POST /api/v1/partner/keys"]
        K2["GET /api/v1/partner/keys"]
        K3["DELETE /api/v1/partner/keys/:keyId"]
    end

    subgraph PartnerAPI["Partner integration — API key"]
        P1["GET /api/v1/partner/installments"]
        P2["POST /api/v1/partner/installments"]
        P3["PUT /api/v1/partner/installments/:id"]
        P4["DELETE /api/v1/partner/installments/:id"]
        P5["GET /api/v1/partner/applications"]
        P6["PATCH /api/v1/partner/applications/:id/status"]
        P7["GET /api/v1/partner/dashboard"]
        P8["GET /api/v1/partner/me"]
    end

    subgraph PublicAPI["Public catalog — no key"]
        Pu1["GET /api/getInstallment/:id"]
        Pu2["GET /api/getAllInstallments"]
    end

    UI1 --> K1
    UI2 --> Doc["This MD + openapi.json"]
    UI3 --> PanelJWT["Legacy JWT routes<br/>/getAllCreateInstallnment etc."]

    K1 --> Secret["mg_live_..."]
    Secret --> P1
    Secret --> P5
    Secret --> P7

    PartnerSite["Partner customer website"] --> Pu1
    PartnerSite --> Pu2
    PartnerERP["Partner ERP / CRM"] --> P1
    PartnerERP --> P6
```

---

### 0.5 Documentation locations (where partners read how to use keys)

| Document | Location | Audience |
|----------|----------|----------|
| **This workflow** | `docs/PARTNER_API_WORKFLOW.md` (repo) | Dev team + partners (export to PDF) |
| **Partner panel in-app docs** | `partner.madadgaar.com.pk/settings/api-keys/docs` | Partners (copy-paste curl examples) |
| **OpenAPI / Swagger** | `GET /api/v1/partner/openapi.json` | Postman import, code generators |
| **Postman collection** | `docs/postman/Madadgaar-Partner-API.postman_collection.json` (to add) | Partners |
| **Section 0 (this)** | Quick path reference | Start here |

**Partner panel docs page should show:**

1. Link to create key → `/settings/api-keys`
2. Base URL → `https://api.madadgaar.com.pk/api/v1/partner`
3. Header format → `Authorization: Bearer mg_live_...`
4. Table of all endpoints from [§0.2](#02-where-partners-use-the-api-key-integration-endpoints)
5. Scopes table from [§12](#12-scopes--permissions-matrix)
6. Download OpenAPI button

---

### 0.6 Backend route registration (implementation)

Add to `backend-Nodejs-Express/routes/routes.js`:

```js
// ─── Partner API v1 ───────────────────────────────────────────────
const partnerApiV1 = require("./partnerApiV1");

// A) Key management — JWT only (partner logged into panel)
router.use("/v1/partner/keys", verifyUser, requirePartner, partnerApiV1.keysRouter);

// B) Integration — API key
router.use("/v1/partner", verifyPartnerApiKey, partnerApiV1.integrationRouter);

// C) OpenAPI spec (public read)
router.get("/v1/partner/openapi.json", partnerApiV1.openApiSpec);
```

File layout:

```
backend-Nodejs-Express/
  routes/
    partnerApiV1/
      index.js              # mounts keys + integration routers
      keysRouter.js         # POST/GET/DELETE /v1/partner/keys
      integrationRouter.js  # installments, applications, dashboard, me
      openapi.json          # or generated spec
  partner/apiKeys/
    createPartnerApiKey.js
    listPartnerApiKeys.js
    revokePartnerApiKey.js
  Middelware/
    verifyPartnerApiKey.js
    requirePartner.js       # UserType === partner && isVerified
```

---

## 1. Executive summary

| Actor | Today | After API key feature |
|-------|--------|------------------------|
| **Partner (human)** | Logs into partner panel → JWT in browser | Same + can generate API keys in Settings |
| **Partner (system)** | No official integration | Uses API key from server → calls REST APIs |
| **End customer** | Applies on madadgaar.com / mobile app | Can also apply via partner's own site (if partner embeds apply flow) |
| **Admin** | Verifies partner, manages listings | Can revoke partner keys, view API usage |

**Core idea:** API key resolves to `partnerId` (`User.userId` where `UserType = partner`). All operations are scoped to that partner — same business rules as the partner panel, but machine-to-machine.

---

## 2. Current system (what exists today)

### 2.1 Backend stack

```
server.js
  └── routes/routes.js          # All HTTP routes
        ├── accounts/           # login, signup, OTP
        ├── partner/            # dashboard, partner lists, agents
        ├── installements/      # installment CRUD + applications
        ├── property/
        ├── LoanSection/
        ├── Insurance/
        └── Middelware/
              ├── VerifyUser.js         # JWT Bearer (main auth)
              ├── VerifyPartnerToken.js # Partner session bootstrap
              └── verifyAdmin.js
```

### 2.2 Partner identity model

Partners are **not** a separate collection. They are `User` documents:

| Field | Role |
|-------|------|
| `userId` | Primary partner identifier (used everywhere) |
| `UserType` | `"partner"` |
| `userAccess[]` | UI feature flags: `Installments`, `Property`, `Loan`, `Insurance`, `Commission` |
| `isVerified` | Admin approval — required for most APIs via `verifyUser` |
| `companyDetails` | SECP, NTN, company name, etc. |
| `emailVerify` | Email verified |

### 2.3 Current partner panel features

| Area | Partner panel route | Backend API |
|------|---------------------|-------------|
| Login | `/` | `POST /login` → JWT |
| Dashboard | `/dashboard` | `GET /partnerDashboard` |
| List installments | `/installments` | `GET /getAllCreateInstallnment` |
| Create installment | `/installments/create` | `POST /createInstallmentPlan` |
| Edit installment | `/installments/edit/:id` | `PUT /updateInstallment/:id` |
| Delete installment | (from list) | `DELETE /deleteInstallment/:id` |
| View requests | `/installments/requests` | `GET /getAllRequestInstallments` |
| Request detail | `/installments/view/:id` | `GET /getApplication/:id` |
| Update request status | (from detail) | `PUT /updateApplicationStatus` |
| Agents | `/agents` | `GET /partner/myAgents`, `POST /partner/linkAgent` |
| Property / Loan / Insurance | respective routes | same JWT pattern |

### 2.4 Current auth mechanism

```mermaid
sequenceDiagram
    participant P as Partner Browser
    participant PP as Partner Panel
    participant API as Madadgaar API
    participant DB as MongoDB

    P->>PP: email + password
    PP->>API: POST /login { email, password, loginSource: partner }
    API->>DB: validate User (UserType=partner)
    API-->>PP: JWT { userId, email } (30 days)
    PP->>PP: store in localStorage (userToken)
    PP->>API: GET /partnerDashboard<br/>Authorization: Bearer JWT
    API->>API: verifyUser middleware
    API-->>PP: dashboard JSON
```

**There is no API key today.** Partners could theoretically script against JWT login, but there is no key lifecycle, scopes, per-key rate limits, or audit trail.

---

## 3. Target system (new feature)

### 3.1 New components to build

| Component | Description |
|-----------|-------------|
| `PartnerApiKey` model | Hashed secret, prefix, `partnerId`, scopes, status, `lastUsedAt` |
| `verifyPartnerApiKey` middleware | `Authorization: Bearer mg_live_xxx` or `X-API-Key` |
| `/api/v1/partner/*` routes | Versioned, documented external API |
| Partner panel **Settings → API Keys** | Generate, copy once, revoke, view usage |
| Ownership guards | Fix endpoints that lack `createdBy === partnerId` checks |
| API audit log | Per-key request logging |

### 3.2 What partners can do via API key

```mermaid
mindmap
  root((Partner API))
    Installments
      Create product
      Update product
      Get own listings
      Delete own listing
      Add payment plan
      Remove own payment plan
    Applications
      List incoming requests
      Get request detail
      Approve / Reject / Pending
      Add internal notes
    Dashboard
      Stats counts
      Recent listings
      Recent applications
    Profile read-only
      Company name
      Partner ID
      Verification status
```

---

## 4. High-level architecture

```mermaid
flowchart TB
    subgraph PartnerSide["Partner infrastructure"]
        PW[Partner Website]
        PP2[Partner Custom Panel]
        ERP[Partner ERP / CRM]
    end

    subgraph Madadgaar["Madadgaar platform"]
        PPanel[Partner Panel Web<br/>partner.madadgaar.com.pk]
        API[Express API<br/>api.madadgaar.com.pk]
        MW_JWT[verifyUser JWT]
        MW_KEY[verifyPartnerApiKey]
        CTRL[Existing controllers<br/>+ ownership checks]
        DB[(MongoDB)]
        CACHE[(Redis cache)]
    end

    subgraph Public["Public channels"]
        WEB[madadgaar.com]
        APP[Mobile App]
    end

    PPanel -->|JWT login| API
    PW -->|API Key| API
    PP2 -->|API Key| API
    ERP -->|API Key| API

    API --> MW_JWT
    API --> MW_KEY
    MW_JWT --> CTRL
    MW_KEY --> CTRL
    CTRL --> DB
    CTRL --> CACHE

    WEB -->|public GET| API
    APP -->|public GET + user JWT apply| API
```

---

## 5. Partner onboarding & API key lifecycle

### 5.1 Partner must be verified before API access

```mermaid
flowchart TD
    A[Partner signs up] --> B[Complete company profile]
    B --> C[Admin reviews & verifies]
    C -->|Rejected| D[Pending verification screen]
    C -->|Approved| E[isVerified = true]
    E --> F[Partner panel full access]
    F --> G[Settings → API Keys]
    G --> H[Generate new key]
    H --> I[Show secret ONCE]
    I --> J[Partner stores in their server .env]
    J --> K[Partner system calls /api/v1/partner/*]

    K --> L{Key valid?}
    L -->|No| M[401 Unauthorized]
    L -->|Yes| N{Scope allowed?}
    N -->|No| O[403 Forbidden]
    N -->|Yes| P[Execute request + audit log]
```

### 5.2 API key lifecycle states

```mermaid
stateDiagram-v2
    [*] --> active: Partner generates key
    active --> revoked: Partner or admin revokes
    active --> expired: Optional expiry date reached
    revoked --> [*]
    expired --> [*]

    note right of active
        Secret shown only at creation.
        Stored as bcrypt hash in DB.
        Prefix mg_live_abc12 shown in list.
    end note
```

### 5.3 Key generation flow (partner panel)

```mermaid
sequenceDiagram
    participant P as Partner User
    participant UI as Partner Panel Settings
    participant API as Madadgaar API
    participant DB as MongoDB

    P->>UI: Open Settings → API Keys
    UI->>API: GET /api/v1/partner/api-keys<br/>Authorization: Bearer JWT
    API-->>UI: list of keys (prefix, scopes, lastUsed, no secret)

    P->>UI: Create key { name, scopes, optional expiry }
    UI->>API: POST /api/v1/partner/api-keys
    API->>API: generate mg_live_<random>
    API->>DB: save hash + metadata
    API-->>UI: { apiKey: "mg_live_...", warning: "copy now" }
    UI->>P: Show secret once + copy button

    Note over P,DB: Secret never returned again on GET
```

---

## 6. Authentication flows

### 6.1 Two auth modes on same backend

| Mode | Header | Use case | Middleware |
|------|--------|----------|------------|
| **Human session** | `Authorization: Bearer <JWT>` | Partner panel browser | `verifyUser` |
| **Machine access** | `Authorization: Bearer mg_live_...` or `X-API-Key: mg_live_...` | Partner server / website | `verifyPartnerApiKey` |

### 6.2 API key verification flow

```mermaid
flowchart TD
    REQ[Incoming request] --> HDR{Has API key header?}
    HDR -->|No| JWT{Has JWT?}
    JWT -->|Yes| VU[verifyUser]
    JWT -->|No| UNAUTH[401]

    HDR -->|Yes| PREFIX{Starts with mg_live_?}
    PREFIX -->|No| UNAUTH
    PREFIX -->|Yes| HASH[Lookup by prefix + verify hash]
    HASH --> FOUND{Key found & active?}
    FOUND -->|No| UNAUTH
    FOUND -->|Yes| PARTNER{Partner verified & active?}
    PARTNER -->|No| FORB[403 Partner not verified]
    PARTNER -->|Yes| SCOPE{Route scope OK?}
    SCOPE -->|No| FORB2[403 Insufficient scope]
    SCOPE -->|Yes| ATTACH[req.partner = partnerId<br/>req.apiKeyId = key id]
    ATTACH --> CTRL[Controller]
    CTRL --> AUDIT[Log apiKeyId, route, status]
```

### 6.3 Recommended key format

```
mg_live_<32_char_random>     # production
mg_test_<32_char_random>     # sandbox (optional phase 2)
```

Store in DB:
- `keyPrefix` — first 12 chars (for lookup)
- `keyHash` — bcrypt(full secret)
- Never store plaintext after creation response

---

## 7. Installment CRUD workflow

### 7.1 Existing backend routes (reused internally)

| Action | Method | Current route | Auth today |
|--------|--------|---------------|------------|
| Create | `POST` | `/createInstallmentPlan` | `verifyUser` |
| List (partner) | `GET` | `/getAllCreateInstallnment` | `verifyUser` |
| Get one (partner) | `GET` | `/getPartnerInstallment/:id` | `verifyUser` |
| Get one (public) | `GET` | `/getInstallment/:id` | Public + cache |
| Update | `PUT` | `/updateInstallment/:id` | `verifyUser` |
| Delete | `DELETE` | `/deleteInstallment/:id` | `verifyUser` |
| Add plan | `POST` | `/installment/:id/add-plan` | `verifyUser` |
| Remove plan | `DELETE` | `/installment/:id/payment-plan/:planId` | `verifyUser` |
| Admin approve listing | `PATCH` | `/updateInstallmentStatus/:id` | `verifyAdmin` |

**Partner access logic:** `partner/installmentPartnerAccess.js`
- **Product owner** — created the listing; can edit product fields
- **Contributor** — added their own `paymentPlans` / `partnerPricing` on shared product; can only edit/remove their own plans

### 7.2 Create installment flow

```mermaid
sequenceDiagram
    participant PS as Partner System
    participant API as API v1
    participant ACC as installmentPartnerAccess
    participant DB as MongoDB
    participant CACHE as Redis

    PS->>API: POST /api/v1/partner/installments<br/>X-API-Key + body
    API->>API: verifyPartnerApiKey (scope: installments:write)
    API->>API: validate payload (productName, category, price, plans...)
    API->>DB: create InstallmentPlan<br/>userId = partnerId<br/>createdBy = [{ userId: partnerId }]
    DB-->>API: installmentPlanId
    API->>CACHE: invalidate installments public cache
    API-->>PS: 201 { installmentPlanId, status: pending/approved }
```

**Typical create payload (simplified):**

```json
{
  "productName": "Samsung Galaxy A55",
  "category": "smartphones",
  "city": "Karachi",
  "price": 85000,
  "discountedPrice": 79999,
  "description": "...",
  "productImages": ["https://..."],
  "variants": [],
  "paymentPlans": [
    {
      "planName": "12 Month Plan",
      "monthlyInstallment": 7500,
      "downPayment": 10000,
      "tenureMonths": 12,
      "partnerId": "<auto-filled from API key>"
    }
  ],
  "partnerPricing": []
}
```

### 7.3 Update installment flow

```mermaid
flowchart TD
    A[PUT /installments/:id] --> B{Partner has access?}
    B -->|No| C[404 / 403]
    B -->|Yes| D{Is product owner?}
    D -->|Yes| E[Update product fields + own plans]
    D -->|No contributor| F[Update only own paymentPlans / partnerPricing / variant overrides]
    E --> G[paymentPlanMerge.js merge rules]
    F --> G
    G --> H[Save + invalidate cache]
    H --> I[200 OK]
```

### 7.4 Delete installment flow

```mermaid
flowchart TD
    A[DELETE /installments/:id] --> B{Is product owner?}
    B -->|Yes| C[Hard delete entire listing]
    B -->|No contributor only| D[Remove only this partner's payment plans]
    D --> E{Any plans left on product?}
    E -->|Yes| F[Product remains for other partners]
    E -->|No + not owner| G[403 Cannot delete product]
    C --> H[Invalidate cache]
    F --> H
```

### 7.5 Read / list flow

```mermaid
sequenceDiagram
    participant PS as Partner System
    participant API as API v1
    participant ACC as installmentPartnerAccess
    participant DB as MongoDB

    PS->>API: GET /api/v1/partner/installments?page=1&limit=20
    API->>DB: find installments where partner is owner OR has plans
    API->>ACC: filterInstallmentPlansForPartner(each doc)
    Note over ACC: Strips other vendors' payment plans
    API-->>PS: paginated list with isProductOwner flag
```

---

## 8. Application / request management workflow

### 8.1 How applications are linked to partners

When a customer applies (`POST /applyInstallment`):
- `ApplyInstallements.createdBy` = **partner userId** who receives the lead
- `PlanInfo[].partnerId` = selected plan's partner
- `installmentPlanId` = product reference

Partner panel today lists requests via:

```
GET /getAllRequestInstallments
  → ApplyInstallements.find({ createdBy: partnerUserId })
```

### 8.2 Application status workflow

```mermaid
stateDiagram-v2
    [*] --> pending: Customer submits apply
    pending --> approved: Partner approves
    pending --> rejected: Partner rejects
    pending --> under_review: Partner marks reviewing
    approved --> completed: Fulfilled / delivered
    rejected --> [*]
    completed --> [*]

    note right of pending
        Partner notified via
        notifications + email
    end note
```

### 8.3 List applications flow

```mermaid
sequenceDiagram
    participant PS as Partner System
    participant API as API v1
    participant DB as MongoDB

    PS->>API: GET /api/v1/partner/applications?status=pending&page=1
    API->>API: verifyPartnerApiKey (scope: applications:read)
    API->>DB: find ApplyInstallements where createdBy = partnerId
    API-->>PS: { applications[], pagination }
```

### 8.4 Get application detail flow

```mermaid
sequenceDiagram
    participant PS as Partner System
    participant API as API v1
    participant DB as MongoDB

    PS->>API: GET /api/v1/partner/applications/:applicationId
    API->>DB: find application
    API->>API: assert application.createdBy === partnerId
    alt Not owner
        API-->>PS: 403 Forbidden
    else Owner
        API->>DB: load linked installment (getPartnerInstallment)
        API-->>PS: { application, customerInfo, planInfo, product summary }
    end
```

### 8.5 Update application status flow

```mermaid
sequenceDiagram
    participant PS as Partner System
    participant API as API v1
    participant DB as MongoDB
    participant NOTIF as Notifications

    PS->>API: PATCH /api/v1/partner/applications/:id/status<br/>{ status: "approved", note: "..." }
    API->>API: verifyPartnerApiKey (scope: applications:write)
    API->>DB: load application
    API->>API: ownership check createdBy === partnerId
    API->>DB: update status + history entry
    API->>NOTIF: notify customer (push / email)
    API-->>PS: 200 { applicationId, status, updatedAt }
```

### 8.6 Existing application routes (today)

| Action | Method | Route | Gap for API key |
|--------|--------|-------|-----------------|
| Apply (customer) | `POST` | `/applyInstallment` | N/A — end user JWT |
| Partner list | `GET` | `/getAllRequestInstallments` | ✅ scoped by `createdBy` |
| Get one | `GET` | `/getApplication/:applicationId` | ⚠️ **no ownership check** — must fix |
| Update status | `PUT` | `/updateApplicationStatus` | ⚠️ **no ownership check** — must fix |
| Delete | `DELETE` | `/deleteInstallmentApplication/:id` | Has owner/admin check |
| List all (admin) | `GET` | `/getAllApplications` | Returns all — never expose via API key |

---

## 9. Dashboard & analytics workflow

### 9.1 Current dashboard API

`GET /partnerDashboard` → `partner/PartnerDashboard.js`

Returns:

```json
{
  "stats": {
    "totalInstallments",
    "ownedInstallments",
    "contributedInstallments",
    "totalInstallmentRequests",
    "totalProperties",
    "totalPropertyApplications",
    "totalLoans"
  },
  "recent": {
    "recentInstallments": [],
    "recentProperties": []
  }
}
```

### 9.2 Dashboard flow via API key

```mermaid
flowchart LR
    PS[Partner System] -->|GET /api/v1/partner/dashboard| API
    API --> S1[count installments via fetchPartnerInstallments]
    API --> S2[count ApplyInstallements createdBy partner]
    API --> S3[count properties / loans if scoped]
    S1 --> R[Combined stats JSON]
    S2 --> R
    S3 --> R
    R --> PS
```

**Proposed scope:** `dashboard:read`

---

## 10. Multi-partner product rules

Madadgaar supports **multiple partners on one product** (shared catalog item, each partner adds their own plans/pricing).

```mermaid
flowchart TB
    PROD[One Installment Product<br/>installmentPlanId: ABC]
    PROD --> O[Owner Partner A<br/>product fields, images, specs]
    PROD --> C1[Contributor Partner B<br/>paymentPlans with partnerId=B]
    PROD --> C2[Contributor Partner C<br/>partnerPricing overrides]

    O -->|API key A| FULL[Can edit product + own plans]
    C1 -->|API key B| PART[Can edit/remove only B plans]
    C2 -->|API key C| PART2[Can edit/remove only C plans]
```

**Rules for API integrators:**

| Role | Create product | Edit product name/images | Add plan | Edit own plan | Delete product |
|------|------------------|--------------------------|----------|---------------|----------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ (full delete) |
| Contributor | ❌ (add plan to existing) | ❌ | ✅ | ✅ | ❌ (only remove own plans) |

---

## 11. Full API surface (`/api/v1/partner`)

> **Quick reference:** See [§0 — API paths quick reference](#0-api-paths-quick-reference-create-key--where-to-use-it) for full URLs and curl examples.

### 11.1 API key management — `/api/v1/partner/keys` (JWT only)

| Method | Relative path | Full URL | Auth |
|--------|---------------|----------|------|
| `POST` | `/api/v1/partner/keys` | `https://api.madadgaar.com.pk/api/v1/partner/keys` | Partner JWT |
| `GET` | `/api/v1/partner/keys` | `https://api.madadgaar.com.pk/api/v1/partner/keys` | Partner JWT |
| `GET` | `/api/v1/partner/keys/:keyId` | `https://api.madadgaar.com.pk/api/v1/partner/keys/:keyId` | Partner JWT |
| `PATCH` | `/api/v1/partner/keys/:keyId` | `https://api.madadgaar.com.pk/api/v1/partner/keys/:keyId` | Partner JWT |
| `DELETE` | `/api/v1/partner/keys/:keyId` | `https://api.madadgaar.com.pk/api/v1/partner/keys/:keyId` | Partner JWT |

**Panel UI:** `https://partner.madadgaar.com.pk/settings/api-keys`  
**Docs UI:** `https://partner.madadgaar.com.pk/settings/api-keys/docs`

### 11.2 Installments — `/api/v1/partner/installments` (API key)

| Method | Path | Scope | Maps to existing |
|--------|------|-------|------------------|
| `GET` | `/installments` | `installments:read` | `getAllCreateInstallnment` |
| `POST` | `/installments` | `installments:write` | `createInstallmentPlan` |
| `GET` | `/installments/:id` | `installments:read` | `getPartnerInstallmentById` |
| `PUT` | `/installments/:id` | `installments:write` | `updateInstallmentPlan` |
| `DELETE` | `/installments/:id` | `installments:write` | `deleteInstallmentPlan` |
| `POST` | `/installments/:id/plans` | `installments:write` | `addPaymentPlanToInstallment` |
| `DELETE` | `/installments/:id/plans/:planId` | `installments:write` | `removePartnerPaymentPlan` |

All installment routes use base `https://api.madadgaar.com.pk/api/v1/partner/installments` and require API key.

### 11.3 Applications — `/api/v1/partner/applications` (API key)

| Method | Path | Scope | Maps to existing |
|--------|------|-------|------------------|
| `GET` | `/applications` | `applications:read` | `getAllRequestInstallments` |
| `GET` | `/applications/:id` | `applications:read` | `getApplicationById` + ownership fix |
| `PATCH` | `/applications/:id/status` | `applications:write` | `updateApplicationStatus` + ownership fix |

### 11.4 Dashboard & profile — `/api/v1/partner` (API key)

| Method | Full URL | Scope | Maps to existing |
|--------|----------|-------|------------------|
| `GET` | `https://api.madadgaar.com.pk/api/v1/partner/dashboard` | `dashboard:read` | `PartnerDashboard` |
| `GET` | `https://api.madadgaar.com.pk/api/v1/partner/me` | `profile:read` | Partner session / company info |

Use `GET /me` to verify the API key works after creation.

### 11.5 Public routes (no API key — partner website embed)

| Method | Path | Use |
|--------|------|-----|
| `GET` | `/getInstallment/:id` | Show product on partner site |
| `GET` | `/getAllInstallments` | Catalog embed (cached) |
| `POST` | `/applyInstallment` | Customer apply (requires end-user JWT or future public apply token) |

> **Phase 2 idea:** `POST /api/v1/public/apply` with partner referral key so customers can apply from partner site without Madadgaar login.

---

## 12. Scopes & permissions matrix

| Scope | Allows |
|-------|--------|
| `installments:read` | List + get own installments |
| `installments:write` | Create, update, delete, add/remove plans |
| `applications:read` | List + get own applications |
| `applications:write` | Update application status |
| `dashboard:read` | Dashboard stats |
| `profile:read` | Partner company profile |
| `*` (admin-granted) | All partner scopes — use sparingly |

**Default key on creation:** `installments:read`, `applications:read`, `dashboard:read`  
Partner must explicitly enable `installments:write` and `applications:write`.

```mermaid
flowchart LR
    subgraph ReadOnly["Read-only integration"]
        R1[Sync catalog to partner site]
        R2[Pull new applications into CRM]
    end

    subgraph ReadWrite["Full integration"]
        W1[Create/update products from ERP]
        W2[Approve/reject applications from ERP]
    end

    ReadOnly --> S1[installments:read<br/>applications:read<br/>dashboard:read]
    ReadWrite --> S2[+ installments:write<br/>+ applications:write]
```

---

## 13. Security, rate limits & audit

### 13.1 Security checklist

| Item | Requirement |
|------|-------------|
| Secret storage | bcrypt hash only |
| One-time display | Plain secret shown once at `POST /api-keys` |
| HTTPS only | Reject non-TLS in production |
| Partner status | Block if `isBlocked`, `isActive=false`, `!isVerified` |
| Ownership | Every write must check `partnerId` / `createdBy` |
| IP allowlist | Optional per-key (phase 2) |
| Rotation | Revoke old → create new; no secret update in place |

### 13.2 Rate limits (proposed)

| Tier | Limit |
|------|-------|
| Per API key | 100 req/min |
| Per partner (all keys) | 500 req/min |
| Create/update installment | 20 req/min |
| Public catalog | existing cache — unchanged |

### 13.3 Audit log (proposed model)

```json
{
  "apiKeyId": "...",
  "partnerId": "...",
  "method": "PUT",
  "path": "/api/v1/partner/installments/abc",
  "statusCode": 200,
  "ip": "...",
  "userAgent": "...",
  "durationMs": 45,
  "createdAt": "ISO date"
}
```

---

## 14. Gaps to fix before launch

These exist in the **current** backend and must be fixed **before** exposing API keys:

| # | Issue | Risk | Fix |
|---|-------|------|-----|
| 1 | `GET /getApplication/:id` — no `createdBy` check | Any verified user can read any application | Add `assertApplicationOwner(partnerId)` |
| 2 | `PUT /updateApplicationStatus` — no ownership check | Partner could change another partner's leads | Require `createdBy === req.partner.userId` |
| 3 | `createInstallmentPlan` accepts `userId` in body | Spoof another partner | Force `userId = req.user.userId` or `req.partner.userId` |
| 4 | No API key model | Cannot launch feature | Add `PartnerApiKey` schema |
| 5 | `LoginWithToken` calls `/api/auth/partnerSession` | Broken deep link | Use `/api/partnerSession` |
| 6 | `userToken` fields on User unused | Confusion | Deprecate in favor of `PartnerApiKey` |

---

## 15. Implementation phases

```mermaid
gantt
    title Partner API rollout
    dateFormat  YYYY-MM-DD
    section Phase 1 — Foundation
    PartnerApiKey model + middleware     :p1a, 2026-01-01, 7d
    Ownership fixes on applications      :p1b, after p1a, 5d
    section Phase 2 — Core API
    v1 installments endpoints            :p2a, after p1b, 10d
    v1 applications endpoints              :p2b, after p2a, 7d
    v1 dashboard + me                      :p2c, after p2b, 3d
    section Phase 3 — Partner panel UI
    Settings API Keys page                 :p3a, after p2c, 7d
    Docs page + copy examples              :p3b, after p3a, 5d
    section Phase 4 — Hardening
    Rate limits per key                    :p4a, after p3b, 5d
    Audit logs + usage dashboard           :p4b, after p4a, 7d
    section Phase 5 — Optional
    Public apply from partner site         :p5a, after p4b, 14d
    Sandbox mg_test keys                   :p5b, after p5a, 7d
```

### Phase 1 — Foundation (week 1–2)
- [ ] `models/PartnerApiKey.js`
- [ ] `Middelware/verifyPartnerApiKey.js`
- [ ] Fix application ownership checks
- [ ] Force `partnerId` from auth context on create/update

### Phase 2 — Core API (week 3–4)
- [ ] Router `routes/partnerApiV1.js`
- [ ] Wrap existing controllers (thin adapters)
- [ ] OpenAPI / Postman collection

### Phase 3 — Partner panel UI (week 5)
- [ ] `partner-panel/src/pages/settings/ApiKeys.jsx` → route `/settings/api-keys`
- [ ] `partner-panel/src/pages/settings/ApiKeysDocs.jsx` → route `/settings/api-keys/docs`
- [ ] Generate / revoke / scope picker (calls `POST /api/v1/partner/keys`)
- [ ] Link from Navbar → Settings → API Keys
- [ ] Docs page: full endpoint table from §0.2 + copy curl buttons

### Phase 4 — Production hardening (week 6–7)
- [ ] Per-key rate limiting
- [ ] `PartnerApiAuditLog` + usage UI
- [ ] Admin revoke all keys for blocked partner

---

## 16. Partner panel UI additions

### 16.1 New Settings → API Keys screen

```
┌─────────────────────────────────────────────────────────┐
│  API Keys                              [+ Generate Key] │
├─────────────────────────────────────────────────────────┤
│  Name          Prefix        Scopes           Last used │
│  Production    mg_live_a8f…  read+write       2 min ago │
│  CRM sync      mg_live_b2c…  read only        1 hr ago  │
├─────────────────────────────────────────────────────────┤
│  ⚠ Copy your key when created. It is shown only once.   │
│  📖 View API documentation → /settings/api-keys/docs   │
└─────────────────────────────────────────────────────────┘
```

**Partner panel routes to add:**

| Panel path | Purpose |
|------------|---------|
| `/settings/api-keys` | List keys, generate, revoke |
| `/settings/api-keys/docs` | Endpoint table, curl examples, OpenAPI download |
| `/settings/api-keys/docs#create-key` | Anchor: how to create key |
| `/settings/api-keys/docs#installments` | Anchor: CRUD paths |
| `/settings/api-keys/docs#applications` | Anchor: request management paths |

**Panel calls for key create:**

```
POST https://api.madadgaar.com.pk/api/v1/partner/keys
Authorization: Bearer <userToken from localStorage>
```

### 16.2 Generate key modal flow

```mermaid
flowchart TD
    M[Open modal] --> N[Enter key name]
    N --> S[Select scopes checkboxes]
    S --> E[Optional expiry date]
    E --> G[Click Generate]
    G --> SHOW[Show mg_live_... + Copy]
    SHOW --> DONE[Close — key listed by prefix only]
```

---

## Appendix A — End-to-end partner integration example

```mermaid
sequenceDiagram
    participant C as Customer on Partner Site
    participant PW as Partner Website
    participant API as Madadgaar API
    participant CRM as Partner CRM via API Key

    Note over PW,API: Catalog sync (nightly)
    CRM->>API: GET /api/v1/partner/installments
    API-->>CRM: product list

    Note over PW,API: Customer browses partner site
    PW->>API: GET /getInstallment/:id (public)
    API-->>PW: product + plans

    C->>PW: Click Apply
    PW->>API: POST /applyInstallment (user auth or phase-2 public apply)
    API-->>PW: applicationId

    Note over CRM,API: Partner staff uses their CRM
    CRM->>API: GET /api/v1/partner/applications?status=pending
    API-->>CRM: new leads

    CRM->>API: PATCH /api/v1/partner/applications/:id/status { approved }
    API-->>CRM: OK
    API->>C: notification — approved
```

---

## Appendix B — Key backend files reference

| File | Purpose |
|------|---------|
| `backend-Nodejs-Express/routes/routes.js` | All route definitions |
| `backend-Nodejs-Express/Middelware/VerifyUser.js` | JWT auth |
| `backend-Nodejs-Express/Middelware/VerifyPartnerToken.js` | Partner session |
| `backend-Nodejs-Express/partner/PartnerDashboard.js` | Dashboard stats |
| `backend-Nodejs-Express/partner/installmentPartnerAccess.js` | Owner vs contributor rules |
| `backend-Nodejs-Express/partner/getAllRequest.js` | Partner application list |
| `backend-Nodejs-Express/installements/controllers/createInstallmentPlan.js` | Create |
| `backend-Nodejs-Express/installements/controllers/updateInstallmentPlan.js` | Update |
| `backend-Nodejs-Express/installements/controllers/deleteInstallmentPlan.js` | Delete |
| `backend-Nodejs-Express/models/UserSchema.js` | Partner user model |
| `backend-Nodejs-Express/models/Installements.js` | Installment product model |
| `backend-Nodejs-Express/models/ApplyInstallements.js` | Application model |
| `partner-panel/src/App.js` | Partner panel routes |
| `partner-panel/src/pages/installments/*` | Installment UI |

---

## Appendix C — Suggested `PartnerApiKey` schema

```js
{
  keyId: String,           // uuid
  partnerId: String,       // User.userId
  name: String,            // "Production ERP"
  keyPrefix: String,       // "mg_live_a8f2" — indexed
  keyHash: String,         // bcrypt
  scopes: [String],        // ["installments:read", "applications:write"]
  status: String,          // active | revoked | expired
  expiresAt: Date | null,
  lastUsedAt: Date | null,
  lastUsedIp: String,
  createdAt: Date,
  revokedAt: Date | null,
  createdByUserId: String  // partner user who generated it
}
```

---

*Document version: 1.0 — aligned with backend audit of `backend-Nodejs-Express` and `partner-panel` as of project review.*
