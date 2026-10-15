# Payhip integration notes

Read from Payhip's current documentation (October 2026):

- **Buy buttons / overlay:** load `https://payhip.com/payhip.js` and use `<a class="payhip-buy-button" data-product="KEY" data-method="overlay" href="https://payhip.com/b/KEY">`. Without JavaScript the same link opens Payhip's page. A direct checkout link is `https://payhip.com/buy?link=KEY`. The Store uses the overlay button with the plain link as fallback.
- **Webhooks:** Payhip documents four events (`paid`, `refunded`, `subscription.created`, `subscription.deleted`), set under Settings > Developer. The site handles `paid` and `refunded` only. Failed deliveries retry hourly for up to 3 hours, so processing is idempotent by transaction id.
- **Webhook signature:** Payhip's `signature` is `sha256(your API key)`, a shared secret, not an HMAC of the payload. It proves less than a normal signature. The site checks it, and also supports an optional secret `PAYHIP_WEBHOOK_TOKEN` in the webhook URL (`?token=...`).
- **Coupons:** Payhip has a coupon API, but I found no Payhip documentation for applying a code through a link. So the site never changes a displayed price and only mentions a code when the owner has ticked "I created this code in Payhip" in the banner settings.

Setup (Cloudflare secrets): `PAYHIP_API_KEY` (required for the webhook) and `PAYHIP_WEBHOOK_TOKEN` (recommended). Then in Payhip > Settings > Developer set the webhook URL to `https://YOUR-SITE/api/payhip-webhook?token=YOUR_TOKEN` and tick paid and refunded.

Limits to know:

- Payhip is the source of truth for charges. Prices on this site are typed in by hand.
- Orders appear in Admin > Orders only from verified webhook events. Nothing is estimated.
- Helix's Payhip account only covers Helix's own products. Seller listings link to the seller's own Payhip page, so the site shows sellers no sales or earnings.
- `native` (site-delivered) products exist in the data model but cannot be published until a payment provider and file storage are set up.
- Free downloads are links. "Sign-in only" free products never send the link to signed-out visitors, but a link you paste into the product is as public as the file host you chose.
