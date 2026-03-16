import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.AWS_BUCKET_NAME || "vintyl";
const CLOUDFRONT = process.env.CLOUDFRONT_URL;

/**
 * Generate a presigned URL for uploading a video to S3
 */
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

/**
 * Generate a presigned URL for downloading/streaming a video
 * Uses CloudFront if configured, otherwise S3 presigned URL
 */
export async function getVideoUrl(key: string) {
  if (CLOUDFRONT) {
    return `${CLOUDFRONT}/${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 86400 });
}
