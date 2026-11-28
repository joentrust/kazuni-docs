---
sidebar_position: 4
title: Sending Email
description: The full reference for kazuni.send.email()
---

# Sending Email

`kazuni.send.email()` is the SDK's only send method today - it sends a single transactional
email. It makes a `POST /v1/emails/send` request under the hood; see
[API Reference](/docs/sdk/api-reference) if you want to call the endpoint directly instead of
through the SDK.

```typescript
const result = await kazuni.send.email({
  from: "Acme <hello@acme.example>",
  to: "customer@example.com",
  subject: "Welcome to Acme",
  html: "<p>Thanks for signing up.</p>",
  text: "Thanks for signing up.",
});
```

## Parameters

| Field | Type | Required | Description |
|---|---|---|---|
| `from` | `string` | Yes | The sender address: `hello@acme.example` or `Acme <hello@acme.example>`. The domain must be verified for your organization in the Kazuni dashboard - see [Sending Domains](/docs/platform/sending-domains). |
| `to` | `string` | Yes | A single recipient email address. Only one recipient is supported per request - there is no `cc`, `bcc`, or array of recipients today. |
| `replyTo` | `string \| string[]` | No | The address replies should go to, or a list of up to 10. When omitted, replies go to the `from` address. Use it when you send from an address that does not receive mail, such as `info@mail.acme.example`. |
| `subject` | `string` | Yes | The email subject line. |
| `html` | `string` | Yes | The HTML body of the email. |
| `text` | `string` | No | A plain-text fallback body. When omitted, recipients whose email client doesn't render HTML see no fallback content. |

## Response

```typescript
{
  id: string;       // e.g. "email_..."
  status: "queued";
}
```

A resolved promise means Kazuni **accepted the request for delivery** - it does not mean the email
has been delivered, or even that delivery has started. `status` is always `"queued"` in this
response; it does not update in place as delivery progresses.

To see what actually happened to a send (sent, delivered, bounced, and so on), fetch its status
with the [`GET /v1/emails/:id`](/docs/sdk/api-reference#get-v1emails) endpoint - the SDK does not
wrap this yet, so call it directly, or check the send's status from the
[Kazuni dashboard](/docs/platform/delivery). There is currently no webhook mechanism that pushes
delivery events to your application; status has to be pulled.

## Errors

A domain that isn't verified, a malformed address, an over-quota key, or any other failure throws
a `KazuniError` instead of resolving. See [Errors](/docs/sdk/errors) for the full list of
conditions and how to inspect them.

## Retrying a failed send

By default, a failed `send.email()` call is never retried automatically - retrying a write blindly
risks sending the same email twice. Pass an `idempotencyKey` to opt in to safe retries on
transient failures:

```typescript
await kazuni.send.email(
  {
    from: "hello@acme.example",
    to: "customer@example.com",
    subject: "Hi",
    html: "<p>Hi</p>",
  },
  { idempotencyKey: `welcome-email-${userId}` },
);
```

See [Idempotency and Retries](/docs/sdk/idempotency-and-retries) for exactly what this does and
does not guarantee today.

## Next steps

- [Errors](/docs/sdk/errors) - the full `KazuniError` reference
- [Idempotency and Retries](/docs/sdk/idempotency-and-retries) - safe retries in detail
- [API Reference](/docs/sdk/api-reference) - the raw REST surface
