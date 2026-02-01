import * as z from "zod";

const envValidator = z.object({
  VITE_API_URL: z.string().url(),
  VITE_PUBLIC_VAPID_KEY: z.string(),
});

const parsedEnv = envValidator.safeParse(import.meta.env) 

export const env = parsedEnv.success
  ? parsedEnv
  : {
      success: false as const,
      data: {
        VITE_API_URL: "/api",
        VITE_PUBLIC_VAPID_KEY: "",
      },
      error: parsedEnv.error,
    };
