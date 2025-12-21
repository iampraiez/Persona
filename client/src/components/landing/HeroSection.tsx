import React, { useEffect, useRef } from "react";
import { Calendar, Target, BarChart3, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
            entry.target.querySelectorAll(".opacity-0").forEach(el => el.classList.add("fade-in"));
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div
      className="pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden"
      ref={heroRef}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
          {/* Hero Text */}
          <div
            className="md:w-1/2 mb-12 md:mb-0 opacity-0 slide-up"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6">
              Powered by Gemini AI
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Master Your Time.
              <br />
              <span className="text-accent">Achieve Your Goals.</span>
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-lg">
              TimeForge combines AI-powered scheduling with goal tracking to
              help you optimize your time and achieve what matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/login")}
                className="btn btn-primary"
              >
                Start Free Trial
              </button>
              <a href="#features" className="btn btn-secondary">
                Explore Features
              </a>
            </div>
          </div>

          {/* Hero Image/Animation */}
          <div
            className="md:w-1/2 opacity-0"
            style={{
              animationDelay: "0.4s",
              animationFillMode: "forwards",
              animation: "fade-in 0.8s ease-in-out forwards",
            }}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-6 lg:p-8 shadow-xl">
                <div className="bg-card rounded-xl shadow-lg p-6 animate-float">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">
                      My Weekly Schedule
                    </h3>
                    <div className="flex space-x-2">
                      <span className="h-3 w-3 bg-red-400 rounded-full"></span>
                      <span className="h-3 w-3 bg-yellow-400 rounded-full"></span>
                      <span className="h-3 w-3 bg-green-400 rounded-full"></span>
                    </div>
                  </div>
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-1 text-center text-xs font-medium text-foreground/50">
                      Mon
                    </div>
                    <div className="col-span-1 text-center text-xs font-medium text-foreground/50">
                      Tue
                    </div>
                    <div className="col-span-1 text-center text-xs font-medium text-foreground/50">
                      Wed
                    </div>
                    <div className="col-span-1 text-center text-xs font-medium text-foreground/50">
                      Thu
                    </div>
                    <div className="col-span-1 text-center text-xs font-medium text-foreground/50">
                      Fri
                    </div>
                    <div className="col-span-1 text-center text-xs font-medium text-foreground/50">
                      Sat
                    </div>
                    <div className="col-span-1 text-center text-xs font-medium text-foreground/50">
                      Sun
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-8 gap-2 items-center">
                      <div className="col-span-1 text-xs text-foreground/50">
                        9am
                      </div>
                      <div className="col-span-2 bg-accent/20 text-accent p-1 text-xs rounded">
                        Work
                      </div>
                      <div className="col-span-2 bg-accent/20 text-accent p-1 text-xs rounded">
                        Work
                      </div>
                      <div className="col-span-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 p-1 text-xs rounded">
                        Gym
                      </div>
                      <div className="col-span-2 bg-accent/20 text-accent p-1 text-xs rounded">
                        Work
                      </div>
                    </div>
                    <div className="grid grid-cols-8 gap-2 items-center">
                      <div className="col-span-1 text-xs text-foreground/50">
                        12pm
                      </div>
                      <div className="col-span-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-1 text-xs rounded">
                        Lunch
                      </div>
                      <div className="col-span-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-1 text-xs rounded">
                        Lunch
                      </div>
                      <div className="col-span-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-1 text-xs rounded">
                        Lunch
                      </div>
                      <div className="col-span-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-1 text-xs rounded">
                        Lunch
                      </div>
                      <div className="col-span-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-1 text-xs rounded">
                        Lunch
                      </div>
                      <div className="col-span-2 bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 p-1 text-xs rounded">
                        Hike
                      </div>
                    </div>
                    <div className="grid grid-cols-8 gap-2 items-center">
                      <div className="col-span-1 text-xs text-foreground/50">
                        3pm
                      </div>
                      <div className="col-span-2 bg-accent/20 text-accent p-1 text-xs rounded">
                        Work
                      </div>
                      <div className="col-span-2 bg-accent/20 text-accent p-1 text-xs rounded">
                        Work
                      </div>
                      <div className="col-span-1 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 p-1 text-xs rounded">
                        Call
                      </div>
                      <div className="col-span-3"></div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-card rounded-full p-4 shadow-lg">
                  <Calendar size={24} className="text-accent" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card rounded-full p-3 shadow-lg">
                  <Target size={20} className="text-success" />
                </div>
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-card rounded-full p-3 shadow-lg">
                  <BarChart3 size={20} className="text-sky-500" />
                </div>
                <div className="absolute bottom-1/4 -left-5 bg-card rounded-full p-2 shadow-lg">
                  <Clock size={16} className="text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
