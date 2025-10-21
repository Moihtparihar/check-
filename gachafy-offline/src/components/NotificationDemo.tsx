import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, Bell } from 'lucide-react';
import { oneSignalService } from '@/lib/oneSignal';
import { useToast } from '@/hooks/use-toast';
import dashboardImage from '@/assets/onesignal-dashboard.png';
import pushTestImage from '@/assets/push-test-demo.png';

export const NotificationDemo = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      const granted = await oneSignalService.requestPermission();
      setIsSubscribed(granted);
      
      if (granted) {
        toast({
          title: "Push Notifications Enabled!",
          description: "You'll receive daily streak reminders at 8 PM",
        });
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      toast({
        title: "Subscription Failed",
        description: "Could not enable push notifications",
        variant: "destructive",
      });
    }
  };

  const testNotification = () => {
    // Test notification in demo mode
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Your streak ends in 3h – swipe now!', {
        body: 'Keep your GachaFi momentum going!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'gachaFi-streak',
        requireInteraction: false,
        data: { url: '/open' }
      });
      
      toast({
        title: "Test Notification Sent!",
        description: "Check your browser notifications",
      });
    } else {
      toast({
        title: "Permission Required",
        description: "Please enable notifications first",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          OneSignal Push Notifications
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleSubscribe}
              disabled={isSubscribed}
              className="flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              {isSubscribed ? 'Subscribed ✓' : 'Enable Notifications'}
            </Button>
            
            <Button 
              onClick={testNotification}
              variant="outline"
              disabled={!isSubscribed}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Test Notification
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Daily reminders at 20:00 local time: "Your streak ends in 3h – swipe now!"
            <br />
            Notifications are automatically canceled if you've already opened today.
          </p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="text-md font-semibold mb-3">OneSignal Dashboard</h4>
          <img 
            src={dashboardImage} 
            alt="OneSignal Dashboard Configuration"
            className="w-full rounded-lg border"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Dashboard showing app configuration, push templates, and analytics
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="text-md font-semibold mb-3">Live Push Test</h4>
          <img 
            src={pushTestImage} 
            alt="Push Notification Test on Mobile"
            className="w-full max-w-xs mx-auto rounded-lg border"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Mobile notification with deep-link to /open page
          </p>
        </Card>
      </div>
    </div>
  );
};