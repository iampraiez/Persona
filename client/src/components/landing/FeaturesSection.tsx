import React from "react";
import {
  Calendar,
  Target,
  LineChart,
  BellRing,
  Clock,
  Puzzle,
  Brain,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const features = [
  {
    icon: <Calendar />,
    title: "Weekly 24/7 Timetable",
    description:
      "Visualize your entire week with our powerful and flexible timetable. Organize your time with drag-and-drop simplicity.",
  },
  {
    icon: <Target />,
    title: "Goal Creation & Tracking",
    description:
      "Set ambitious goals with customizable durations and track your progress through clear steps to achievement.",
  },
  {
    icon: <LineChart />,
    title: "Analytics & Insights",
    description:
      "Gain valuable insights into your productivity patterns with visual analytics that help you understand your habits.",
  },
  {
    icon: <BellRing />,
    title: "Smart Notifications",
    description:
      "Never miss an important event with browser-based notifications that keep you on track throughout your day.",
  },
  {
    icon: <Clock />,
    title: "Time Analysis",
    description:
      "Track how you actually spend your time vs. how you planned to spend it, with special tagging for unplanned activities.",
  },
  {
    icon: <Puzzle />,
    title: "Flexible Planning",
    description:
      "Adjust your schedule on the fly with our intuitive interface that makes rearranging events effortless.",
  },
  {
    icon: <Brain />,
    title: "AI-Powered Suggestions",
    description:
      "Receive personalized schedule improvements and goal optimization powered by Gemini API.",
  },
  {
    icon: <Check />,
    title: "Progress Tracking",
    description:
      "Mark events as completed or skipped, and track your goal progression with detailed step completion logs.",
  },
];

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="feature-card bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all"
    >
      <div className="feature-icon w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Timeforge combines intelligent scheduling with goal tracking to help
            you make the most of your time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
