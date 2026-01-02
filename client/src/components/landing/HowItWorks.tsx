import React from "react";
import { motion } from "framer-motion";
import { Search, Edit3, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: <Search className="w-8 h-8 text-accent" />,
    title: "Plan Your Week",
    description: "Use our intuitive 24/7 timetable to map out your ideal schedule. Drag and drop events with ease.",
  },
  {
    icon: <Edit3 className="w-8 h-8 text-accent" />,
    title: "Track Your Goals",
    description: "Break down your long-term ambitions into 10 actionable steps. Monitor your progress in real-time.",
  },
  {
    icon: <CheckCircle2 className="w-8 h-8 text-accent" />,
    title: "Achieve Results",
    description: "Get AI-powered insights and smart notifications to stay on track and reach your full potential.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Three simple steps to master your time and achieve your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-foreground/70">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                  {/* Optional: Add an arrow or connector here */}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
