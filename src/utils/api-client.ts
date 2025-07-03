import { ApiResponse, Estimate, SOW } from '../types';

export interface EstimateRequest {
  title: string;
  description: string;
  skills: string[];
  budget?: string;
  duration?: string;
  hourlyRate: number;
}

export class ApiClient {
  private baseUrl = 'https://projectmaven.io/api/v1';
  
  private async getAuthToken(): Promise<string | null> {
    const storage = await chrome.storage.local.get(['jwt']);
    return storage.jwt || null;
  }
  
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          const errorMessage = jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error';
          console.log('🔧 [DEV] Failed to parse JSON response (expected without backend):', errorMessage);
          return { success: false, error: 'Invalid JSON response from server' };
        }
      } else {
        // Non-JSON response (likely HTML error page)
        const textResponse = await response.text();
        console.log('🔧 [DEV] Non-JSON response received (expected without backend):', textResponse.substring(0, 100) + '...');
        return { 
          success: false, 
          error: `Server returned ${response.status}: ${response.statusText}` 
        };
      }
      
      if (!response.ok) {
        return { success: false, error: data?.message || `HTTP ${response.status}: ${response.statusText}` };
      }
      
      return { success: true, data };
    } catch (error) {
      console.log('🔧 [DEV] API request failed (expected without backend):', error instanceof Error ? error.message : error);
      // This catches network errors, CORS errors, etc.
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error - check if backend is running' 
      };
    }
  }
  
  async estimateProject(request: EstimateRequest): Promise<ApiResponse<Estimate>> {
    return this.makeRequest<Estimate>('/project/estimate', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  
  async generateSOW(estimateId: string): Promise<ApiResponse<SOW>> {
    return this.makeRequest<SOW>('/project/sow', {
      method: 'POST',
      body: JSON.stringify({ estimateId })
    });
  }
  
  async updateHourlyRate(rate: number): Promise<ApiResponse<{ hourlyRate: number }>> {
    return this.makeRequest<{ hourlyRate: number }>('/user/rate', {
      method: 'PATCH',
      body: JSON.stringify({ rate })
    });
  }
  
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/user/profile', {
      method: 'GET'
    });
  }
} 