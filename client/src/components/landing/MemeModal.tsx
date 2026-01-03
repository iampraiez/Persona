import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemeModal: React.FC<MemeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.6
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 100,
              transition: {
                duration: 0.3
              }
            }}
            className="relative w-full max-w-md bg-card border border-border/50 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative w-full aspect-square mb-8 rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-secondary/30">
                <img
                  src="/speed.jpeg"
                  alt="Funny Meme"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Wait a minute...
              </h3>
              <p className="text-xl text-foreground/80 font-medium italic leading-relaxed">
                "nigga thought id drop my twitter link"
              </p>
              
              <div className="mt-8 flex items-center gap-2 text-foreground/40 text-sm font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Closing automatically...
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MemeModal;
