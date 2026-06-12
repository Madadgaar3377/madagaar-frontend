# Madadgaar Expert Partner  Public Frontend

<div align="center">
  <img src="public/Media/Group%2033.png" alt="Madadgaar Logo" width="200"/>

  **Pakistan's trusted marketplace for Property, Insurance, Loans & Installment Plans**

  [![Version](https://img.shields.io/badge/Version-0.1.03-blue.svg)](./package.json)
  [![Live](https://img.shields.io/badge/Live-madadgaar.com.pk-success.svg)](https://madadgaar.com.pk)
  [![React](https://img.shields.io/badge/React-19.2.0-61DAFB.svg)](https://reactjs.org/)
  [![React Router](https://img.shields.io/badge/React_Router-7.9.6-CA4245.svg)](https://reactrouter.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.18-38B2AC.svg)](https://tailwindcss.com/)
  [![API](https://img.shields.io/badge/API-api.madadgaar.com.pk-orange.svg)](https://api.madadgaar.com.pk/api)
  [![Built by Code-XA](https://img.shields.io/badge/Built_by-Code--XA-6C63FF.svg)](https://github.com/code-xa)
  [![License](https://img.shields.io/badge/License-Private-red.svg)]()
</div>

---

## Live & Version Info

| Item | Details |
|------|---------|
| **Production website** | [https://madadgaar.com.pk](https://madadgaar.com.pk) |
| **API base URL** | [https://api.madadgaar.com.pk/api](https://api.madadgaar.com.pk/api) |
| **Current version** | `v0.1.03` |
| **Production branch** | `main` (Create React App) |
| **Migration branch** | `nextjs` (Next.js 15 App Router  in progress) |
| **Repository** | [github.com/Madadgaar3377/madagaar-frontend](https://github.com/Madadgaar3377/madagaar-frontend) |
| **Designed & developed by** | [Code-XA](https://github.com/code-xa)  [code-xa.web.app](https://code-xa.web.app) |
| **Last major update** | June 2026  Installment cash/discount pricing display, dashboard caching, SEO improvements |

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installment Pricing (Public Display Rules)](#installment-pricing-public-display-rules)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Modules & Components](#key-modules--components)
- [SEO & Performance](#seo--performance)
- [Deployment](#deployment)
- [Branches](#branches)
- [Documentation](#documentation)
- [Related Panels](#related-panels)
- [Built By  Code-XA](#built-by--code-xa)
- [Team & Contact](#team--contact)
- [License](#license)

---

## Overview

Madadgaar Expert Partner is the **public-facing website** for the Madadgaar ecosystem. It connects users across Pakistan with verified partners for:

- **Properties**  buy, sell, rent, and apply online
- **Installment plans**  multi-vendor products, variants, cash & EMI options
- **Loans**  browse plans and submit applications
- **Insurance**  plans, applications, and claim submission
- **User dashboard**  track applications, profile, and security settings

The frontend talks to the shared Node.js backend (`backend-Nodejs-Express`) and works alongside the **Admin**, **Partner**, and **Agent** panels in the Madadgaar monorepo.

### Mission

Simplify access to essential financial and lifestyle services through one trusted platform.

### Vision

Become Pakistan's largest and most trusted marketplace for service and financial solutions.

---

## Features

### Marketplace & Listings

- Multi-category marketplace: Property, Installments, Loans, Insurance
- Advanced search, filters, sorting (city, category, price, monthly EMI)
- Product detail pages with image galleries, specs, and share buttons
- Side-by-side **product comparison** for installment plans
- Related products and category-based suggestions
- Partner/company branding on listings (logos, finance info)

### Installments (highlight)

- **Listing page** with best-plan highlights, finance badges, and filters
- **Product detail** with Cash / Installments / Both views
- **Variant picker** (RAM, storage, color, etc.) with per-variant plans
- **Multi-partner cash offers**  base price, variant overrides, partner SKUs
- **Payment plan breakdown**  monthly, down payment, markup, total cost, schedule
- **Apply flow**  select variant, plan, or partner cash offer
- **Installment reviews** on product pages
- **Smart public pricing display** (see [Installment Pricing](#installment-pricing-public-display-rules))

### Properties

- Property listings with transaction type filters
- Detail pages with rent/sale/booking amounts
- Online property application flow

### Loans & Insurance

- Plan listing and detail pages
- Online apply forms with validation
- Insurance claim submission (`/submit-claim`)

### User Account & Dashboard

- Login, register, OTP verification, forgot/reset password
- Google OAuth success handler
- User dashboard with applications overview
- **Dashboard caching** (5-minute localStorage cache, background refresh)
- Profile, security, and delete-account pages

### Content & Marketing

- Blog with slug-based detail pages
- FAQ, About, Offers, Services, Contact
- Team member profiles
- App download pages and banners
- WhatsApp floating button
- AdSense integration with route-aware refresh

### UX & Technical

- Mobile-first responsive design (Tailwind CSS)
- Framer Motion animations and skeleton loaders
- Toast notifications
- Protected dashboard routes
- SEO component with Open Graph, Twitter Cards, canonical URLs
- PWA manifest, robots.txt, sitemap.xml
- React Helmet Async for dynamic meta tags

---

## Installment Pricing (Public Display Rules)

Pricing logic is centralized in `src/utils/installmentPricing.js` and rendered via `src/components/CashPriceDisplay.jsx`.

| Partner enters | Website shows |
|----------------|---------------|
| **Only cash price** OR **only discounted price** | Single price shown as cash price |
| **Both cash + discounted** (or cash + discount %) | **Discounted price** + ~~original cash~~ + **discount %** |

**Used on:** installment listing cards, product detail hero, cash-by-partner tab, payment plans, apply summary, compare page, related products.

**Data fields from API:** `price`, `discountPercent`, variant overrides (`cashPrice`, `discountPercent`), `partnerPricing`, `paymentPlans[].cashPrice`.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19.2, React DOM 19.2 |
| Routing | React Router DOM 7.9 |
| Styling | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| HTTP | Axios, native `fetch` |
| Animation | Framer Motion 12.23 |
| Icons | Lucide React |
| SEO | React Helmet Async 2.0 |
| Charts | Recharts 3.4 |
| Notifications | React Hot Toast 2.6 |
| Build (main) | Create React App (react-scripts 5.0) |
| Build (nextjs branch) | Next.js 15.5 App Router |

---

## Project Structure

```
madagaar-frontend/
├── public/
│   ├── Media/                    # Brand images & assets
│   ├── favcions/                 # Favicons
│   ├── index.html
│   ├── manifest.json             # PWA manifest
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── Accounts/                 # Auth pages (login, register, OTP, reset)
│   ├── components/               # Shared UI (SEO, CashPriceDisplay, ShareButtons, etc.)
│   ├── compontents/              # Layout (Navbar, Footer, Loader, ProtectedRoute)
│   ├── constants/                # apiUrl, cities, categories, team data
│   ├── hooks/                    # useAdSenseRouteRefresh
│   ├── pages/
│   │   ├── clients/              # All public & dashboard views
│   │   │   ├── Installment/      # Listings, detail, apply, admin plans
│   │   │   ├── Properties/
│   │   │   ├── Loans/
│   │   │   ├── Insurance/
│   │   │   ├── CompareProduct/
│   │   │   ├── Dashboard/
│   │   │   ├── blogs/
│   │   │   └── ...
│   │   └── 404Page.jsx
│   ├── utils/
│   │   ├── auth.js               # Token, user, logout, dashboard cache clear
│   │   ├── installmentPricing.js # Installment price engine & display rules
│   │   └── applicationPlanDetails.js
│   ├── App.js                    # Routes & layout
│   ├── index.js
│   └── index.css
│
├── package.json                  # v0.1.03
├── tailwind.config.js
├── CHANGELOG.md
├── DEPLOYMENT.md
└── README.md
```

> **Next.js branch (`nextjs`):** views live under `src/views/` and routes under `src/app/`  same features, migrating to Next.js.

---

## Routes

### Public

| Route | Page |
|-------|------|
| `/` | Home |
| `/about` | About |
| `/offers` | Offers |
| `/download-app` | Download app |
| `/faq` | FAQ |
| `/contact` | Contact |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog article |
| `/properties` | Property listings |
| `/property/:id` | Property detail |
| `/property/:id/apply` | Apply for property |
| `/installments` | Installment listings |
| `/installment/:id` | Installment detail |
| `/installment/:id/apply` | Apply for installment |
| `/installment/product/CompareProduct/:id` | Compare products |
| `/loans` | Loan listings |
| `/loans/:id` | Loan detail |
| `/loans/:id/apply` | Apply for loan |
| `/insurance` | Insurance listings |
| `/insurance/:id` | Insurance detail |
| `/insurance/:id/apply` | Apply for insurance |
| `/submit-claim` | Insurance claim |
| `/terms-and-conditions` | Terms |
| `/privacy-policy` | Privacy |
| `/delete-account` | Delete account request |

### Authentication

| Route | Page |
|-------|------|
| `/account` | Login |
| `/account/register` | Register |
| `/account/verify-otp` | OTP verification |
| `/account/forgot` | Forgot password |
| `/account/reset` | Reset password |
| `/auth/success` | Google OAuth callback |

### Dashboard (authenticated)

| Route | Page |
|-------|------|
| `/dashboard` | Applications overview |
| `/dashboard/profile` | Profile settings |
| `/dashboard/security` | Security settings |
| `/dashboard/delete-account` | Delete account |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ recommended (14+ minimum)
- **npm** or **yarn**
- **Git**

### Installation

```bash
git clone https://github.com/Madadgaar3377/madagaar-frontend.git
cd madagaar-frontend
npm install
```

> `.npmrc` uses `legacy-peer-deps=true` for React 19 compatibility with `react-helmet-async`.

### Development

```bash
npm start
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production build

```bash
npm run build
```

Output: `build/` folder (CRA)  ready for Vercel, Netlify, or static hosting.

### Tests

```bash
npm test
```

---

## Environment Variables

Create `.env` in the project root:

```env
# API (optional  default is production API in src/constants/apiUrl.js)
REACT_APP_API_URL=https://api.madadgaar.com.pk/api

# Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# App metadata
REACT_APP_NAME=Madadgaar Expert Partner
REACT_APP_VERSION=0.1.03
```

**Default API** (hardcoded fallback):

```js
// src/constants/apiUrl.js
const backendBaseUrl = 'https://api.madadgaar.com.pk/api';
```

For local backend development, change to `http://localhost:3001/api`.

---

## Key Modules & Components

### `installmentPricing.js`

Central engine for installment catalog pricing:

- `resolvePriceDisplay()`  public cash/discount display rules
- `getProductPriceDisplay()`  product/variant hero pricing
- `getInstallmentCardPricing()`  listing card primary + cash line
- `buildPartnerCashOffers()`  multi-partner cash price aggregation
- `getBestPaymentPlan()`  lowest monthly / best cash plan
- `resolveEntryCashPrice()`  plan row calculation price
- `buildPlanEntries()`  variant + plan matrix for detail/apply pages

### `CashPriceDisplay.jsx`

Reusable UI for single or discounted prices (strikethrough + % off).

### `SEO.jsx`

Dynamic meta tags, Open Graph, Twitter Cards, structured data.

### `UserDashboard.jsx`

Application tracking with localStorage cache (5 min TTL) and manual refresh.

### `ShareButtons.jsx`

Share product/installment details including formatted price lines.

---

## SEO & Performance

- Per-page `<SEO />` titles, descriptions, canonical URLs
- Structured data on blog, property, and team pages
- Lazy-loaded images and skeleton loaders
- AdSense slots with route-change refresh hook
- Mobile-friendly layouts and semantic HTML
- `robots.txt` + `sitemap.xml` in `public/`

---

## Deployment

**Live production:** [madadgaar.com.pk](https://madadgaar.com.pk)

### Quick deploy (Vercel / Netlify)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output directory | `build` |
| Install command | `npm install` |

SPA routing: configure rewrites so all routes serve `index.html`.

Full guide: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## Branches

| Branch | Stack | Status |
|--------|-------|--------|
| `main` | Create React App + React Router | **Production / live** |
| `nextjs` | Next.js 15 App Router | Migration in progress |

When working on the Next.js migration, use `src/views/` for page components and `src/app/` for route entry points. Pricing utilities (`installmentPricing.js`, `CashPriceDisplay.jsx`) are shared across both branches.

---

## Documentation

| File | Description |
|------|-------------|
| [README.md](./README.md) | Project overview (this file) |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and feature log |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel, Netlify, cPanel, Docker guides |

---

## Related Panels

This frontend is one part of the Madadgaar platform:

| Panel | Role |
|-------|------|
| **madagaar-frontend** (this repo) | Public website for users |
| **admin** | Admin portal  manage listings, users, approvals |
| **partner-panel** | Partner portal  create/edit installment plans, pricing |
| **agentPanel** | Agent portal  field operations |
| **backend-Nodejs-Express** | Shared REST API |

---

## Built By  Code-XA

This platform is **designed, developed, and maintained** by **[Code-XA](https://github.com/code-xa)**  a technology company focused on building innovative digital products that drive growth and enhance user experience.

| | |
|--|--|
| **GitHub** | [github.com/code-xa](https://github.com/code-xa) |
| **Website** | [code-xa.web.app](https://code-xa.web.app) |
| **Email** | thecodexaoffical@gmail.com |
| **Lead engineer** | [Abubakkar Sajid](https://github.com/Innocent-Developer) (@Innocent-Developer) |

**Code-XA** delivered the full Madadgaar ecosystem including this public frontend, admin panel, partner panel, agent panel, and backend API  with ongoing feature work such as installment pricing, multi-vendor plans, dashboard caching, SEO, and the Next.js migration.

---

## Team & Contact

### Leadership

- **Raja Afzal**  Founder & CEO  ceo@madadgaar.com.pk  +92 310 4179363
- **Saud Ch**  Director & CEO  saud.ch@madadgaar.com.pk  +92 307 111 333 0

### Operations

- **Ayesha**  Head of Marketing & Operations  ayesha@madadgaar.com.pk

### Technology (Code-XA)

- **Abubakkar Sajid**  Head of IT & Innovation | Lead Software Engineer @ [Code-XA](https://github.com/code-xa)
  - abubakkarsajid4@gmail.com | +92 324 185 147 6
  - [GitHub](https://github.com/Innocent-Developer) · [LinkedIn](https://www.linkedin.com/in/mughal-abubakkar/) · [Code-XA](https://github.com/code-xa)

### Company

| | |
|--|--|
| **Website** | [madadgaar.com.pk](https://madadgaar.com.pk) |
| **Support** | support@madadgaar.com.pk |
| **Developer** | developer@madadgaar.com.pk |
| **Phone** | +92 307 111 333 0 |
| **Address** | Gulberg III, Lahore, Pakistan |

---

## License

Proprietary and confidential. All rights reserved by **Madadgaar Expert Partner**.

© 2024–2026 Madadgaar Expert Partner.

**Designed & developed by [Code-XA](https://github.com/code-xa)** · [code-xa.web.app](https://code-xa.web.app)

---

<div align="center">
  <strong>Built with care in Pakistan</strong>
  <br/><br/>
  <em>v0.1.03  Live at <a href="https://madadgaar.com.pk">madadgaar.com.pk</a></em>
  <br/>
  <em>Developed by <a href="https://github.com/code-xa">Code-XA</a></em>
</div>
