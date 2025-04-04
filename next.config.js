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
		AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
		AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION,
		AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
		AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
		NEXT_PUBLIC_AWS_BUCKET_NAME: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
		NEXT_PUBLIC_AWS_BUCKET_REGION: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'my-cs-one-stop-portal-bucket.s3.ap-southeast-1.amazonaws.com',
				pathname: '**',
			},
		],
	},
};

export default config;
