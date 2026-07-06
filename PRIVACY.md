# Privacy

NerveDrive is built so that your health data **physically cannot** reach us. This is enforced by architecture, not by a promise.

## What happens to my data?

- Your `Export.zip` is read by JavaScript running in **your** browser tab.
- Extraction, parsing and analysis run in a **Web Worker** on your device.
- The resulting report lives in memory (and only in memory). **Closing or refreshing the tab erases everything.**
- There is **no backend, no database, no account, and no upload endpoint.** The app is a static site.

## Network requests

The app makes essentially no network calls after it loads. The single optional request is a **Google Fonts** stylesheet for typography.

### Fully offline / air-gapped build

To remove even the font request:

1. Download the Inter `woff2` files (weights 400 to 800) into `public/fonts/`.
2. Replace the `@import` at the top of `src/index.css` with local `@font-face` rules.
3. Rebuild. The app now makes zero third-party requests and works offline (it can be installed as a PWA in a future release).

## Analytics

No analytics SDK is bundled. If a fork adds usage analytics, it must never transmit health data or file contents. This is a hard project rule.

## Exports

PDF, Markdown, CSV and JSON exports are generated on-device and saved via the browser's download mechanism. They are never transmitted anywhere.
