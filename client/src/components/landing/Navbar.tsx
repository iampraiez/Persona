import React, { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "../../store/theme.store";
import { useAuthStore } from "../../store/auth.store";

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center py-4">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-accent"
            >
              <path
                d="M12 8V12L14.5 14.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.6087 19C3.58041 19 2.0016 17.2091 2.0016 15C2.0016 13.1358 3.1232 11.5693 4.72195 11.1469C4.89261 8.32075 7.15425 6 9.99739 6C12.1229 6 13.9532 7.2926 14.8308 9.1206C15.0769 9.04211 15.3348 9 15.6016 9C17.2584 9 18.6016 10.3431 18.6016 12C18.6016 12.2321 18.5739 12.4562 18.5216 12.6693C19.827 13.2784 20.7516 14.5478 20.7516 16C20.7516 18.2091 18.9608 20 16.9325 20H5.6087Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-2xl font-bold">
              <span className="text-accent">Time</span>
              <span>forge</span>
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="font-medium hover:text-accent transition-colors"
          >
            Features
          </a>
          <a
            href="#benefits"
            className="font-medium hover:text-accent transition-colors"
          >
            Benefits
          </a>
          {/* <a
            href="#testimonials"
            className="font-medium hover:text-violet-600 transition-colors"
          >
            Testimonials
          </a> */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {isAuthenticated ? (
            <button
              className="btn btn-accent"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              className="btn btn-accent"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 mr-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden absolute top-full left-0 right-0 p-4 z-50"
          >
            <div className="bg-background/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-xl p-6 flex flex-col space-y-6">
              <div className="space-y-4">
                <a
                  href="#features"
                  className="block text-lg font-medium hover:text-accent transition-colors px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#benefits"
                  className="block text-lg font-medium hover:text-accent transition-colors px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Benefits
                </a>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                {isAuthenticated ? (
                  <button
                    className="btn btn-accent w-full py-4 text-base"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/dashboard");
                    }}
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <button
                    className="btn btn-accent w-full py-4 text-base"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
