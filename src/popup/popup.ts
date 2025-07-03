import { User } from '../types';
import { AuthManager } from '../utils/auth-manager';
import { TelemetryService } from '../utils/telemetry';

const authManager = new AuthManager();
const telemetry = new TelemetryService();

// View elements
const loginView = document.getElementById('login-view')!;
const settingsView = document.getElementById('settings-view')!;
const loadingView = document.getElementById('loading-view')!;
const errorView = document.getElementById('error-view')!;

// Form elements
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const logoutBtn = document.getElementById('logout-btn')!;

// User info elements
const userEmailEl = document.getElementById('user-email')!;
const userTierEl = document.getElementById('user-tier')!;
const upgradeSection = document.getElementById('upgrade-section')!;

// Rate display element (read-only)
const rateValue = document.getElementById('rate-value')!;

// Show/hide views
function showView(view: 'login' | 'settings' | 'loading' | 'error'): void {
  loginView.style.display = view === 'login' ? 'block' : 'none';
  settingsView.style.display = view === 'settings' ? 'block' : 'none';
  loadingView.style.display = view === 'loading' ? 'block' : 'none';
  errorView.style.display = view === 'error' ? 'block' : 'none';
}

// Show error
function showError(message: string): void {
  const errorMessage = document.getElementById('error-message')!;
  errorMessage.textContent = message;
  showView('error');
  
  // Clear error after 3 seconds
  setTimeout(() => {
    if (errorView.style.display !== 'none') {
      checkAuth();
    }
  }, 3000);
}

// Check authentication status
async function checkAuth(): Promise<void> {
  showView('loading');
  
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    
    if (response?.authenticated && response.user) {
      showSettings(response.user);
    } else {
      showView('login');
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    showView('login');
  }
}

// Show settings view with user data
function showSettings(user: User): void {
  userEmailEl.textContent = user.email;
  userTierEl.textContent = user.tier === 'pro' ? 'Pro' : 'Starter';
  userTierEl.className = `user-tier tier-${user.tier}`;
  
  // Update rate display (read-only)
  rateValue.textContent = `$${user.hourlyRate}/hr`;
  
  // Show upgrade section for starter users
  upgradeSection.style.display = user.tier === 'starter' ? 'block' : 'none';
  
  showView('settings');
}

// Mock user credentials for development testing
const MOCK_USERS = {
  'pro@projectmaven.com': {
    id: 'mock-pro-user-001',
    email: 'pro@projectmaven.com',
    tier: 'pro' as const,
    hourlyRate: 100  // Professional default rate
  },
  'starter@projectmaven.com': {
    id: 'mock-starter-user-001',
    email: 'starter@projectmaven.com', 
    tier: 'starter' as const,
    hourlyRate: 75   // Good starter rate
  },
  'demo@projectmaven.com': {
    id: 'mock-demo-user-001',
    email: 'demo@projectmaven.com',
    tier: 'pro' as const,
    hourlyRate: 100  // Standard professional rate
  }
};

// Check if email is a mock user
function isMockUser(email: string): boolean {
  return email in MOCK_USERS;
}

// Handle mock login
async function handleMockLogin(email: string): Promise<User> {
  const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
  
  // Store mock user data
  await chrome.storage.local.set({
    user: mockUser,
    jwt: `mock-jwt-${mockUser.tier}-${Date.now()}`
  });
  
  console.log('🎭 Mock user logged in:', mockUser);
  return mockUser;
}

// Handle login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;
  
  showView('loading');
  
  try {
    // Check for mock users first (any password works for mock users)
    if (isMockUser(email)) {
      const user = await handleMockLogin(email);
      await telemetry.track('mock_login_success', { email: user.email, tier: user.tier });
      showSettings(user);
      return;
    }
    
    // Try real authentication
    const user = await authManager.login(email, password);
    if (user) {
      await telemetry.track('login_success', { email: user.email });
      showSettings(user);
    } else {
      await telemetry.track('login_failed', { email });
      showError('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('Login failed. Please try again.');
  }
});

// Note: Rate management has been simplified - users can manage rates on ProjectMaven.io

// Handle logout
logoutBtn.addEventListener('click', async () => {
  showView('loading');
  
  try {
    await authManager.logout();
    await telemetry.track('logout');
    await telemetry.clearUser();
    showView('login');
  } catch (error) {
    console.error('Logout error:', error);
    showError('Logout failed. Please try again.');
  }
});

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
}); 