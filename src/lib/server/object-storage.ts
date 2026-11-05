import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const bucket = "gobinda-jewels-media";

export function getObjectStorage() {
  if (!endpoint || !accessKeyId || !secretAccessKey || !region) {
    throw new Error("Neon Object Storage credentials are not configured.");
  }

  return new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function putImageObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  return getObjectStorage().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function createImageUploadUrl(
  key: string,
  contentType: string,
) {
  const client = getObjectStorage();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: 300 });
}

export function getPublicImageUrl(key: string) {
  if (!endpoint) throw new Error("Neon Object Storage endpoint is missing.");
  return `${endpoint.replace(/\/+$/, "")}/${bucket}/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export async function getImageObject(key: string) {
  return getObjectStorage().send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
}

export async function deleteImageObject(key: string) {
  return getObjectStorage().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key }),
  );
}
