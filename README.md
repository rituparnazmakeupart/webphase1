# Rituparna'z Makeup Art & Academy — Static Website

## 1. Project overview
A mobile-first, build-free HTML5/CSS3/vanilla-JavaScript website inspired by the supplied wireframe guide: dark editorial canvas, oversized high-contrast serif typography, lavender/pink editorial shapes, organic hero/intro overlap, arch-shaped portfolio cards, process band, statistics, and outlined contact CTA.

## 2. Folder structure
```
/
  index.html
  about.html
  contact.html
  faq.html
  privacy-policy.html
  terms.html
  thank-you.html
  404.html
  /makeup-academy/
  /services/
  /assets/images/hero/
  /assets/images/logo/
  /assets/images/work/
  /assets/images/placeholders/
  /css/style.css
  /js/config.js
  /js/site.js
  /seo/README.md
  CONFIG.md
  DEPLOYMENT.md
```

## 3. Replace the logo
Replace `assets/images/logo/logo.svg` and keep the filename. Header and footer will continue to work if the logo dimensions change moderately.

## 4. Replace images
Replace files in `assets/images/` with your actual project photography while preserving filenames. Service pages use category folders so the supplied ZIP images are clearly distinguished as `bridal-01`, `party-01`, `reception-01`, `haldi-01`, `nail-art-01`, and `rice-ceremony-01`.

## 5. Update phone
Edit `phone` and `phoneDisplay` in `js/config.js`.

## 6. Update WhatsApp
Edit `whatsapp` in `js/config.js` using country code + number with no spaces.

## 7. Update email
Edit `email` in `js/config.js`.

## 8. Update address
Edit `address` in `js/config.js`.

## 9. Update domain
Edit `websiteUrl` in `js/config.js`, then update `CNAME` and `sitemap.xml` when the production domain changes.

## 10. Configure the form endpoint
Set `formEndpoint` in `js/config.js` only to a real server-side endpoint that validates, sanitizes and rate-limits requests. WhatsApp remains the primary front-end enquiry destination.

## 11. Configure GA4
Set `ga4` in `js/config.js` to a real Google Analytics 4 measurement ID. No personal form data is sent to analytics events.

## 12. Update sitemap
When you add or remove indexable URLs, edit `sitemap.xml` and make sure every URL matches the canonical strategy.

## 13. Deploy
Upload the directory as-is to GitHub Pages, Netlify, Vercel static hosting, Cloudflare Pages, Apache, Nginx or traditional shared hosting. There is no build step.

## 14. Test
Open the home page, each academy page and each service page. Test the mobile menu, dropdown, accordion, lightbox, booking modal, academy enrolment modal, WhatsApp links and contact-page map.

## 15. SEO checklist
Unique title and description, one H1 per page, canonical URL, indexability directive, semantic headings, internal links, breadcrumbs, JSON-LD, Open Graph, Twitter metadata, sitemap and robots.

## 16. Core Web Vitals checklist
Hero images are eager-loaded; lower-page images are lazy-loaded; image dimensions are declared; CSS is lightweight; JavaScript is deferred; the embedded Google Map is lazy-loaded on the contact page.

## 17. Production launch checklist
Replace final photography, confirm logo, confirm phone/WhatsApp/email, confirm domain and CNAME, connect the optional server-side form endpoint, configure GA4, test Google Maps embed, validate all internal links and submit the sitemap in Search Console.

### Security note
Never place API keys, private credentials or secrets in frontend files. Server-side form handling should validate and sanitize input, rate-limit abuse, apply spam prevention and add CSRF protection where applicable.
