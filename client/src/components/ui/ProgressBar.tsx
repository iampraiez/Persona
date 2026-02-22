import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  label?: string;
  subLabel?: string;
  className?: string;
  barClassName?: string;
  showPercent?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  subLabel,
  className = "",
  barClassName = "bg-accent",
  showPercent = true,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`space-y-1 ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-foreground/70 mb-1">
          {label && <span>{label}</span>}
          {showPercent && <span>{clampedProgress}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${barClassName}`}
        />
      </div>
      {subLabel && (
        <p className="text-[10px] text-foreground/50 mt-1">{subLabel}</p>
      )}
    </div>
  );
};

export default ProgressBar;
