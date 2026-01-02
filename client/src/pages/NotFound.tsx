import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-bold text-primary animate-pulse">404</h1>
        <h2 className="text-3xl font-semibold">Page Not Found</h2>
        <p className="text-foreground/70 text-lg">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Home size={20} />
            Go Back Home
          </Link>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default NotFound;
