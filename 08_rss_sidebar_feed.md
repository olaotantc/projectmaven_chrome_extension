# 8. RSS Ingest & Sidebar Feed (E6, Could)

- **8.1 Lambda function to poll Upwork RSS feeds (15-min interval, back-off):**
  - Poll and cache job feeds from Upwork.
- **8.2 Store jobs in DynamoDB, serve to extension:**
  - Store and retrieve jobs for sidebar display.
- **8.3 Inject sidebar feed into Upwork (feature flag, Pro only):**
  - Add sidebar to Upwork UI for Pro users.
- **8.4 Sort jobs by projected value:**
  - Order jobs in the sidebar by value. 