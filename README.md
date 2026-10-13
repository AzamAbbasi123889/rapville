# RAPVILLE — GitHub Pages website demo

This is the **static GitHub Pages version** of the RAPVILLE redesign. Open `index.html` or upload this folder to a GitHub repository and enable Pages. It does not require Node.js, npm, a server, or a build step.

## Included files

- `index.html` — the full responsive landing page, SEO metadata, structured data, services, strategy-call questionnaire, FAQs, social links and chatbot interface.
- `styles.css` — mobile/laptop styling. The supplied screenshots are displayed at their natural proportions so captions and view counts are not cropped.
- `app.js` — multi-step form and chatbot behaviour, including a no-backend demo mode.
- `config.js` — safe, public configuration for an optional form endpoint, chatbot backend and scheduling URL. Never put private API keys here.
- `privacy.html` — draft privacy notice; RAPVILLE must review it and complete the contact/legal details before launch.
- `assets/` — supplied images converted to WebP, favicon and social preview graphic. The original collage screenshot (`r1.webp`) is featured intact in the hero; individual supplied images appear in the portfolio gallery.
- `robots.txt` and `sitemap.xml` — starter SEO files; update their URLs to the final deployed address before submitting the sitemap to Search Console.

The two MP4s are embedded from RAPVILLE's existing Wix video CDN URLs discovered in the saved page captures. They stream over the internet; they are not stored as local MP4 files in this ZIP. If those source URLs change, replace them in `index.html` with approved hosted video URLs.

## Upload to GitHub Pages

1. Download and extract the ZIP.
2. Create a GitHub repository (for example, `rapville-demo`).
3. Upload the **contents** of this folder into the repository root. `index.html` should be visible at the top level, beside `styles.css`, `app.js`, `config.js`, `privacy.html` and `assets/`.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**, select branch `main` and folder `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site. It will show the live URL, usually `https://YOUR-USERNAME.github.io/REPOSITORY/`.
7. Test it on mobile and laptop. Keep the complete `assets/` folder; the image URLs are relative so the project also works in a GitHub project subfolder.

For a quick local preview, double-click `index.html`. Some browsers restrict browser storage when opened as a `file://` URL; use GitHub Pages or a local preview server such as VS Code Live Server for a more reliable test. Fonts and videos need an internet connection.

## Form behaviour on GitHub Pages

GitHub Pages only hosts static files. **By default this demo does not email or deliver lead submissions to RAPVILLE.** The form validates its three steps and saves a small number of test submissions in the visitor's own browser local storage when permitted, then explicitly tells the visitor it is demo mode.

To receive actual enquiries:

1. Create a form in a hosted form service that supports browser submissions (for example, Formspree) and copy its HTTPS submission endpoint.
2. Open `config.js` and set `formEndpoint` to that exact URL, for example:

   ```js
   formEndpoint: "https://formspree.io/f/YOUR_FORM_ID",
   ```

3. Submit a test enquiry on the deployed website and verify it arrived at the intended inbox. Configure spam protection, allowed domains and retention in the form service as appropriate.

The endpoint is public by nature; do not use a private API key as a form endpoint. If the form provider requires a different payload format, adjust `postLead()` in `app.js` to match the provider's documented browser integration.

## Chatbot and AI

The chatbot includes built-in responses for services, pricing approach, platform support, locations, booking and viral guarantees. It asks the visitor for name, email and phone/WhatsApp first, as requested. With no endpoint configured, responses are FAQ-based; no AI API key is needed.

To add AI responses, deploy a secure backend that exposes an HTTPS endpoint accepting `POST` JSON in this shape:

```json
{"message":"How does the service work?","history":[{"role":"user","content":"..."}]}
```

and returns JSON such as:

```json
{"reply":"RAPVILLE brings strategy, filming and editing together..."}
```

Then set `chatEndpoint` in `config.js` to that endpoint. Keep the OpenAI API key on the backend (environment variable/secret manager), never in `config.js`, HTML or JavaScript. The browser-side demo does not include or need an OpenAI key.

## Direct strategy-call booking

Set `bookingUrl` in `config.js` to the team's real Calendly, Cal.com or other HTTPS booking page. Until then, the inquiry form requests a call rather than pretending a timeslot has been booked.

## SEO before sharing or launching

The page has descriptive metadata, semantic headings, image alt text, FAQ content, JSON-LD `ProfessionalService` structured data and crawlable page copy. It cannot guarantee Google rankings or enquiries.

Before publishing the final public version:

- Update the `og:url` and `og:image` in `index.html` to absolute URLs for the actual published site. The Open Graph image URL must point to `assets/og-preview.jpg` at that live host.
- Add a canonical URL once the final canonical domain/path is known. Do not canonicalise the demo to the old page unless that is intentional.
- Update `sitemap.xml` with your exact GitHub Pages/custom-domain URLs and the matching host in `robots.txt`, then submit the sitemap in Google Search Console.
- Confirm all view-count/follower-growth creative is approved for use and described as historical examples—not guaranteed future outcomes.
- Replace the placeholder privacy contact information and review the privacy text against the actual form/analytics/hosting providers.
- Configure a real form endpoint, test lead delivery, add the real booking URL, and only add an AI backend after its security and privacy behaviour has been verified.
- Keep API secrets server-side; a browser-only site cannot safely hide them.

## RAPVILLE social profiles

- Instagram: https://www.instagram.com/rapvilleuk/
- LinkedIn: https://www.linkedin.com/company/rapville-uk/
- Facebook: https://www.facebook.com/people/Rapvilleuk/61572956439031/
