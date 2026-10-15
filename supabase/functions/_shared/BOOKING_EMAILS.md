# Reservation and payment email redesign

## Scope
- Existing request notifications, customer payment links, receipts, final scheduled-outing confirmations and admin payment notices.
- Shared renderer: `bookingEmail.ts`; optional read-only persisted context: `bookingEmailContext.ts`.
- Existing Resend gateway, sender/Reply-To, recipients, trigger timing, notification dedupe keys, leases and payment/seat rules are unchanged. RPC notification payloads retain their existing HTML shape; the dispatcher derives equivalent plain text when text is not present.
- Manual date link does not promise automatic confirmation. Final confirmation remains conditional on the existing successful `confirm_event_seats` path. Admin payment notice occurs before seat confirmation and therefore says payment received, not confirmed.
- Missing sources are omitted or marked pending; catalog prices are never silently substituted for an agreed historical total. Estimated sources are explicitly supported/labeled by the renderer. Only an exact official-rate persisted deposit can establish a historical total; discounts follow the current admin display calculation.

## Review
- Open `/email-previews/index.html` in preview: 11 fictional examples, each with HTML and text. Payment URLs are deliberately invalid examples; do not use them for checkout.
- Regenerate from the real renderer: `deno run --allow-write=public/email-previews scripts/preview-booking-emails.ts`.
- Fixtures use reserved `.test` addresses, no database or email connection.
- 1280px and 390px previews inspected: logo loads, readable layout, no horizontal overflow. Table/inline markup and Outlook conditional wrapper are used, but actual Gmail/Outlook delivery/client rendering is not verified because no sending was authorized.
- Logo is the real existing WebP asset at the verified public domain; header includes visible brand text and an alt label when images are blocked or unsupported.

## Deployment remains pending
No functions deployed and no website published. When explicitly authorized, deploy `submit-request`, `create-payment-link`, `create-activity-deposit`, `payments-webhook`, `retry-notification` together (the last shares the dispatcher). No schema migration needed. Already-persisted notifications keep their original body on retry; do not rewrite history or change dedupe keys to resend them.