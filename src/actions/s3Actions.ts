// app/actions/s3Actions.ts
"use server";

import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client } from "@/lib/server/s3Client.server";
import { env } from "@/env";

// Initialize S3 client with error handling
let s3Client: S3Client | null = null;

interface SignedURLResponse {
  success?: { url: string };
  failure?: string;
}

export async function getSignedURL(
  fileName: string,
  contentType: string,
  folderName?: string,
): Promise<SignedURLResponse> {
  if (!s3Client) {
    const clientInitResult = initializeS3Client();
    if (clientInitResult.failure) {
      return clientInitResult;
    }
  }

  const sanitizedFileName = sanitizeFileName(fileName);
  const key = generateUniqueKey({ fileName: sanitizedFileName, folderName });
  const putObjectCommand = createPutObjectCommand(key, contentType);

  try {
    if (!s3Client) {
      throw new Error("S3 client is not initialized");
    }
    const url = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60,
    });
    return { success: { url } };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return {
      failure: `Error generating signed URL: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function deleteFileFromS3(
  key: string,
): Promise<SignedURLResponse> {
  if (!s3Client) {
    const clientInitResult = initializeS3Client();
    if (clientInitResult.failure) {
      return clientInitResult;
    }
  }

  try {
    if (!s3Client) {
      throw new Error("S3 client is not initialized");
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return { success: { url: `File with key ${key} deleted successfully` } };
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    return {
      failure: `Error deleting file from S3: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function initializeS3Client(): SignedURLResponse {
  try {
    s3Client = createS3Client();
    return {};
  } catch (error) {
    return {
      failure: `S3 client configuration error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^\w\s.-]/g, "");
}

interface generateUniqueKeyProps {
  fileName: string;
  folderName?: string;
}

function generateUniqueKey({
  fileName,
  folderName,
}: generateUniqueKeyProps): string {
  return `${folderName}/${Date.now()}-${fileName}`;
}

function createPutObjectCommand(
  key: string,
  contentType: string,
): PutObjectCommand {
  return new PutObjectCommand({
    Bucket: env.NEXT_PUBLIC_AWS_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
}
