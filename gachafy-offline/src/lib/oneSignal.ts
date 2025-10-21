import OneSignal from 'react-onesignal';

export class OneSignalService {
  private isInitialized = false;
  private appId = ''; // Will be set from environment or demo mode

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Demo mode configuration - in production, use your actual OneSignal App ID
      const demoAppId = 'demo-onesignal-app-id';
      
      await OneSignal.init({
        appId: demoAppId,
        safari_web_id: demoAppId,
        allowLocalhostAsSecureOrigin: true, // For development
      });

      this.isInitialized = true;
      console.log('OneSignal initialized successfully');
      
      // Set up notification click handler for deep linking
      OneSignal.Notifications.addEventListener('click', (event) => {
        console.log('OneSignal notification clicked:', event);
        
        // Navigate to /open on notification click
        if (typeof window !== 'undefined') {
          window.location.href = '/open';
        }
      });

    } catch (error) {
      console.error('OneSignal initialization failed:', error);
      // In demo mode, we'll simulate the functionality
      this.isInitialized = true;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();

    try {
      // Request permission using browser API for demo
      const permission = await Notification.requestPermission();
      const isGranted = permission === 'granted';
      
      console.log('Notification permission result:', permission);
      
      if (isGranted) {
        // Send welcome notification
        await this.sendWelcomeNotification();
        
        // Schedule daily reminders
        await this.scheduleDailyReminders();
      }
      
      return isGranted;
    } catch (error) {
      console.error('OneSignal permission request failed:', error);
      
      // Demo mode: simulate permission granted
      console.log('Demo mode: Simulating notification permission granted');
      await this.sendWelcomeNotification();
      await this.scheduleDailyReminders();
      return true;
    }
  }

  private async sendWelcomeNotification() {
    try {
      // In production, this would be sent from your backend
      console.log('Demo: Would send welcome notification');
      
      // Simulate welcome notification in demo mode
      if (this.isDemoMode()) {
        this.showDemoNotification(
          'Welcome to GachaFi!',
          'Daily streak reminders are now active. Keep your momentum going!'
        );
      }
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
    }
  }

  async scheduleDailyReminders() {
    try {
      // In OneSignal, daily notifications are typically set up via API or dashboard
      // For demo purposes, we'll simulate the scheduling logic
      
      console.log('Demo: Scheduling daily 20:00 streak reminders');
      
      // Calculate time until next 20:00
      const now = new Date();
      const next8PM = new Date();
      next8PM.setHours(20, 0, 0, 0);
      
      // If it's past 8 PM today, schedule for tomorrow
      if (now.getTime() > next8PM.getTime()) {
        next8PM.setDate(next8PM.getDate() + 1);
      }
      
      const timeUntilNext = next8PM.getTime() - now.getTime();
      
      // Demo: Schedule notification check
      setTimeout(() => {
        this.checkAndSendDailyReminder();
      }, timeUntilNext);
      
      console.log(`Demo: Next streak reminder scheduled for ${next8PM.toLocaleString()}`);
      
    } catch (error) {
      console.error('Failed to schedule daily reminders:', error);
    }
  }

  private async checkAndSendDailyReminder() {
    try {
      // Check if user already opened today
      const todayKey = new Date().toISOString().split('T')[0];
      const lastOpenDate = localStorage.getItem('lastOpenDate');
      
      if (lastOpenDate === todayKey) {
        console.log('Demo: User already opened today, skipping reminder');
        return;
      }
      
      // Check streak status
      const streakMap = JSON.parse(localStorage.getItem('streakMap') || '[0,0,0,0,0,0,0]');
      const todayIndex = new Date().getUTCDay();
      const isTodayDone = streakMap[todayIndex] === 1;
      
      if (isTodayDone) {
        console.log('Demo: Streak already completed today, skipping reminder');
        return;
      }
      
      // Send reminder notification
      if (this.isDemoMode()) {
        this.showDemoNotification(
          'Your streak ends in 3h – swipe now!',
          'Keep your GachaFi momentum going!'
        );
      } else {
        // In production, this would be sent from your backend via OneSignal API
        console.log('Would send daily reminder via OneSignal API');
      }
      
      // Schedule next day's reminder
      setTimeout(() => {
        this.checkAndSendDailyReminder();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
    } catch (error) {
      console.error('Failed to check and send daily reminder:', error);
    }
  }

  private showDemoNotification(title: string, body: string) {
    // Demo mode: Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'gachaFi-streak',
        requireInteraction: false,
        data: {
          url: '/open'
        }
      });
    } else {
      // Fallback: Log to console
      console.log(`Demo Notification: ${title} - ${body}`);
    }
  }

  private isDemoMode(): boolean {
    // Check if we're in demo mode (no real OneSignal app ID)
    return !this.appId || this.appId.includes('demo');
  }

  async getPlayerId(): Promise<string | null> {
    try {
      if (!this.isInitialized) await this.initialize();
      
      const userId = await OneSignal.User.PushSubscription.id;
      return userId || 'demo-player-id';
    } catch (error) {
      console.error('Failed to get OneSignal player ID:', error);
      return 'demo-player-id';
    }
  }

  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.isInitialized) await this.initialize();
      
      // Use browser notification permission for demo
      const permission = Notification.permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }
}

export const oneSignalService = new OneSignalService();