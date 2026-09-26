# ROI LOAN EXPERTS — Website

**The Right Loan. The Right Bank. The Right Guidance.**

A complete, premium, fully responsive static website for **ROI Loan Experts**, a loan
assistance and DSA (Direct Selling Agent) company. Brand theme: **Red + White + Charcoal**.

Founder — **Abdul Haq Khan** · CEO — **Shahnawaz Khan**

---

## 1. Quick start

The site is 100% static — no build step or runtime is needed to run it.

1. Copy this folder to any web server, GitHub Pages / Netlify / Vercel / cPanel, or simply
   double-click `index.html` (works from `file://` too).
2. Open `index.html` in a browser.

To serve it locally with a nice URL, any static server works:

```powershell
# PowerShell
powershell -ExecutionPolicy Bypass -Command "python -m http.server 8000"   # if python exists
# or
npx serve .
```

---

## 2. What's inside

```
index.html                 Homepage
about.html                 About Us
loans.html                 Loan Products hub + comparison table
personal-loan.html         Product pages (7)
business-loan.html
home-loan.html
vehicle-loan.html
education-loan.html
loan-against-property.html
gold-loan.html
financial-services.html    Insurance / Financial Services
how-it-works.html          4-step process
documents.html             Document check & checklists
why-choose-us.html         Why ROI Loan Experts
contact.html               Contact + enquiry form
apply.html                 Apply for Loan (eligibility wizard)
faq.html                   FAQ (+ FAQPage schema)
privacy-policy.html        Privacy Policy
terms.html                 Terms & Conditions
disclaimer.html            Disclaimer

assets/
  css/main.css             Design system (tokens, header, cards, forms, wizard…)
  css/pages.css            Interior-page modules (TOC, spec sheets, legal…)
  js/main.js               All interactivity (vanilla, no dependencies)
  img/favicon.svg          Brand mark
  img/og-cover.svg         Social share cover
  img/icons.html           Inline SVG sprite  ← lives in build/parts (see below)

build/
  build.ps1                One-command rebuild of all 20 pages
  parts/                   Shared partials (head, header, footer, icon sprite)
  pages/                   Page bodies with @meta front matter
```

### Pages built by `build\build.ps1`

The 20 `.html` files in the root are **generated** from `build\pages\*.html` (content) +
`build\parts\*.html` (shared chrome). They are committed so the site works standalone.

- **To edit content**: edit the file in `build\pages\`, then rebuild.
- **To edit the shared header/footer/head**: edit the file in `build\parts\`, then rebuild.

```powershell
powershell -ExecutionPolicy Bypass -File .\build\build.ps1
```

> If you prefer, the generated root `.html` files can be edited directly — just remember a
> rebuild would overwrite them.

---

## 3. Making it fully live (the 6 things to connect)

Everything below has a marked placeholder so the site is honest and functional today.

### 3.1 Contact details & WhatsApp  →  `assets\js\main.js`

```js
window.ROI.config = {
  formEndpoint: '',          // ← e.g. 'https://formspree.io/f/xxxxxx' (or Web3Forms / your API)
  whatsapp: '',               // ← international format digits only, no '+'. e.g. '919876543210'
  phone: '',
  email: '',
  address: '',
  hours: ''
};
```

| Setting | Effect |
|---|---|
| `formEndpoint` | All forms POST as JSON here. **Leave empty** and forms run in local demo mode (validation + success state still work). |
| `whatsapp` | Turns the floating WhatsApp button, mobile bar and drawer links into real `wa.me` links. Until set, they point to `contact.html`. |
| `phone` / `email` / `address` / `hours` | Replace the "To be added" lines in the footer & contact panel. |

### 3.2 Domain / canonical URLs  →  `build\build.ps1`

```powershell
powershell -ExecutionPolicy Bypass -File .\build\build.ps1 -BaseUrl "https://www.yourdomain.com"
```

This rewrites the `<link rel="canonical">`, Open Graph / Twitter URLs and the sitemap.

### 3.3 Social links  →  `build\parts\footer.html`

Five `href="#"` placeholders (Instagram, Facebook, LinkedIn, YouTube, WhatsApp).

### 3.4 Partner logos  →  partner tiles

`build\pages\index.html` and `build\pages\about.html` contain neutral
"BANK PARTNER 01 / NBFC PARTNER 01 / INSURANCE PARTNER" placeholder tiles. Replace the
`.brandwall` block with real logos **only after official authorisation**.

### 3.5 Testimonials  →  `build\pages\index.html`

Three clearly marked placeholder testimonials with a "Placeholder content" tag. Swap in
genuine, verified customer feedback with permission.

### 3.6 Google Fonts

`build\parts\head.html` loads **Plus Jakarta Sans** (headings) + **Inter** (body) from
Google Fonts. To self-host, download the WOFF2 files into `assets\fonts\`, add `@font-face`
rules in `main.css`, and remove the two Google Fonts `<link>` tags.

---

## 4. Features

- **20 fully linked pages**, sticky header with a Loans mega-menu, mobile drawer with
  focus trap, floating CTAs and a mobile action bar.
- **6-step eligibility wizard** (index + apply) with per-step validation, progress bar,
  keyboard support (Enter advances), and a non-promissory success message.
- **Working enquiry / document-check forms** with inline validation, honeypot spam
  protection, and a configurable JSON endpoint.
- **Testimonial carousel** (auto-play, arrows, dots, touch swipe), **FAQ accordions**,
  **scroll-reveal** animations, **count-up stats**, **TOC scrollspy** on long pages.
- **SEO**: unique title/description per page, canonicals, Open Graph/Twitter cards,
  JSON-LD (`FinancialService` + `WebSite` + `FAQPage`), `sitemap.xml`, `robots.txt`,
  semantic H1→H4 hierarchy, descriptive icon alt/aria labels, skip link.
- **Accessibility**: keyboard-navigable menus, `aria-expanded`/`aria-current`/`aria-live`,
  focus rings, `prefers-reduced-motion` support.
- **Responsive**: verified at 360, 480, 768, 992, 1200 and 1440 px; overflow safety net
  (`overflow-x: clip` + grid `min-width: 0`).

### Honesty guardrails (by design)

- No "100% approval", "guaranteed loan" or "lowest rate" claims anywhere.
- Lenders, partners and testimonials are explicitly marked placeholders.
- Every page carries the message that **approval, rate, amount and terms are decided by
  the respective bank or financial institution**.
- Counters only describe the site's own structure (categories, steps), never financial results.

---

## 5. Tech notes

- No frameworks, no bundler, no runtime dependencies. One CSS file + one JS file.
- All icons are inline SVG `<symbol>`s (zero extra requests, work from `file://`).
- Fonts are optional CDN links; the site degrades gracefully to system fonts.
- Print stylesheet included.
- `.htaccess` example for clean URLs (optional):

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(personal-loan|home-loan|gold-loan)$ $1.html [L]
```
