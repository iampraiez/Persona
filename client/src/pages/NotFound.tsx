import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 relative overflow-hidden">
      <div className="text-center space-y-8 max-w-lg relative z-10">
        <div className="relative inline-block">
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent opacity-20 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-foreground">Lost in Space?</span>
            </div>
        </div>
        
        <p className="text-foreground/60 text-lg md:text-xl">
          The coordinates you're looking for don't seem to exist in this timeline.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
          >
            <Home size={20} className="group-hover:-translate-y-1 transition-transform" />
            Return to Base
          </Link>
          <a
            href="mailto:support@timeforge.com"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
      
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
    </div>
  );
};

export default NotFound;
