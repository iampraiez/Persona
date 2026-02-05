import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../service/api.service";
import { useAuthStore } from "../store/auth.store";
import { useUser } from "../hooks/useUser";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { refetch } = useUser();
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const errorParam = params.get("error");

    if (success === "true") {
      setIsLoading(true);
      refetch().then(() => {
        setIsLoading(false);
      });
    } else if (errorParam) {
      setError("Authentication failed. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  }, [refetch]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await api.handleGoogleLogin(window.location.origin);
    } catch {
      console.error("Google Auth error:");
      setError("Google Auth error");
      setIsGoogleLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDemoLogin = () => {
    useAuthStore.getState().loginDemo();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card rounded-lg shadow-md p-8"
      >
        <div className="flex justify-center mb-6">
          <button onClick={() => navigate("/")}>
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
          </button>
        </div>

        <h2 className="text-xl font-bold text-center mb-6">
          AI-Powered Goal Tracker
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/20 text-destructive rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2 px-4 bg-white text-gray-800 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-foreground/60">Or</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
          >
            {isLoading ? "Loading..." : "Try Demo"}
          </button>
        </div>

        <p className="text-sm text-foreground/60 mt-6 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
