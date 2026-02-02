import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Persona is free for individuals. No hidden fees, no credit card required.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card p-8 md:p-12 rounded-3xl shadow-xl border-2 border-accent relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 rounded-bl-xl text-sm font-bold">
              POPULAR
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Individual Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-foreground/60">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {[
                "Unlimited Events",
                "Unlimited Active Goals",
                "AI-Powered Insights",
                "Weekly Analytics",
                "Smart Notifications",
                "Demo Mode Access",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/login")}
              className="w-full btn btn-primary py-4 text-lg"
            >
              Get Started for Free
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
