# Projectmaven ↔ Upwork Chrome Extension — Task Breakdown

This file contains a structured breakdown of all major tasks and subtasks required to build the extension, based on the PRD. Follow these as your build instructions.

---

## 1. Extension Foundation (E1)
- **1.1** Set up Chrome extension project structure (MV3, TypeScript)
- **1.2** Implement content script for DOM scraping
- **1.3** Implement service worker for background tasks (JWT refresh, fetch)
- **1.4** Create extension popup UI (settings, login, hourly rate field)
- **1.5** Set up Playwright tests for end-to-end flow

## 2. Authentication & JWT (E2)
- **2.1** Integrate Projectmaven Auth (JWT, Google OAuth)
- **2.2** Implement JWT refresh logic (refresh 5 min before expiry)
- **2.3** Handle login/logout and error states (toast, re-login prompt)
- **2.4** Secure storage of tokens

## 3. DOM Scraping (E3)
- **3.1** Detect Upwork job pages (`https://www.upwork.com/jobs/*`)
- **3.2** Scrape job details from DOM (abstract selectors, XPath fallback)
- **3.3** Monitor for Upwork selector changes (Jest fixtures, Mixpanel "scrape-fail")

## 4. Estimate Modal & Quick Estimate Flow (E4)
- **4.1** Add "Quick Estimate" button to Upwork job pages (Pro only)
- **4.2** On click, scrape job data and call Cost-Estimate API
- **4.3** Auto-apply user's hourly rate to estimate
- **4.4** Display modal with cost, timeline, and SOW option
- **4.5** Telemetry: log Mixpanel events for estimate run

## 5. SOW Generation Flow (E5)
- **5.1** Implement "Generate SOW" button in modal
- **5.2** Call SOW API and handle PDF generation (≤15s, progress loader)
- **5.3** Open PDF in new tab, fire Mixpanel `sow_generated`
- **5.4** Handle async fallback (email SOW if >15s)

## 6. Tier Gating & Rate Settings (E10)
- **6.1** Gate Quick Estimate and SOW for Pro users (JWT tier check)
- **6.2** Show upsell modal for Starter users (deep-link to billing)
- **6.3** Implement rate edit UI in extension popup (10–500, PATCH API)
- **6.4** Ensure new rate is used in next estimate

## 7. Telemetry & Compliance (E7)
- **7.1** Integrate Mixpanel for all key events (install, estimate, SOW, upsell)
- **7.2** Add Sentry for error tracking (P1/P2 errors)
- **7.3** Implement GDPR/CCPA compliance (first-run consent, privacy policy)
- **7.4** Add "Not affiliated with Upwork" disclaimer

## 8. RSS Ingest & Sidebar Feed (E6, Could)
- **8.1** Lambda function to poll Upwork RSS feeds (15-min interval, back-off)
- **8.2** Store jobs in DynamoDB, serve to extension
- **8.3** Inject sidebar feed into Upwork (feature flag, Pro only)
- **8.4** Sort jobs by projected value

## 9. CI/CD & Publishing (E8)
- **9.1** Set up CI/CD pipeline for extension and backend
- **9.2** Prepare Chrome Web Store listing (privacy, permissions, disclaimer)
- **9.3** Submit to trusted-tester channel, then public

## 10. QA & Regression (E9)
- **10.1** Write and run Playwright regression tests
- **10.2** Ensure all must-have stories pass acceptance criteria

---

**Instructions:**
- Work through each epic and its subtasks in order.
- Reference the PRD for detailed acceptance criteria and user stories.
- Mark tasks as complete as you progress. 