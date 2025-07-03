import { UpworkJob, ExtensionMessage, EstimateData } from '../types';
import { DOMSelectors } from './selectors';
import { EstimateModal } from './estimate-modal';

// Global modal instance
let estimateModal: EstimateModal | null = null;

// Check if we're on an Upwork job page
const isUpworkJobPage = (): boolean => {
  const url = window.location.href;
  const isJobPage = url.includes('upwork.com/jobs/') || url.includes('upwork.com/freelance-jobs/');
  console.log('🔍 Projectmaven v1.1: Checking if Upwork job page:', url, 'isJobPage:', isJobPage);
  return isJobPage;
};

// Scrape job details from the DOM
export const scrapeJobData = (): UpworkJob | null => {
  try {
    const jobTitle = document.querySelector(DOMSelectors.JOB_TITLE)?.textContent?.trim() || '';
    const jobDescription = document.querySelector(DOMSelectors.JOB_DESCRIPTION)?.textContent?.trim() || '';
    const budget = document.querySelector(DOMSelectors.JOB_BUDGET)?.textContent?.trim();
    const duration = document.querySelector(DOMSelectors.JOB_DURATION)?.textContent?.trim();
    
    // Extract skills
    const skillElements = document.querySelectorAll(DOMSelectors.JOB_SKILLS);
    const skills = Array.from(skillElements).map(el => el.textContent?.trim() || '');
    
    const jobData: UpworkJob = {
      title: jobTitle,
      description: jobDescription,
      budget,
      estimatedDuration: duration,
      skills: skills.filter(Boolean),
      url: window.location.href
    };

    return jobData;
  } catch (error) {
    console.error('Error scraping job data:', error);
    return null;
  }
};

// Inject Quick Estimate button
const injectQuickEstimateButton = (): void => {
  console.log('🔍 Projectmaven: Attempting to inject Quick Estimate button...');
  
  // Check if button already exists
  if (document.querySelector('#projectmaven-quick-estimate')) {
    console.log('🔍 Projectmaven: Button already exists, skipping injection');
    return;
  }

  // Debug: Try to find any job-related elements
  console.log('🔍 Projectmaven: Looking for job title...', document.querySelector('h1'));
  console.log('🔍 Projectmaven: Looking for apply button container...', document.querySelector(DOMSelectors.APPLY_BUTTON_CONTAINER));
  
  // Try multiple strategies to find a good injection point
  let targetElement = document.querySelector(DOMSelectors.APPLY_BUTTON_CONTAINER);
  
  // Fallback 1: Look for common button containers
  if (!targetElement) {
    const applyButton = document.querySelector('button[data-test*="apply"], button[class*="apply"]');
    targetElement = applyButton?.parentElement || null;
    console.log('🔍 Projectmaven: Fallback 1 - Apply button parent:', targetElement);
  }
  
  // Fallback 2: Look for job title and inject after it
  if (!targetElement) {
    const jobTitle = document.querySelector('h1');
    targetElement = jobTitle?.parentElement || null;
    console.log('🔍 Projectmaven: Fallback 2 - Job title parent:', targetElement);
  }
  
  // Fallback 3: Look for any prominent container in the main content
  if (!targetElement) {
    targetElement = document.querySelector('main, [role="main"], .job-details, [class*="job"]');
    console.log('🔍 Projectmaven: Fallback 3 - Main content:', targetElement);
  }

  if (!targetElement) {
    console.log('❌ Projectmaven: No suitable injection point found');
    console.log('🔍 Available elements:', {
      h1: document.querySelector('h1'),
      main: document.querySelector('main'),
      buttons: document.querySelectorAll('button').length
    });
    return;
  }

  console.log('✅ Projectmaven: Found injection point:', targetElement);

  // Create button
  const button = document.createElement('button');
  button.id = 'projectmaven-quick-estimate';
  button.className = 'pm-quick-estimate-btn';
  button.textContent = '⚡ Quick Estimate';
  
  // Add click handler
  button.addEventListener('click', handleQuickEstimateClick);
  
  // Insert button with more robust positioning
  try {
    if (targetElement.tagName === 'H1') {
      // If it's the title, insert after it
      targetElement.insertAdjacentElement('afterend', button);
    } else {
      // Otherwise, prepend to the container
      targetElement.insertAdjacentElement('afterbegin', button);
    }
    console.log('✅ Projectmaven: Quick Estimate button injected successfully!');
  } catch (error) {
    console.error('❌ Projectmaven: Failed to inject button:', error);
  }
};

// Handle Quick Estimate button click
const handleQuickEstimateClick = async (event: Event): Promise<void> => {
  event.preventDefault();
  
  // Check authentication first
  chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
    if (!response || !response.authenticated) {
      showAuthPrompt();
      return;
    }
    
    if (response.user?.tier !== 'pro') {
      showUpgradePrompt();
      return;
    }
    
    // Scrape job data
    const jobData = scrapeJobData();
    if (!jobData) {
      console.error('Failed to scrape job data');
      return;
    }
    
    // Send to service worker for estimation
    chrome.runtime.sendMessage({
      type: 'ESTIMATE_JOB',
      payload: jobData
    }, (estimateResponse) => {
      if (estimateResponse?.success) {
        showEstimateModal(estimateResponse.data);
      } else {
        console.error('Estimation failed:', estimateResponse?.error);
      }
    });
  });
};

// Show auth prompt
const showAuthPrompt = (): void => {
  const message = 'Quick Estimate requires a Projectmaven account. Sign up to get started with AI-powered project estimation.';
  if (confirm(`${message}\n\nClick OK to create your account and choose a plan.`)) {
    // Open Projectmaven pricing page
    window.open('https://beta.projectmaven.io/pricing', '_blank');
  }
};

// Show upgrade prompt
const showUpgradePrompt = (): void => {
  const message = 'Quick Estimate is a Pro feature. Upgrade your Projectmaven account to access advanced estimation tools.';
  if (confirm(`${message}\n\nClick OK to upgrade to Pro.`)) {
    // Open Projectmaven pricing page
    window.open('https://beta.projectmaven.io/pricing', '_blank');
  }
};

// Show estimate modal
const showEstimateModal = (estimateData: EstimateData): void => {
  if (!estimateModal) {
    estimateModal = new EstimateModal();
    
    // Listen for retry events
    document.addEventListener('pm-retry-estimate', () => {
      handleQuickEstimateClick(new Event('click'));
    });
  }
  
  estimateModal.show();
  estimateModal.displayEstimate(estimateData);
};

// Initialize content script
const init = (): void => {
  console.log('🚀 Projectmaven: Content script initializing...');
  
  if (!isUpworkJobPage()) {
    console.log('🚀 Projectmaven: Not a job page, exiting');
    return;
  }

  console.log('🚀 Projectmaven: On Upwork job page, proceeding with injection');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    console.log('🚀 Projectmaven: DOM loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🚀 Projectmaven: DOM loaded, injecting button');
      setTimeout(injectQuickEstimateButton, 1000); // Small delay for dynamic content
    });
  } else {
    console.log('🚀 Projectmaven: DOM ready, injecting button immediately');
    setTimeout(injectQuickEstimateButton, 1000); // Small delay for dynamic content
  }

  // Listen for DOM changes (in case Upwork loads content dynamically)
  const observer = new MutationObserver(() => {
    if (!document.querySelector('#projectmaven-quick-estimate')) {
      console.log('🚀 Projectmaven: DOM changed and button missing, re-injecting');
      injectQuickEstimateButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('🚀 Projectmaven: Observer set up, watching for changes');
};

// Initialize
console.log('🚀 Projectmaven v1.1: Content script loaded - NEW VERSION WITH DEBUGGING');
init(); 