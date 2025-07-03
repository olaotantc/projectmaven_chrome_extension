# Projectmaven ↔ Upwork Chrome Extension

A Chrome extension that integrates Projectmaven's cost estimation features directly into Upwork job posts, enabling freelancers to quickly estimate project costs and generate Statements of Work (SOW).

## Features

- **Quick Estimate Button**: Adds a "Quick Estimate" button to Upwork job pages (Pro users only)
- **Automatic Job Scraping**: Extracts job details from Upwork pages
- **Personalized Estimates**: Uses your hourly rate to calculate project costs
- **SOW Generation**: Generate professional SOWs directly from estimates
- **Tier Gating**: Pro features restricted to Pro-tier subscribers
- **JWT Authentication**: Secure authentication with automatic token refresh

## Project Structure

```
├── public/
│   ├── manifest.json     # Chrome extension manifest (MV3)
│   └── icons/           # Extension icons
├── src/
│   ├── background/      # Service worker for background tasks
│   ├── content/         # Content scripts for Upwork pages
│   ├── popup/          # Extension popup UI
│   ├── styles/         # CSS styles
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions (API, auth, telemetry)
├── tests/              # Playwright e2e tests
└── dist/               # Built extension (generated)
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Chrome browser

### Installation

```bash
npm install
```

### Build

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## Configuration

The extension requires API keys and configuration:

- **Projectmaven API**: Set up authentication with Projectmaven backend
- **Mixpanel**: Add your Mixpanel token in `src/utils/telemetry.ts`

## Security

- JWT tokens are refreshed automatically 5 minutes before expiry
- All API communications use HTTPS
- Extension follows Chrome's Manifest V3 security requirements
- CSP restricts connections to allowed domains only

## License

[License details here]

## Not Affiliated with Upwork

This extension is not affiliated with, endorsed by, or sponsored by Upwork. 