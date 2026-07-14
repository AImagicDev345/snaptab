# Privacy Policy

_Last updated: July 2026_

SnapTab is a zero-login bill-splitting tool. The goal of this policy is to be short and honest.

## What we store

For every bill you create, we store:

- The bill title, tax, tip, delivery fee, and currency you entered.
- The item names and prices you entered.
- The nickname each participant chose for themselves.
- Which participant "claimed" which item.
- Optional payment handles (Venmo / Cash App / UPI / PayPal) you added when creating the bill.

That's it. We do not collect email addresses, phone numbers, real names, IP addresses on our end, or any account information — because there are no accounts.

## Where it lives

Data is stored in a managed Supabase Postgres database in the region provisioned for the SnapTab project.

## How long we keep it

Every bill is automatically deleted 30 days after it was created. If you need it longer, take a screenshot.

## Analytics

We use PostHog to count anonymous events (session created, item claimed, etc.). PostHog assigns an anonymous distinct id per browser; we never identify users, and we do not set marketing cookies.

## Payments

SnapTab is not a payment processor. We never see, hold, or move money. The "Pay Host" buttons open your existing payment app (Venmo / Cash App / UPI / PayPal) with the amount pre-filled — the actual payment happens in that app, not in SnapTab.

## Nicknames are public

Whoever holds the room link can see the nicknames of everyone in the room. Do not use a nickname you would not want strangers to see.

## Deletion requests

If you want a bill deleted before the automatic 30-day cleanup, delete the link from wherever you shared it and wait — or email the address in the repo README with the session URL. Since bills contain no personal identifiers, there is nothing else to delete.
