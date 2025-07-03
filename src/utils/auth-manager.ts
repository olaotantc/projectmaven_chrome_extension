import { User, StorageData } from '../types';

export class AuthManager {
  async getCurrentUser(): Promise<User | null> {
    try {
      const storage = await chrome.storage.local.get(['user']) as StorageData;
      return storage.user || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
  
  async updateUser(user: User): Promise<void> {
    await chrome.storage.local.set({ user });
  }
  
  async getLastRefreshTime(): Promise<number | null> {
    try {
      const storage = await chrome.storage.local.get(['lastRefresh']) as StorageData;
      return storage.lastRefresh || null;
    } catch (error) {
      console.error('Failed to get last refresh time:', error);
      return null;
    }
  }
  
  async refreshToken(): Promise<boolean> {
    try {
      // TODO: Implement actual token refresh with Projectmaven API
      // For now, we'll simulate the refresh
      const now = Date.now();
      await chrome.storage.local.set({ lastRefresh: now });
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
  
  async login(email: string, password: string): Promise<User | null> {
    try {
      // TODO: Implement actual login with Projectmaven API
      // This is a placeholder implementation
      const response = await fetch('https://projectmaven.io/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        console.log('🔧 Login API failed, this is expected in development mode');
        return null;
      }
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('🔧 Non-JSON response from login API (expected in development)');
        return null;
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON from login response:', jsonError);
        return null;
      }
      
      const user: User = {
        id: data.id,
        email: data.email,
        tier: data.tier,
        hourlyRate: data.hourlyRate,
        jwt: data.jwt
      };
      
      // Store user and JWT
      await chrome.storage.local.set({
        user,
        jwt: data.jwt,
        lastRefresh: Date.now()
      });
      
      return user;
    } catch (error) {
      console.error('Login failed (expected in development):', error);
      return null;
    }
  }
  
  async logout(): Promise<void> {
    await chrome.storage.local.clear();
  }
} 