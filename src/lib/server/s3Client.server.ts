import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env"; // Import the env configuration

// Create S3 client with proper error handling for environment variables
export const createS3Client = () => {
  try {
    const client = new S3Client({
      region: env.AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log("Successfully connected to the S3 bucket");
    return client;
  } catch (error) {
    console.error("Error creating S3 client:", error);
    throw new Error("Failed to initialize S3 client with provided credentials");
  }
};
