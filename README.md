# Express on Railway with WebDecoy

An Express app for [Railway](https://railway.com) with [WebDecoy](https://webdecoy.com) bot detection on every route. Deploy it as a starting point, or copy the few lines in `server.js` into your own app.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/express-webdecoy-bot-detection?referralCode=FUqRrv&utm_medium=integration&utm_source=template&utm_campaign=generic)

## What you get

- `@webdecoy/express` in **monitor** mode: automated requests are recorded in your WebDecoy dashboard and every request is still served.
- A hidden honeytoken link in HTML responses. Scrapers that follow it identify themselves; people never see it.
- The real visitor IP. Railway's proxy sends `X-Forwarded-For: <client>, <edge>`, so the app trusts two hops (`app.set('trust proxy', 2)`). With the common `trust proxy: 1`, every visitor would look like Railway's edge.
- A `/health` route for Railway's healthcheck, never analyzed.

## Deploy

1. Create a free account at [app.webdecoy.com](https://app.webdecoy.com) and add your site.
2. Create an API key under **Settings > API Keys**.
3. Deploy the template and paste the key into `WEBDECOY_API_KEY` when Railway asks. The key is a secret: keep it in Railway's variables, never in a file you commit.

Without a key the app still runs, with local rules only, and nothing reports.

## Prove it reports

Request any page with the reserved test user agent:

```bash
curl -A "WebDecoy-Test/1.0" https://<your-app>.up.railway.app/
```

A detection labeled **Test** appears on the Detections page within a few seconds. Test detections are excluded from stats and billing.

## Enforce

When you have seen what it would block, set `mode: 'enforce'` in `server.js`. Blocked requests then get a 403; pass `onBlocked` to answer them your own way. See the [Express middleware docs](https://docs.webdecoy.com/sdk-plugins/express/).

## Run locally

```bash
cp .env.example .env   # add your key
npm install
node --env-file=.env server.js
```
