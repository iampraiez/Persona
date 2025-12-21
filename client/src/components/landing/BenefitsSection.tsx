import React, { useEffect, useRef } from "react";

interface BenefitProps {
  number: string;
  title: string;
  description: string;
  delay: number;
}

const Benefit: React.FC<BenefitProps> = ({
  number,
  title,
  description,
  delay,
}) => {
  const benefitRef = useRef<HTMLDivElement>(null);

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

    if (benefitRef.current) {
      observer.observe(benefitRef.current);
    }

    return () => {
      if (benefitRef.current) {
        observer.unobserve(benefitRef.current);
      }
    };
  }, []);

  return (
    <div
      className="flex items-start space-x-4 opacity-0"
      ref={benefitRef}
      style={{ animationDelay: `${delay}s`, animationFillMode: "forwards" }}
    >
      <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-foreground/70">{description}</p>
      </div>
    </div>
  );
};

const BenefitsSection: React.FC = () => {
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
    <section id="benefits" className="py-24" ref={sectionRef}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image/Visual */}
          <div
            className="lg:w-1/2 opacity-0"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/5 dark:to-indigo-500/5 rounded-2xl p-8 shadow-xl">
                <div className="bg-card rounded-xl shadow-lg p-6 animate-float">
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
                        <div
                          className="bg-accent h-2.5 rounded-full"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center text-success text-xs">
                          ✓
                        </div>
                        <span className="text-sm">Master 500 common words</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center text-success text-xs">
                          ✓
                        </div>
                        <span className="text-sm">
                          Complete beginner grammar
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center text-success text-xs">
                          ✓
                        </div>
                        <span className="text-sm">
                          Practice with language app daily
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xs">
                          →
                        </div>
                        <span className="text-sm">
                          Hold a 5-minute conversation
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-foreground/30 text-xs"></div>
                        <span className="text-sm text-foreground/50">
                          Read a simple book in Spanish
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="absolute -top-6 -right-6 bg-card rounded-lg px-4 py-2 shadow-lg text-sm">
                  <div className="font-semibold text-accent">
                    7 days ahead of schedule
                  </div>
                </div>
                <div className="absolute -bottom-5 -left-5 bg-card rounded-lg px-4 py-2 shadow-lg text-sm">
                  <div className="font-semibold text-success">
                    85% completion rate
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="lg:w-1/2">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4 opacity-0"
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              Transform How You Manage Your Time
            </h2>
            <p
              className="text-lg text-foreground/70 mb-10 opacity-0"
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              TimeForge helps you take control of your schedule and achieve your
              goals with less stress and more focus.
            </p>

            <div className="space-y-8">
              {benefits.map((benefit, index) => (
                <Benefit
                  key={index}
                  number={benefit.number}
                  title={benefit.title}
                  description={benefit.description}
                  delay={0.3 + index * 0.1}
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
