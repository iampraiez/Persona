import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Clock,
Loader2} from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AMBIENT_SOUNDS = [
  { id: "none", name: "Silent", icon: VolumeX, url: "" },
  {
    id: "rain",
    name: "Rain",
    category: "Nature",
    icon: CloudRain,
    url: "https://upload.wikimedia.org/wikipedia/commons/B/Bo/Bourne_woods_rain_2020-05-10_0757.mp3",
  },
  {
    id: "ocean",
    name: "Ocean",
    category: "Nature",
    icon: CloudRain,
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Waves_crashing_on_the_beach.mp3",
  },
  {
    id: "forest",
    name: "Forest",
    category: "Nature",
    icon: Wind,
    url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Forest_ambience.mp3",
  },
  {
    id: "white_noise",
    name: "White Noise",
    category: "Noise",
    icon: Wind,
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/White_noise.mp3",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    category: "Cozy",
    icon: CloudRain,
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Fireplace_sound_recording.mp3",
  },
  {
    id: "lofi",
    name: "Calm Lofi",
    category: "Music",
    icon: Music,
    url: "https://archive.org/download/lo-fi-beats-2021/01.%20Late%20Night%20Coffee.mp3",
  },
  {
    id: "cafe",
    name: "Cafe",
    category: "Ambience",
    icon: Volume2,
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Ambience_in_a_Parisian_cafe.mp3",
  },
  {
    id: "night",
    name: "Night",
    category: "Nature",
    icon: CloudRain,
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Crickets_chirping_in_the_night.mp3",
  },
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
  const [showSoundLibrary, setShowSoundLibrary] = useState(false);
  const [isInterfaceVisible, setIsInterfaceVisible] = useState(true);

  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (event) {
      const start = new Date(event.startTime).getTime();
      const end = new Date(event.endTime).getTime();
      const durationSeconds = Math.floor((end - start) / 1000);
      const finalDuration =
        durationSeconds > 0 ? Math.min(durationSeconds, 7200) : 25 * 60;
      setInitialDuration(finalDuration);
      setTimeLeft(finalDuration);
    }
  }, [event]);

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setIsActive(false);
        toast.info("Session paused because you left the focus tab.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive]);

  useEffect(() => {
    const resetInactivityTimeout = () => {
      setIsInterfaceVisible(true);
      if (inactivityTimeoutRef.current)
        clearTimeout(inactivityTimeoutRef.current);

      if (isActive && !showSoundLibrary) {
        inactivityTimeoutRef.current = setTimeout(() => {
          setIsInterfaceVisible(false);
        }, 3500);
      }
    };

    if (!isActive) {
      setIsInterfaceVisible(true);
      if (inactivityTimeoutRef.current)
        clearTimeout(inactivityTimeoutRef.current);
    } else {
      resetInactivityTimeout();
    }

    const activityEvents = ["mousemove", "mousedown", "touchstart", "keydown"];
    activityEvents.forEach((e) =>
      window.addEventListener(e, resetInactivityTimeout),
    );

    return () => {
      activityEvents.forEach((e) =>
        window.removeEventListener(e, resetInactivityTimeout),
      );
      if (inactivityTimeoutRef.current)
        clearTimeout(inactivityTimeoutRef.current);
    };
  }, [isActive, showSoundLibrary]);

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
          focusDuration: (event.focusDuration || 0) + totalFocusTime,
        },
      });
      toast.success("Focus session completed!");
      navigate("/dashboard");
    } catch {
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
    <div className="fixed inset-0 bg-background z-[100] flex flex-col overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg hidden md:block">
            <Clock className="h-6 w-6 text-accent" />
          </div>
          <div className="text-left">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider truncate max-w-[200px] md:max-w-md">
              {event.title}
            </h2>
            <p className="text-xs md:text-sm text-foreground/60 hidden md:block">
              Focusing on your goals
            </p>
          </div>
        </div>

        <motion.button
          animate={{
            opacity: isInterfaceVisible ? 1 : 0,
            pointerEvents: isInterfaceVisible ? "auto" : "none",
          }}
          onClick={() =>
            isActive ? confirm("Stop session?") && navigate(-1) : navigate(-1)
          }
          className="p-2 md:p-3 hover:bg-secondary rounded-full transition-all hover:rotate-90"
        >
          <X className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Timer Display */}
        <motion.div
           animate={{ 
             opacity: isInterfaceVisible ? 1 : 0,
             filter: isInterfaceVisible ? "blur(0px)" : "blur(10px)",
           }}
           className="relative mb-24 md:mb-12 flex items-center justify-center transition-all duration-700"
        >
          <svg className="w-[280px] h-[280px] md:w-96 md:h-96 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-secondary fill-none"
              strokeWidth="8"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-accent fill-none"
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                pathLength:
                  initialDuration > 0 ? timeLeft / initialDuration : 0,
              }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl md:text-9xl font-bold font-mono tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <p className="text-foreground/60 tracking-[0.2em] font-medium uppercase mt-2 text-xs md:text-base">
              Remaining
            </p>
          </div>
        </motion.div>

        {/* Floating Controls Bar (Bottom) */}
        <motion.div
          animate={{
            opacity: isInterfaceVisible ? 1 : 0,
            y: isInterfaceVisible ? 0 : 20,
            pointerEvents: isInterfaceVisible ? "auto" : "none",
          }}
          className="absolute bottom-12 md:bottom-20 flex items-center gap-4 md:gap-8 px-6 py-4 bg-background/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl z-30"
        >
          <button
            onClick={handleReset}
            className="p-3 md:p-4 bg-secondary/50 hover:bg-secondary rounded-full text-foreground/70 transition-all hover:scale-110 active:scale-95"
            title="Reset"
          >
            <RotateCcw className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 ${
              isActive
                ? "bg-secondary text-foreground"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {isActive ? (
              <Pause className="h-6 w-6 md:h-8 md:w-8 fill-current" />
            ) : (
              <Play className="h-6 w-6 md:h-8 md:w-8 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={() => setShowSoundLibrary(true)}
            className={`p-3 md:p-4 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center gap-2 ${
              selectedSound.id !== "none"
                ? "bg-accent/20 text-accent"
                : "bg-secondary/50 text-foreground/70"
            }`}
            title="Sound Library"
          >
            <Music className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="hidden md:flex p-3 md:p-4 bg-secondary/50 hover:bg-secondary rounded-full text-foreground/70 transition-all hover:scale-110 active:scale-95"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
              <Maximize2 className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>
        </motion.div>
      </div>

      {/* Sound Library Modal/Sheet */}
      <AnimatePresence>
        {showSoundLibrary && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] h-[70vh] md:h-[500px] bg-card/90 backdrop-blur-xl border border-white/10 md:rounded-3xl rounded-t-3xl shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-accent" />
                Soundscapes
              </h3>
              <button
                onClick={() => setShowSoundLibrary(false)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Volume Slider */}
              <div className="mb-8 p-4 bg-secondary/30 rounded-2xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Master Volume</span>
                  <span className="text-sm text-foreground/50">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-accent cursor-pointer h-2 bg-secondary rounded-full appearance-none"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMBIENT_SOUNDS.map((sound) => {
                  const Icon = sound.icon;
                  const isSelected = selectedSound.id === sound.id;
                  return (
                    <button
                      key={sound.id}
                      onClick={() => setSelectedSound(sound)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border text-center ${
                        isSelected
                          ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(var(--accent),0.3)]"
                          : "bg-secondary/20 border-transparent hover:border-white/10 hover:bg-secondary/40 text-foreground/70"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 ${isSelected ? "animate-bounce" : ""}`}
                      />
                      <span className="text-sm font-medium">{sound.name}</span>
                      {sound.category && (
                        <span className="text-[10px] uppercase tracking-wider opacity-50">
                          {sound.category}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for Sound Library */}
      <AnimatePresence>
        {showSoundLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setShowSoundLibrary(false)}
          />
        )}
      </AnimatePresence>

      <motion.button
        animate={{
          opacity: isInterfaceVisible ? 1 : 0,
          pointerEvents: isInterfaceVisible ? "auto" : "none",
        }}
        onClick={handleComplete}
        disabled={isUpdating}
        className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex items-center gap-2 text-foreground/30 hover:text-success transition-all font-medium py-2 px-4 text-sm md:text-base z-20"
      >
        {isUpdating && <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />}
        <CheckCircle2 className={`h-4 w-4 md:h-5 md:w-5 ${isUpdating ? "hidden" : ""}`} />
        <span className="hidden md:inline">{isUpdating ? "Completing..." : "Complete Early"}</span>
      </motion.button>

      <audio ref={audioRef} loop />
    </div>
  );
};

export default FocusSession;
