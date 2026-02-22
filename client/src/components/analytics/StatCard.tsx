import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  description: string;
  isLoading?: boolean;
  iconColor?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  icon: Icon,
  value,
  description,
  isLoading = false,
  iconColor = "text-accent",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card p-4 rounded-lg border border-border/50"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 w-24 bg-secondary rounded mb-2"></div>
          <div className="h-4 w-32 bg-secondary rounded"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-foreground/70">{description}</p>
        </>
      )}
    </motion.div>
  );
};

export default StatCard;
