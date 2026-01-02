import * as z from "zod";

const envValidator = z.object({
  VITE_API_URL: z.string().url(),
});

export const env = envValidator.safeParse(import.meta.env);

if (!env.success) {
  throw new Error("Invalid environment variables");
}
