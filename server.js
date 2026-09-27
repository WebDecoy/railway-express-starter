import express from 'express';
import { webdecoy } from '@webdecoy/express';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Where the real visitor IP is depends on the platform in front of the app.
// Railway rewrites X-Forwarded-For to exactly "<client>, <edge>" (anything the
// client sent is dropped). Render appends to whatever the client sent:
// "<anything>, <client>, <cloudflare>, <render>". Count the hops you actually
// have, or req.ip is the platform's proxy (or a value the client chose).
const onRender = Boolean(process.env.RENDER);
app.set('trust proxy', onRender ? 3 : 2);

// The platform healthcheck. Registered before the middleware so it is never analyzed.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const apiKey = process.env.WEBDECOY_API_KEY;
if (!apiKey) {
  console.warn(
    'WEBDECOY_API_KEY is not set: running local rules only, nothing reports to WebDecoy.',
  );
}

// Monitor mode (the default) records detections and still serves every request.
// Switch to mode: 'enforce' once you have seen what it would block.
app.use(
  webdecoy({
    apiKey,
    // Render sits behind Cloudflare, which sets CF-Connecting-IP and refuses a
    // request that tries to supply its own.
    trustProxy: onRender ? 'cloudflare' : 'railway',
    skipPaths: ['/health'],
  }),
);

app.use(express.static('public'));

app.get('/api/hello', (req, res) => {
  res.json({
    message: `Hello from ${onRender ? 'Render' : 'Railway'}`,
    webdecoy: req.webdecoy
      ? {
          decision: req.webdecoy.decision,
          threat_level: req.webdecoy.threat_level,
          detection_id: req.webdecoy.detection_id,
        }
      : null,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
