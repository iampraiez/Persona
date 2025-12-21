import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import BenefitsSection from "../components/landing/BenefitsSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";
import "../index.css";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen special">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
