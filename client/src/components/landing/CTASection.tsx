import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { motion } from "framer-motion";

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="signup" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-accent to-accent/80 rounded-3xl p-8 md:p-12 shadow-xl text-accent-foreground text-center"
        >
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Ready to Transform Your Productivity?
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl opacity-90 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join the users who have already started optimizing their time and
              achieved their goals with Timeforge.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {useAuthStore((state) => state.isAuthenticated) ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-secondary !bg-background !text-foreground px-8 py-4 text-lg"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn btn-secondary !bg-background !text-foreground px-8 py-4 text-lg"
                  >
                    Get Started Now
                  </button>
                  <button
                    onClick={() => {
                      useAuthStore.getState().loginDemo();
                      navigate("/dashboard");
                    }}
                    className="btn border border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10 px-8 py-4 text-lg"
                  >
                    Try Demo
                  </button>
                </>
              )}
            </motion.div>

            <motion.p
              className="mt-6 text-sm opacity-80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Free forever for individuals.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
