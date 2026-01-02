import React from "react";
import { motion } from "framer-motion";

interface BenefitProps {
  number: string;
  title: string;
  description: string;
  index: number;
}

const Benefit: React.FC<BenefitProps> = ({
  number,
  title,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-start space-x-4"
    >
      <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-foreground/70">{description}</p>
      </div>
    </motion.div>
  );
};

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      number: "01",
      title: "Save 10+ Hours Weekly",
      description:
        "Our AI-powered scheduling optimizes your time, helping you recover hours previously lost to inefficient planning.",
    },
    {
      number: "02",
      title: "Achieve Goals Faster",
      description:
        "With structured step tracking and AI suggestions, you'll make consistent progress towards your most important goals.",
    },
    {
      number: "03",
      title: "Reduce Stress",
      description:
        "Clear visualization of your schedule and upcoming events reduces mental load and helps you feel in control.",
    },
    {
      number: "04",
      title: "Improve Work-Life Balance",
      description:
        "Visual analytics help you ensure you're allocating appropriate time to work, personal development, and relaxation.",
    },
  ];

  return (
    <section id="benefits" className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image/Visual */}
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/5 dark:to-indigo-500/5 rounded-2xl p-8 shadow-xl">
                <motion.div 
                  className="bg-card rounded-xl shadow-lg p-6"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <h3 className="font-semibold text-lg mb-6">
                    Goal Progress: Learn Spanish
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          Overall Progress
                        </span>
                        <span className="text-sm font-medium">70%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <motion.div
                          className="bg-accent h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: "70%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                        ></motion.div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        "Master 500 common words",
                        "Complete beginner grammar",
                        "Practice with language app daily",
                      ].map((step, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center text-success text-xs">
                            ✓
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xs">
                          →
                        </div>
                        <span className="text-sm">
                          Hold a 5-minute conversation
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Stats cards */}
                <motion.div 
                  className="absolute -top-6 -right-6 bg-card rounded-lg px-4 py-2 shadow-lg text-sm"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="font-semibold text-accent">
                    7 days ahead of schedule
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Benefits List */}
          <div className="lg:w-1/2">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Transform How You Manage Your Time
            </motion.h2>
            <motion.p
              className="text-lg text-foreground/70 mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              TimeForge helps you take control of your schedule and achieve your
              goals with less stress and more focus.
            </motion.p>

            <div className="space-y-8">
              {benefits.map((benefit, index) => (
                <Benefit
                  key={index}
                  number={benefit.number}
                  title={benefit.title}
                  description={benefit.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
