import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import AudioControls from "@/components/AudioControls";
import { registerSW, setupPWAInstall } from "@/utils/pwa";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Register service worker for PWA functionality
    registerSW();
    
    // Setup PWA install prompt
    setupPWAInstall();

    // Auto-transition to /open after 2 seconds
    const timer = setTimeout(() => {
      navigate('/open');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <AudioControls />
    </main>
  );
};

export default Index;
