// DOM selectors for Upwork job page elements
// These may need to be updated if Upwork changes their HTML structure
export const DOMSelectors = {
  // Job details selectors
  JOB_TITLE: 'h1[data-test="job-title"], h1.job-title, [class*="job-title"]',
  JOB_DESCRIPTION: '[data-test="job-description"], .job-description, [class*="job-description"]',
  JOB_BUDGET: '[data-test="job-budget"], .js-budget, [class*="budget"]',
  JOB_DURATION: '[data-test="duration"], [class*="duration"]',
  JOB_SKILLS: '[data-test="skill"] span, .skills span, [class*="skill-badge"]',
  
  // Button containers
  APPLY_BUTTON_CONTAINER: '[data-test="apply-button-container"], .apply-button-container, [class*="apply-button"]',
  
  // Posted date
  JOB_POSTED_DATE: '[data-test="posted-on"], [class*="posted-on"]'
};

// XPath fallbacks for when CSS selectors fail
export const XPathSelectors = {
  JOB_TITLE: '//h1[contains(@class, "title") or contains(text(), "Job")]',
  JOB_DESCRIPTION: '//div[contains(@class, "description") or contains(@data-test, "description")]',
  JOB_BUDGET: '//*[contains(text(), "$") and contains(@class, "budget")]',
  JOB_SKILLS: '//span[contains(@class, "skill")]'
};

// Helper function to try CSS selector first, then XPath
export const getElementBySelectors = (cssSelector: string, xpathSelector?: string): Element | null => {
  // Try CSS selector first
  let element = document.querySelector(cssSelector);
  
  // If CSS fails and XPath is provided, try XPath
  if (!element && xpathSelector) {
    const xpathResult = document.evaluate(
      xpathSelector,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    element = xpathResult.singleNodeValue as Element;
  }
  
  return element;
}; 