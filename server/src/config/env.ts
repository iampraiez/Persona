import * as z from "zod";

const envValidator = z.object({
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    PORT: z.string().min(1),
    NODE_ENV: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    VAPID_PUBLIC_KEY: z.string().min(1),
    VAPID_PRIVATE_KEY: z.string().min(1),
    BACKEND_URL: z.string().min(1),
    CLIENT_URL: z.string().min(1),
    PAYSTACK_SECRET_KEY: z.string().min(1),
});

export const env = envValidator.safeParse(process.env);

if (!env.success) {
  throw new Error("Invalid environment variables");
}
