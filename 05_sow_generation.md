# 5. SOW Generation Flow (E5)

- **5.1 Implement "Generate SOW" button in modal:**
  - Add a button to generate a Statement of Work.
- **5.2 Call SOW API and handle PDF generation (≤15s, progress loader):**
  - Generate and download SOW PDF, show progress.
- **5.3 Open PDF in new tab, fire Mixpanel `sow_generated`:**
  - Open the SOW in a new tab and log the event.
- **5.4 Handle async fallback (email SOW if >15s):**
  - Email SOW if generation takes too long. 