import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
		SERVER_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
		// Clerk variables
		CLERK_SECRET_KEY: z.string().min(1),
    // Add AWS environment variables
    AWS_BUCKET_NAME: z.string().min(1),
    AWS_BUCKET_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
		// Aurinko variables
		AURINKO_API_URL: z.string().url(),
		AURINKO_CLIENT_ID: z.string().min(1),
		AURINKO_CLIENT_SECRET: z.string().min(1),
		AURINKO_SIGNING_SECRET: z.string().min(1),
		//OpenAI variables
		OPENAI_API_KEY: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
		NEXT_PUBLIC_URL: z.string().url(),
    // Add any client-side AWS variables if needed
    NEXT_PUBLIC_AWS_BUCKET_NAME: z.string().min(1),
    NEXT_PUBLIC_AWS_BUCKET_REGION: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
		SERVER_URL: process.env.SERVER_URL || "",
    DATABASE_URL: process.env.DATABASE_URL || "",
    NODE_ENV: process.env.NODE_ENV || "development",
		// Clerk variables
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
    // Add AWS environment variables
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "",
    AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION || "",
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    // Client-side variables
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || "",
    NEXT_PUBLIC_AWS_BUCKET_NAME: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || "",
    NEXT_PUBLIC_AWS_BUCKET_REGION: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION || "",
		// Aurinko variables
		AURINKO_API_URL: process.env.AURINKO_API_URL || "",
		AURINKO_CLIENT_ID: process.env.AURINKO_CLIENT_ID || "",
		AURINKO_CLIENT_SECRET: process.env.AURINKO_CLIENT_SECRET || "",
		AURINKO_SIGNING_SECRET: process.env.AURINKO_SIGNING_SECRET || "",
		// OpenAI variables
		OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});