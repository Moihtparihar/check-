import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import mythicBadge from "@/assets/mythic-badge.png";
import { shortenTxHash } from "@/lib/radix";

const Reveal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tier = location.state?.tier;
  const txHash = location.state?.txHash;
  const [spCount, setSpCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (!tier) {
      navigate("/open");
      return;
    }

    // Show badge with zoom-in animation
    setTimeout(() => setShowBadge(true), 100);

    // Animate SP counter from 0 to 1000 over 600ms
    const startTime = Date.now();
    const duration = 600;
    const target = 1000;

    const animateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setSpCount(Math.floor(easeOut * target));

      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      }
    };

    setTimeout(() => {
      animateCounter();
    }, 400); // Start after badge appears

    // Auto-timer to go back to /open after 3s
    const timer = setTimeout(() => {
      navigate("/open");
    }, 3000);

    return () => clearTimeout(timer);
  }, [tier, navigate]);

  const shareOnTikTok = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: "🔥 I just opened a Mythic box! #MysteryChain",
        });
      } catch (error) {
        console.log("Share canceled");
      }
    } else {
      // Fallback for desktop
      navigator.clipboard.writeText("🔥 I just opened a Mythic box! #MysteryChain");
    }
  };

  if (!tier) {
    return null;
  }

  return (
    <main className="min-h-screen gradient-reveal flex flex-col items-center justify-center p-4">
      {/* Badge with zoom-in animation */}
      <div className="mb-8">
        <img 
          src={mythicBadge}
          alt="Mythic Badge"
          className={`w-[200px] h-[200px] object-contain transition-all duration-400 ${
            showBadge ? 'animate-zoom-in' : 'scale-0 opacity-0'
          }`}
        />
      </div>

      {/* SP Counter */}
      <div className="mb-8 text-center">
        <div className="text-6xl font-bold text-white mb-2 animate-count-up">
          {spCount.toLocaleString()}
        </div>
        <div className="text-xl text-purple-200">
          SP Earned
        </div>
      </div>

      {/* Transaction Hash Pill */}
      {txHash && (
        <div className="mb-4 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-mono">
          TX: {shortenTxHash(txHash)}
        </div>
      )}

      {/* Share Button */}
      <Button 
        onClick={shareOnTikTok}
        className="mb-4 bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3"
      >
        Share on TikTok
      </Button>

      {/* Auto-return hint */}
      <p className="text-purple-200 text-sm opacity-75">
        Returning to boxes in 3 seconds...
      </p>
    </main>
  );
};

export default Reveal;