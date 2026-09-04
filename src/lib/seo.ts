// www is the domain that actually serves content — the bare domain 307s to
// this one, and LinkedIn/WhatsApp's crawlers don't follow redirects for
// og:image, so this must point straight at the serving host.
export const SITE_URL = "https://www.myfundinglist.com";
export const SITE_NAME = "MyFundingList";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-preview.jpg`;
