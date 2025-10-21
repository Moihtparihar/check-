import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/hooks/useAudio";

const AudioControls = () => {
  const { settings, toggleAudio, setVolume, playButtonClick } = useAudio();

  const handleToggle = () => {
    playButtonClick();
    toggleAudio();
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg p-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="p-2"
      >
        {settings.enabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>
      
      {settings.enabled && (
        <div className="flex items-center gap-2 min-w-[80px]">
          <Slider
            value={[settings.volume]}
            onValueChange={handleVolumeChange}
            max={1}
            min={0}
            step={0.1}
            className="w-16"
          />
          <span className="text-xs text-muted-foreground min-w-[30px]">
            {Math.round(settings.volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioControls;