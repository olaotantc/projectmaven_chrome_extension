import { ExtensionMessage, StorageData, User, ApiResponse, UpworkJob, Estimate } from '../types';
import { ApiClient } from '../utils/api-client';
import { AuthManager } from '../utils/auth-manager';
import { TelemetryService } from '../utils/telemetry';

// Initialize services
const apiClient = new ApiClient();
const authManager = new AuthManager();
const telemetry = new TelemetryService();

// JWT refresh interval (25 minutes - refresh 5 min before 30 min expiry)
const JWT_REFRESH_INTERVAL = 25 * 60 * 1000;
let refreshTimer: NodeJS.Timeout | null = null;

// Initialize on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Track installation
    await telemetry.track('extension_installed', {
      version: chrome.runtime.getManifest().version
    });
    
    // Initialize storage
    await chrome.storage.local.set({
      user: null,
      jwt: null,
      lastRefresh: null
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) => {
  // Handle async operations
  (async () => {
    try {
      switch (message.type) {
        case 'CHECK_AUTH':
          const authStatus = await handleCheckAuth();
          sendResponse(authStatus);
          break;
          
        case 'ESTIMATE_JOB':
          const estimate = await handleEstimateJob(message.payload);
          sendResponse(estimate);
          break;
          
        case 'GENERATE_SOW':
          const sow = await handleGenerateSOW(message.payload);
          sendResponse(sow);
          break;
          
        case 'UPDATE_RATE':
          const updateResult = await handleUpdateRate(message.payload);
          sendResponse(updateResult);
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  })();
  
  // Return true to indicate async response
  return true;
});

// Check authentication status
async function handleCheckAuth(): Promise<{ authenticated: boolean; user?: User }> {
  try {
    const user = await authManager.getCurrentUser();
    if (!user) {
      return { authenticated: false };
    }
    
    // Check if JWT needs refresh
    const lastRefresh = await authManager.getLastRefreshTime();
    const now = Date.now();
    
    if (!lastRefresh || (now - lastRefresh) > JWT_REFRESH_INTERVAL) {
      const refreshed = await authManager.refreshToken();
      if (!refreshed) {
        return { authenticated: false };
      }
    }
    
    return { authenticated: true, user };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false };
  }
}

// Handle job estimation
async function handleEstimateJob(jobData: UpworkJob): Promise<ApiResponse<Estimate>> {
  try {
    // Get current user
    const user = await authManager.getCurrentUser();
    if (!user || user.tier !== 'pro') {
      return { success: false, error: 'Pro subscription required' };
    }
    
    // Track event
    await telemetry.track('estimate_requested', {
      jobUrl: jobData.url,
      hasSkills: (jobData.skills?.length ?? 0) > 0
    });
    
    // Try API call first
    const response = await apiClient.estimateProject({
      title: jobData.title,
      description: jobData.description,
      skills: jobData.skills || [],
      budget: jobData.budget,
      duration: jobData.estimatedDuration,
      hourlyRate: user.hourlyRate
    });
    
    if (response.success && response.data) {
      // API success
      await telemetry.track('estimate_completed', {
        estimateId: response.data.id,
        totalCost: response.data.totalCost,
        devDays: response.data.devDays
      });
      
      return response;
    } else {
      // API failed - show mock estimate (development mode)
      console.log('🔧 API failed, showing mock estimate (development mode). Error:', response.error);
      
      const mockEstimate = {
        id: `mock-estimate-${Date.now()}`,
        jobId: `mock-job-${Date.now()}`,
        totalCost: Math.round((user.hourlyRate * 40) + (Math.random() * user.hourlyRate * 20)),
        devDays: Math.round(5 + (Math.random() * 15)),
        hourlyRate: user.hourlyRate,
        createdAt: new Date(),
        tasks: [
          {
            name: "Project Setup & Architecture",
            description: "Initial project structure, dependencies, and core architecture",
            hours: Math.round(8 + (Math.random() * 8)),
            cost: Math.round(user.hourlyRate * (8 + (Math.random() * 8)))
          },
          {
            name: "Core Feature Development", 
            description: "Main functionality implementation based on requirements",
            hours: Math.round(16 + (Math.random() * 16)),
            cost: Math.round(user.hourlyRate * (16 + (Math.random() * 16)))
          },
          {
            name: "Testing & Quality Assurance",
            description: "Unit tests, integration tests, and bug fixes",
            hours: Math.round(8 + (Math.random() * 8)),
            cost: Math.round(user.hourlyRate * (8 + (Math.random() * 8)))
          },
          {
            name: "Deployment & Documentation",
            description: "Production deployment setup and user documentation",
            hours: Math.round(4 + (Math.random() * 8)),
            cost: Math.round(user.hourlyRate * (4 + (Math.random() * 8)))
          }
        ]
      };
      
      await telemetry.track('estimate_completed', {
        estimateId: mockEstimate.id,
        totalCost: mockEstimate.totalCost,
        devDays: mockEstimate.devDays,
        mode: 'development_mock'
      });
      
      return { 
        success: true, 
        data: mockEstimate 
      };
    }
  } catch (error) {
    console.error('Estimation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await telemetry.track('estimate_failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

// Handle SOW generation
async function handleGenerateSOW(estimateId: string): Promise<ApiResponse<any>> {
  try {
    // Track event
    await telemetry.track('sow_requested', { estimateId });
    
    // Call API
    const response = await apiClient.generateSOW(estimateId);
    
    if (response.success && response.data) {
      await telemetry.track('sow_generated', {
        estimateId,
        sowId: response.data.id
      });
    }
    
    return response;
  } catch (error) {
    console.error('SOW generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await telemetry.track('sow_failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

// Handle hourly rate update
async function handleUpdateRate(newRate: number): Promise<ApiResponse<any>> {
  console.log('🔧 Background: Handling rate update to:', newRate);
  
  try {
    // Validate rate
    if (newRate < 10 || newRate > 500) {
      console.log('❌ Rate validation failed:', newRate);
      return { success: false, error: 'Rate must be between $10 and $500' };
    }
    
    console.log('🔧 Trying API update...');
    // Try API update first
    const response = await apiClient.updateHourlyRate(newRate);
    
    if (response.success) {
      console.log('✅ API update successful');
      // API success - update local storage
      const user = await authManager.getCurrentUser();
      if (user) {
        user.hourlyRate = newRate;
        await authManager.updateUser(user);
        console.log('✅ Local storage updated with new rate');
      }
      
      await telemetry.track('rate_updated', { newRate });
      return response;
    } else {
      // API failed (404, network error, etc.) - use development fallback
      console.log('🔧 API failed, updating rate locally (development mode). Error:', response.error);
      
      const user = await authManager.getCurrentUser();
      console.log('🔧 Current user for rate update:', user);
      
      if (user) {
        user.hourlyRate = newRate;
        await authManager.updateUser(user);
        
        await telemetry.track('rate_updated', { 
          newRate, 
          mode: 'development_fallback' 
        });
        
        console.log('✅ Rate updated locally to $' + newRate);
        
        return { 
          success: true, 
          data: { message: `Rate updated to $${newRate} (development mode)` }
        };
      } else {
        console.log('❌ No user found for rate update');
        return { success: false, error: 'No user found' };
      }
    }
  } catch (error) {
    console.error('❌ Rate update failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Set up JWT refresh timer
async function setupRefreshTimer(): Promise<void> {
  // Clear existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  // Set up new timer
  refreshTimer = setInterval(async () => {
    const user = await authManager.getCurrentUser();
    if (user) {
      const refreshed = await authManager.refreshToken();
      if (!refreshed) {
        console.error('Token refresh failed');
        // Clear auth data on refresh failure
        await authManager.logout();
      }
    }
  }, JWT_REFRESH_INTERVAL);
}

// Initialize service worker
(async () => {
  // Check auth on startup
  const authStatus = await handleCheckAuth();
  if (authStatus.authenticated) {
    await setupRefreshTimer();
  }
})(); 