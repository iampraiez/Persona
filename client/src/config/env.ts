import * as z from "zod";

const envValidator = z.object({
  VITE_API_URL: z.string().url(),
});

const parsedEnv = envValidator.safeParse(import.meta.env);

export const env = parsedEnv.success
  ? parsedEnv
  : {
      success: false as const,
      data: {
        VITE_API_URL: "/api",
      },
      error: parsedEnv.error,
    };
