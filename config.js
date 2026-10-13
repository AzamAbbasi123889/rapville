/* RAPVILLE GitHub Pages configuration.
   This file is public. Never put an OpenAI API key, email password or other secret here. */
window.RAPVILLE_CONFIG = {
  // Add the HTTPS endpoint from a form service (for example, a verified Formspree form) to deliver leads.
  // If blank, this site runs in demo mode and stores only browser-local test submissions.
  formEndpoint: "",

  // Optional HTTPS endpoint for YOUR secure AI chat backend. Do not put an OpenAI API key in this file.
  // The endpoint should accept POST JSON { message, history } and respond with { reply }.
  chatEndpoint: "",

  // Optional real booking URL (Calendly / Cal.com). Keep blank until you have the correct link.
  bookingUrl: "",

  brandName: "RAPVILLE",
  contactEmail: "",
  instagramUrl: "https://www.instagram.com/rapvilleuk/",
  linkedinUrl: "https://www.linkedin.com/company/rapville-uk/",
  facebookUrl: "https://www.facebook.com/people/Rapvilleuk/61572956439031/"
};
