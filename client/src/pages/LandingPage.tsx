import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorks from "../components/landing/HowItWorks";
import BenefitsSection from "../components/landing/BenefitsSection";
import Testimonials from "../components/landing/Testimonials";
import Pricing from "../components/landing/Pricing";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";
import { motion } from "framer-motion";
import "../index.css";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Polish */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.05),transparent_40%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.05),transparent_40%)]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSection />
          <FeaturesSection />
          <HowItWorks />
          <BenefitsSection />
          <Testimonials />
          <Pricing />
          <CTASection />
          <Footer />
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
