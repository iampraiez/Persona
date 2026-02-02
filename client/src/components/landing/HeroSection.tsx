import React from "react";
import { Calendar, Target, BarChart3, Users, Zap, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            className="md:w-1/2 mb-12 md:mb-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6"
            >
              Powered by Gemini AI
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Master Your Time.
              <br />
              <span className="text-accent">Achieve Your Goals.</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-foreground/70 mb-8 max-w-lg"
            >
              Persona combines AI-powered scheduling with goal tracking to
              help you optimize your time and achieve what matters most.
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              {useAuthStore((state) => state.isAuthenticated) ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-primary px-8 py-4 text-lg"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn btn-primary px-8 py-4 text-lg"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => {
                      useAuthStore.getState().loginDemo();
                      navigate("/dashboard");
                    }}
                    className="btn btn-secondary px-8 py-4 text-lg"
                  >
                    Try Demo
                  </button>
                </>
              )}
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-8 border-t border-border pt-8"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Smart Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Secure</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-6 lg:p-8 shadow-xl">
                <motion.div 
                  className="bg-card rounded-xl shadow-lg p-6"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
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
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                      <div key={day} className="col-span-1 text-center text-xs font-medium text-foreground/50">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-8 gap-2 items-center">
                      <div className="col-span-1 text-xs text-foreground/50">9am</div>
                      <div className="col-span-2 bg-accent/20 text-accent p-1 text-xs rounded">Work</div>
                      <div className="col-span-2 bg-accent/20 text-accent p-1 text-xs rounded">Work</div>
                      <div className="col-span-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 p-1 text-xs rounded">Gym</div>
                      <div className="col-span-2 bg-accent/20 text-accent p-1 text-xs rounded">Work</div>
                    </div>
                    <div className="grid grid-cols-8 gap-2 items-center">
                      <div className="col-span-1 text-xs text-foreground/50">12pm</div>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="col-span-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-1 text-xs rounded">Lunch</div>
                      ))}
                      <div className="col-span-2 bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 p-1 text-xs rounded">Hike</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -top-6 -right-6 bg-card rounded-full p-4 shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Calendar size={24} className="text-accent" />
                </motion.div>
                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-card rounded-full p-3 shadow-lg"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Target size={20} className="text-success" />
                </motion.div>
                <motion.div 
                  className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-card rounded-full p-3 shadow-lg"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <BarChart3 size={20} className="text-sky-500" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
