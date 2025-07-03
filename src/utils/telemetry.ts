import mixpanel from 'mixpanel-browser';
import { TelemetryEvent } from '../types';

export class TelemetryService {
  private initialized = false;
  
  constructor() {
    this.init();
  }
  
  private async init(): Promise<void> {
    try {
      // TODO: Replace with actual Mixpanel token
      const MIXPANEL_TOKEN = 'YOUR_MIXPANEL_TOKEN_HERE';
      
      if (MIXPANEL_TOKEN !== 'YOUR_MIXPANEL_TOKEN_HERE') {
        mixpanel.init(MIXPANEL_TOKEN, {
          debug: false,
          track_pageview: false,
          persistence: 'localStorage'
        });
        this.initialized = true;
        
        // Set user ID if logged in
        const storage = await chrome.storage.local.get(['user']);
        if (storage.user) {
          mixpanel.identify(storage.user.id);
          mixpanel.people.set({
            $email: storage.user.email,
            tier: storage.user.tier,
            hourlyRate: storage.user.hourlyRate
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize telemetry:', error);
    }
  }
  
  async track(event: string, properties?: Record<string, any>): Promise<void> {
    if (!this.initialized) {
      console.log('Telemetry event (not sent):', event, properties);
      return;
    }
    
    try {
      const eventData: TelemetryEvent = {
        event,
        properties: {
          ...properties,
          extension_version: chrome.runtime.getManifest().version,
          timestamp: new Date().toISOString()
        }
      };
      
      mixpanel.track(eventData.event, eventData.properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }
  
  async setUser(userId: string, userProperties?: Record<string, any>): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    try {
      mixpanel.identify(userId);
      if (userProperties) {
        mixpanel.people.set(userProperties);
      }
    } catch (error) {
      console.error('Failed to set user:', error);
    }
  }
  
  async clearUser(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    try {
      mixpanel.reset();
    } catch (error) {
      console.error('Failed to clear user:', error);
    }
  }
} 