# Deployment

This is a build-free static website. Upload the contents of this project directory to your hosting root.

## GitHub Pages
1. Create a repository.
2. Upload the project files and folders.
3. Enable GitHub Pages from the repository settings.
4. For a custom domain, keep the `CNAME` file and set the registrar DNS as documented by GitHub.

## Netlify / Cloudflare Pages / Vercel
Deploy the project root as a static site with no build command and no publish-directory transform.

## Shared hosting / Apache / Nginx
Upload files to the document root. The site does not require `.htaccess` for core functionality.

## Before launch
Replace photography under `assets/images/` where desired, verify the production domain in `js/config.js`, and configure `FORM_ENDPOINT` or `GA4` only when you have real endpoints / measurement IDs.
