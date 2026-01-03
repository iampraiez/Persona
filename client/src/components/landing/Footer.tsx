import React from "react";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";
import MemeModal from "./MemeModal";

const Footer: React.FC = () => {
  const [isMemeOpen, setIsMemeOpen] = React.useState(false);

  return (
    <footer className="bg-secondary/50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <a
              href="#"
              className="font-bold text-2xl text-accent mb-4 inline-block"
            >
              TimeForge
            </a>
            <p className="text-foreground/70 mb-4">
              AI-powered time management and goal tracking for ambitious
              professionals.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsMemeOpen(true)}
                className="text-foreground/50 hover:text-accent transition-colors"
              >
                <Twitter size={20} />
              </button>
              <a
                href="https://www.linkedin.com/in/thepraiseolaoye"
                className="text-foreground/50 hover:text-accent transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://www.instagram.com/iampraiez_?igsh=enI4OWcxOHN1Yml3"
                className="text-foreground/50 hover:text-accent transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://github.com/iampraiez/Persona"
                className="text-foreground/50 hover:text-accent transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-foreground/70 hover:text-accent transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="https://iampraiez.vercel.app/#contact"
                  className="text-foreground/70 hover:text-accent transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/iampraiez/Persona"
                  className="text-foreground/70 hover:text-accent transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/iampraiez"
                  className="text-foreground/70 hover:text-accent transition-colors"
                >
                  About Me
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-foreground/50">
          <p>
            © {new Date().getFullYear()} Time Forge. All rights reserved. Talk
            to Praise sha.
          </p>
        </div>
      </div>
      <MemeModal isOpen={isMemeOpen} onClose={() => setIsMemeOpen(false)} />
    </footer>
  );
};

export default Footer;
