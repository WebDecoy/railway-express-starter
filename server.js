import express from 'express';
import { webdecoy } from '@webdecoy/express';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Railway rewrites X-Forwarded-For to exactly "<client>, <edge>" (anything the
// client sent is dropped), and the socket peer is a third, internal hop.
// Trusting two hops makes req.ip the real visitor rather than Railway's edge.
app.set('trust proxy', 2);

// Railway's healthcheck. Registered before the middleware so it is never analyzed.
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
    skipPaths: ['/health'],
  }),
);

app.use(express.static('public'));

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from Railway',
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
