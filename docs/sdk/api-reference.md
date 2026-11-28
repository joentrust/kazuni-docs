---
sidebar_position: 7
title: API Reference
description: The raw REST surface behind the Kazuni SDK
---

# API Reference

This page documents the Kazuni REST API directly, for cases where you're not using the SDK - a
different language, a serverless function that wants to avoid a dependency, or curiosity about
what the SDK is doing under the hood.

**The public API surface today is small and deliberately so.** This page documents every endpoint
that exists and nothing else: three for email and identity, plus nine for
[contact management](#contacts). If you're looking for webhooks, scheduled sends, or SMS and
WhatsApp delivery - none of that exists yet. See
[SDK Overview](/docs/sdk/overview#whats-not-here-yet) for the full list of what's not here yet.

## Endpoints

<div className="kz-endpoints">
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--post">POST</span>
<div>
<div className="kz-endpoint-path">/v1/emails/send</div>
<div className="kz-endpoint-desc">Queue a single email for delivery. Returns immediately with an id and a status of <code>queued</code>.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--get">GET</span>
<div>
<div className="kz-endpoint-path">/v1/emails/:id</div>
<div className="kz-endpoint-desc">Retrieve one email and its current delivery status.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--get">GET</span>
<div>
<div className="kz-endpoint-path">/v1/me</div>
<div className="kz-endpoint-desc">Return the organization and permissions attached to the API key in use.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--get">GET</span>
<div>
<div className="kz-endpoint-path">/v1/contacts</div>
<div className="kz-endpoint-desc">List contacts, with optional search and list filtering.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--post">POST</span>
<div>
<div className="kz-endpoint-path">/v1/contacts</div>
<div className="kz-endpoint-desc">Create a contact from one or more identifiers.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--post">POST</span>
<div>
<div className="kz-endpoint-path">/v1/contacts/upsert</div>
<div className="kz-endpoint-desc">Create or update a contact, matched by identifier.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--get">GET</span>
<div>
<div className="kz-endpoint-path">/v1/contacts/:id</div>
<div className="kz-endpoint-desc">Retrieve one contact with its identifiers and per-channel consent.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--patch">PATCH</span>
<div>
<div className="kz-endpoint-path">/v1/contacts/:id</div>
<div className="kz-endpoint-desc">Update a contact's name fields or metadata.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--delete">DELETE</span>
<div>
<div className="kz-endpoint-path">/v1/contacts/:id</div>
<div className="kz-endpoint-desc">Delete a contact and all of its identifiers.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--post">POST</span>
<div>
<div className="kz-endpoint-path">/v1/contacts/:id/identifiers</div>
<div className="kz-endpoint-desc">Attach another email or phone to an existing contact.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--delete">DELETE</span>
<div>
<div className="kz-endpoint-path">/v1/contacts/:id/identifiers/:identifierId</div>
<div className="kz-endpoint-desc">Remove one identifier from a contact.</div>
</div>
</div>
<div className="kz-endpoint">
<span className="kz-endpoint-verb kz-endpoint-verb--put">PUT</span>
<div>
<div className="kz-endpoint-path">/v1/contacts/:id/subscriptions/:channel</div>
<div className="kz-endpoint-desc">Set consent for one channel without touching the others.</div>
</div>
</div>
</div>

## Base URL

```
https://api.usekazuni.com
```

## Authentication

Every request needs an `Authorization` header with your API key:

```
Authorization: Bearer cl_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

See [Authentication](/docs/sdk/authentication) for the key format and where to create one.

## Rate limiting

Every response includes rate-limit headers:

| Header | Meaning |
|---|---|
| `X-RateLimit-Limit` | The maximum number of emails your organization can send per day, based on your plan. |
| `X-RateLimit-Remaining` | How many sends are left in the current rolling 24-hour window. |
| `X-RateLimit-Reset` | Unix timestamp (seconds) for when the current hourly bucket rolls off the window. |

Exceeding the limit returns `429` with:

```json
{ "error": "Rate limit exceeded" }
```

## POST /v1/emails/send

Send a single transactional email. Requires an API key with the **Send email** permission, and a
`from` address on a domain your organization has verified (see
[Sending Domains](/docs/platform/sending-domains)).

**Request body**

```json
{
  "from": "Acme <hello@acme.example>",
  "to": "customer@example.com",
  "subject": "Welcome to Acme",
  "html": "<p>Thanks for signing up.</p>",
  "text": "Thanks for signing up."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `from` | `string` | Yes | `addr@domain` or `Name <addr@domain>`. Domain must be verified. |
| `to` | `string` | Yes | A single recipient address. No `cc`, `bcc`, or multiple recipients. |
| `replyTo` | `string` or `string[]` | No | Where replies go. One address or up to 10. Defaults to the `from` address. |
| `subject` | `string` | Yes | Max 998 characters. |
| `html` | `string` | Yes | The HTML body. |
| `text` | `string` | No | Plain-text fallback. |

```bash
curl -X POST https://api.usekazuni.com/v1/emails/send \
  -H "Authorization: Bearer $KAZUNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Acme <hello@acme.example>",
    "to": "customer@example.com",
    "subject": "Welcome to Acme",
    "html": "<p>Thanks for signing up.</p>",
    "text": "Thanks for signing up."
  }'
```

**Success response** - `202 Accepted`

```json
{ "id": "3fa2e4c1-...", "status": "queued" }
```

`202` and `"queued"` mean Kazuni accepted the request for delivery, not that it has been
delivered. Poll `GET /v1/emails/:id` (below) to see what actually happened.

**Error responses**

| Status | Body | Cause |
|---|---|---|
| `400` | `{ "error": "<first validation issue>" }` | Malformed request body. |
| `401` | `{ "error": "Invalid API key" }` | Missing, malformed, or revoked key. |
| `403` | `{ "error": "API key lacks required permission: send" }` | Key doesn't have the send permission. |
| `403` | `{ "error": "Domain <domain> is not verified for sending. Verify it in the dashboard first." }` | `from` domain isn't verified. |
| `429` | `{ "error": "Rate limit exceeded" }` | Daily send quota exceeded. |

## GET /v1/emails/:id

Look up the status of a previously sent email. `id` is the value returned by
`POST /v1/emails/send`. This endpoint is not yet wrapped by the SDK - call it directly with
`fetch` or your HTTP client of choice, or check status from the
[Kazuni dashboard](/docs/platform/delivery).

```bash
curl https://api.usekazuni.com/v1/emails/3fa2e4c1-... \
  -H "Authorization: Bearer $KAZUNI_API_KEY"
```

**Success response** - `200 OK`

```json
{
  "id": "3fa2e4c1-...",
  "from": "Acme <hello@acme.example>",
  "to": "customer@example.com",
  "subject": "Welcome to Acme",
  "status": "delivered",
  "error": null,
  "queuedAt": "2026-07-19T09:00:00.000Z",
  "sentAt": "2026-07-19T09:00:01.000Z",
  "deliveredAt": "2026-07-19T09:00:04.000Z"
}
```

`status` is one of: `queued`, `sending`, `sent`, `delivered`, `bounced`, `complained`, `rejected`,
`failed`. See [Delivery](/docs/platform/delivery) for what each of these means.

**Error responses**

| Status | Body | Cause |
|---|---|---|
| `401` | `{ "error": "Invalid API key" }` | Missing, malformed, or revoked key. |
| `404` | `{ "error": "Email not found" }` | No email with that id belongs to your organization. |

## GET /v1/me

Returns information about the API key making the request - useful for confirming which
organization and mode (live/test) a key belongs to, and what it's allowed to do, without hard
-coding that information in your application.

```bash
curl https://api.usekazuni.com/v1/me \
  -H "Authorization: Bearer $KAZUNI_API_KEY"
```

**Success response** - `200 OK`

```json
{
  "organizationId": "org_2abc...",
  "mode": "live",
  "permissions": {
    "send": true,
    "contactsRead": false,
    "contactsWrite": false,
    "domainsRead": false
  }
}
```

**Error responses**

| Status | Body | Cause |
|---|---|---|
| `401` | `{ "error": "Invalid API key" }` | Missing, malformed, or revoked key. |

## Contacts

Contacts are people your organization sends to. A contact holds one or more **identifiers** (an
email or phone that reaches them) and a separate consent decision per channel. See
[Contacts](/docs/platform/contacts) for the concepts; this section covers the wire format.

Read endpoints require the **Contacts read** permission, write endpoints require **Contacts
write**. A key missing the permission gets `403`.

### The contact object

```json
{
  "id": "9c1f7b2e-...",
  "firstName": "Thoko",
  "lastName": "Banda",
  "metadata": { "plan": "growth" },
  "identifiers": [
    { "id": "1a2b...", "type": "email", "value": "thoko@example.com", "isPrimary": true },
    { "id": "3c4d...", "type": "phone", "value": "+265991234567", "isPrimary": true }
  ],
  "subscriptions": {
    "email": "subscribed",
    "sms": "unsubscribed",
    "whatsapp": "unsubscribed"
  },
  "createdAt": "2026-07-19T09:12:44.000Z",
  "updatedAt": "2026-07-19T09:12:44.000Z"
}
```

`subscriptions` always contains all three channels. New contacts default to `subscribed` for
email and `unsubscribed` for SMS and WhatsApp.

Phone values are normalized to E.164 before storage, so `0991 234 567` comes back as
`+265991234567`. A number that cannot be parsed returns `422`.

### Errors common to contact endpoints

| Status | Body | Cause |
|---|---|---|
| `403` | `{ "error": "API key lacks required permission: contactsWrite" }` | Key lacks the needed permission. |
| `404` | `{ "error": "Contact not found" }` | No contact with that id in your organization. Also returned for a malformed id, rather than `400`. |
| `409` | `{ "error": "contact_conflict" }` | An identifier in the request already belongs to a different contact. |
| `422` | `{ "error": "<reason>" }` | An identifier value is not a usable email or phone number. |

### GET /v1/contacts

List contacts, newest first.

| Query param | Type | Notes |
|---|---|---|
| `page` | `number` | 1-based. Defaults to `1`. |
| `limit` | `number` | Defaults to `50`, maximum `200`. |
| `q` | `string` | Free-text search across names and identifier values. |
| `listId` | `uuid` | Restrict to members of one contact list. Invalid uuid returns `400`. |

```bash
curl -G https://api.usekazuni.com/v1/contacts \
  -H "Authorization: Bearer $KAZUNI_API_KEY" \
  --data-urlencode "q=thoko" \
  --data-urlencode "limit=50"
```

**Success response** - `200 OK`

```json
{ "data": [ /* contact objects */ ], "total": 128, "page": 1, "limit": 50 }
```

### POST /v1/contacts

Create a contact. Requires at least one identifier.

```json
{
  "identifiers": [
    { "type": "email", "value": "thoko@example.com", "isPrimary": true },
    { "type": "phone", "value": "0991 234 567" }
  ],
  "firstName": "Thoko",
  "lastName": "Banda",
  "metadata": { "plan": "growth" },
  "listId": "5e6f7a8b-..."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `identifiers` | `array` | Yes | At least one. Each has `type` (`email` or `phone`), `value`, and optional `isPrimary`. |
| `firstName` | `string` | No | Max 255 characters. |
| `lastName` | `string` | No | Max 255 characters. |
| `metadata` | `object` | No | String keys to string values. Defaults to `{}`. |
| `listId` | `uuid` | No | Add the new contact to this list immediately. |

```bash
curl -X POST https://api.usekazuni.com/v1/contacts \
  -H "Authorization: Bearer $KAZUNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "identifiers": [
      { "type": "email", "value": "thoko@example.com", "isPrimary": true },
      { "type": "phone", "value": "0991 234 567" }
    ],
    "firstName": "Thoko",
    "lastName": "Banda"
  }'
```

**Success response** - `201 Created`, the contact object.

If any identifier already belongs to another contact the whole request fails with `409`. Use
`/v1/contacts/upsert` when you would rather match an existing record than fail.

### POST /v1/contacts/upsert

Same body as `POST /v1/contacts`. Looks the contact up by identifier first: if exactly one existing
contact matches, it is updated; if none match, it is created.

```bash
curl -X POST https://api.usekazuni.com/v1/contacts/upsert \
  -H "Authorization: Bearer $KAZUNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "identifiers": [
      { "type": "email", "value": "thoko@example.com", "isPrimary": true }
    ],
    "firstName": "Thoko",
    "metadata": { "plan": "growth" }
  }'
```

**Success response** - `201 Created` when a contact was created, `200 OK` when an existing one was
updated. Both return the contact object.

If the supplied identifiers match **two different** existing contacts, the request returns `409`
rather than guessing which to keep. Resolve that with a merge from the dashboard.

This is the endpoint to use for syncing from another system - it is safe to call repeatedly with
the same payload.

### GET /v1/contacts/:id

Retrieve one contact.

```bash
curl https://api.usekazuni.com/v1/contacts/9c1f7b2e-... \
  -H "Authorization: Bearer $KAZUNI_API_KEY"
```

**Success response** - `200 OK`, the contact object.

### PATCH /v1/contacts/:id

Update name fields or metadata. Identifiers and consent are managed through their own endpoints
and are ignored here.

```json
{ "firstName": "Thoko", "lastName": "Banda", "metadata": { "plan": "scale" } }
```

Every field is optional; supplying `metadata` replaces the whole object rather than merging keys.

```bash
curl -X PATCH https://api.usekazuni.com/v1/contacts/9c1f7b2e-... \
  -H "Authorization: Bearer $KAZUNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "firstName": "Thoko", "metadata": { "plan": "scale" } }'
```

**Success response** - `200 OK`, the updated contact object.

### DELETE /v1/contacts/:id

Delete a contact along with its identifiers, consent rows, and list memberships.

```bash
curl -X DELETE https://api.usekazuni.com/v1/contacts/9c1f7b2e-... \
  -H "Authorization: Bearer $KAZUNI_API_KEY"
```

**Success response** - `204 No Content`, with an empty body.

Deleting a contact does **not** clear suppression. An address that hard-bounced stays suppressed
after the contact is removed, which is deliberate - re-importing a bounced address should not
quietly make it mailable again.

### POST /v1/contacts/:id/identifiers

Attach an additional email or phone to an existing contact.

```json
{ "type": "email", "value": "thoko@work.example", "isPrimary": false }
```

The primary email is the address campaigns send to.

```bash
curl -X POST https://api.usekazuni.com/v1/contacts/9c1f7b2e-.../identifiers \
  -H "Authorization: Bearer $KAZUNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "type": "email", "value": "thoko@work.example", "isPrimary": false }'
```

**Success response** - `201 Created`, the full updated contact object.

If the identifier already belongs to this contact the call is a no-op and returns the contact
unchanged; if it belongs to a different contact it returns `409`.

:::caution
Setting `isPrimary: true` does not currently demote the existing primary of the same type, so a
contact can end up with two primary emails. Which one a campaign uses is then unspecified. Until
that is fixed, add identifiers with `isPrimary: false` and change the primary from the dashboard.
:::

### DELETE /v1/contacts/:id/identifiers/:identifierId

Remove one identifier.

```bash
curl -X DELETE https://api.usekazuni.com/v1/contacts/9c1f7b2e-.../identifiers/1a2b... \
  -H "Authorization: Bearer $KAZUNI_API_KEY"
```

**Success response** - `200 OK`, the full updated contact object.

Removing the last identifier of a contact returns `422` - a contact must always be reachable by at
least one identifier. Delete the contact instead.

### PUT /v1/contacts/:id/subscriptions/:channel

Set consent for a single channel. `channel` is `email`, `sms`, or `whatsapp`; anything else
returns `400`.

```json
{ "status": "unsubscribed", "source": "api" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `status` | `string` | Yes | `subscribed` or `unsubscribed`. |
| `source` | `string` | No | How consent changed: `signup`, `import`, `unsubscribe_link`, `reply_stop`, or `api`. Defaults to `api`. |

```bash
curl -X PUT https://api.usekazuni.com/v1/contacts/9c1f7b2e-.../subscriptions/email \
  -H "Authorization: Bearer $KAZUNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "status": "unsubscribed", "source": "api" }'
```

**Success response** - `200 OK`, the full updated contact object.

Channels are independent - unsubscribing from `sms` leaves `email` untouched.

:::note
Setting `sms` or `whatsapp` consent is accepted and stored today, but Kazuni cannot send on those
channels yet.
:::

## Next steps

- [Sending Email](/docs/sdk/sending-email) - the SDK method that wraps `POST /v1/emails/send`
- [Errors](/docs/sdk/errors) - the SDK's typed error shape
- [Idempotency and Retries](/docs/sdk/idempotency-and-retries) - which of these are safe to retry
