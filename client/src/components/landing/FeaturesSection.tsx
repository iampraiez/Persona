import React, { useEffect, useRef } from "react";
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

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
            entry.target.classList.add("slide-up");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      className="feature-card opacity-0"
      ref={cardRef}
      style={{ animationDelay: `${delay}s`, animationFillMode: "forwards" }}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
            entry.target.querySelectorAll(".opacity-0").forEach((el) =>
              el.classList.add("fade-in")
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

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
        "Set ambitious goals with customizable durations and track your progress through 10 clear steps to achievement.",
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

  return (
    <section
      id="features"
      className="py-24 bg-background"
      ref={sectionRef}
    >
      <div className="container mx-auto px-6">
        <h2
          className="section-title opacity-0"
          style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          Powerful Features
        </h2>
        <p
          className="section-subtitle opacity-0"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          TimeForge combines intelligent scheduling with goal tracking to help
          you make the most of your time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
