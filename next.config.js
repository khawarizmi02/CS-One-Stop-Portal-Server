/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	env: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
        NEXT_PUBLIC_CLERK_FRONTEND_API: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
        NEXT_PUBLIC_CLERK_BACKEND_API: process.env.NEXT_PUBLIC_CLERK_BACKEND_API,
        NEXT_PUBLIC_AZURE_CLIENT_ID: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
        NEXT_PUBLIC_AZURE_CLIENT_SECRET: process.env.NEXT_PUBLIC_AZURE_CLIENT_SECRET,
        NEXT_PUBLIC_AZURE_REDIRECT_URI: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI,
        DATABASE_URL: process.env.DATABASE_URL,
    },
};

export default config;
