import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Wind, 
  Music, 
  Maximize2, 
  Minimize2,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AMBIENT_SOUNDS = [
  { id: "none", name: "None", icon: VolumeX, url: "" },
  { id: "rain", name: "Rain", icon: CloudRain, url: "https://actions.google.com/sounds/v1/water/rain_on_roof.ogg" },
  { id: "white_noise", name: "White Noise", icon: Wind, url: "https://actions.google.com/sounds/v1/weather/white_noise.ogg" },
  { id: "lofi", name: "Lofi Beats", icon: Music, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
];

const FocusSession = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, updateEvent, isUpdating } = useEvents();
  const event = events?.find((e) => e.id === id);

  const [initialDuration, setInitialDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSound, setSelectedSound] = useState(AMBIENT_SOUNDS[0]);
  const [volume, setVolume] = useState(0.5);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  useEffect(() => {
    if (event) {
      const start = new Date(event.startTime).getTime();
      const end = new Date(event.endTime).getTime();
      const durationSeconds = Math.floor((end - start) / 1000);
      
      // If duration is valid and > 0, use it. Maximize at 2 hours for focus sessions.
      // Otherwise default to 25 mins.
      const finalDuration = (durationSeconds > 0) ? Math.min(durationSeconds, 7200) : 25 * 60;
      
      setInitialDuration(finalDuration);
      setTimeLeft(finalDuration);
    }
  }, [event]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setTotalFocusTime((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (audioRef.current) {
      if (selectedSound.url && isActive) {
        audioRef.current.src = selectedSound.url;
        audioRef.current.play().catch(e => console.error("Audio playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [selectedSound, isActive]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleComplete = async () => {
    if (!event) return;
    
    try {
      await updateEvent({
        id: event.id,
        event: {
          isCompleted: true,
          focusDuration: (event.focusDuration || 0) + totalFocusTime
        }
      });
      toast.success("Focus session completed!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(initialDuration);
  };

  if (!event) return <Loader />;

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Clock className="h-6 w-6 text-accent" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold uppercase tracking-wider">{event.title}</h2>
            <p className="text-sm text-foreground/60">Focusing on your goals</p>
          </div>
        </div>
        <button 
          onClick={() => (isActive ? (isActive && confirm("Stop session?") && navigate(-1)) : navigate(-1))}
          className="p-3 hover:bg-secondary rounded-full transition-all hover:rotate-90"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Timer Display */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-12"
      >
        <svg className="w-80 h-80 md:w-96 md:h-96 transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-secondary fill-none"
            strokeWidth="12"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-accent fill-none"
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              pathLength: initialDuration > 0 ? timeLeft / initialDuration : 0
            }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl md:text-9xl font-bold font-mono tracking-tighter">
            {formatTime(timeLeft)}
          </span>
          <p className="text-foreground/60 tracking-[0.2em] font-medium uppercase mt-2">
            Remaining
          </p>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-8 mb-12 z-10 transition-all">
        <button 
          onClick={handleReset}
          className="p-4 bg-secondary/50 hover:bg-secondary rounded-2xl text-foreground/70 transition-all hover:scale-110 active:scale-95"
          title="Reset"
        >
          <RotateCcw className="h-7 w-7" />
        </button>

        <button 
          onClick={() => setIsActive(!isActive)}
          className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all shadow-2xl hover:scale-105 active:scale-95 ${
            isActive 
              ? "bg-secondary text-foreground" 
              : "bg-accent text-accent-foreground"
          }`}
        >
          {isActive ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1" />}
        </button>

        <button 
          onClick={handleToggleFullscreen}
          className="p-4 bg-secondary/50 hover:bg-secondary rounded-2xl text-foreground/70 transition-all hover:scale-110 active:scale-95"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="h-7 w-7" /> : <Maximize2 className="h-7 w-7" />}
        </button>
      </div>

      {/* Ambient Sounds */}
      <div className="w-full max-w-2xl bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-6 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-accent" />
            <span className="font-semibold">Ambient Sound</span>
          </div>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 accent-accent cursor-pointer"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {AMBIENT_SOUNDS.map((sound) => {
            const Icon = sound.icon;
            const isSelected = selectedSound.id === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => setSelectedSound(sound)}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border ${
                  isSelected 
                    ? "bg-accent/10 border-accent/50 text-accent" 
                    : "bg-secondary/30 border-transparent hover:border-border text-foreground/60"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{sound.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button 
        onClick={handleComplete}
        disabled={isUpdating}
        className="mt-12 flex items-center gap-2 text-foreground/40 hover:text-success transition-all font-medium py-2 px-6 rounded-full border border-transparent hover:border-success/30 hover:bg-success/5"
      >
        <CheckCircle2 className="h-5 w-5" />
        Finish & Complete Activity
      </button>

      <audio ref={audioRef} loop />
    </div>
  );
};

export default FocusSession;
