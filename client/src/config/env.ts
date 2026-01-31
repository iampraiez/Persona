import * as z from "zod";

const envValidator = z.object({
  VITE_API_URL: z.string().url(),
});

const parsedEnv = envValidator.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  console.error("Make sure VITE_API_URL is set in your .env file or environment");
  console.error("Current import.meta.env:", import.meta.env);
  console.warn("⚠️  Using fallback configuration. API calls may fail.");
}

// Export with fallback to prevent app crashes
export const env = parsedEnv.success
  ? parsedEnv
  : {
      success: false as const,
      data: {
        VITE_API_URL: "/api", // Fallback to relative path
      },
      error: parsedEnv.error,
    };
