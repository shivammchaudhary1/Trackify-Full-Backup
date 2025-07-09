const {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} =  require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { config } = require('../config/env/default');

const s3Client = new S3Client({ region: config.s3.region });



/**
 * Generates a signed URL for an S3 command with a specified expiration time.
 * This allows frontend to upload/download  delete files.
 *
 * @param {Object} command - The AWS S3 command object for which the signed URL is generated.
 * @param {number} [expiresInSeconds=60] - The expiration time for the signed URL in seconds.
 * @returns {Promise<string>} A promise that resolves to the signed URL.
 */

function _getSignedUrl(
  command,
  // Default expiration time is 1 minute
  expiresInSeconds = 3600,
) {
  return getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Asynchronously generates a signed URL for deleting a file from an S3 bucket.
 *
 * @param {string} filePath - The path of the file to be deleted in the S3 bucket.
 * @param {string} bucket - The name of the S3 bucket.
 * @returns {Promise<{ signedURL: string }>} A promise that resolves to an object
 * containing the signed URL for deleting the specified file.
 */
async function getSignedUrlForDelete(filePath, bucket) {
  const signedURL = await _getSignedUrl(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: filePath,
    }),
  );

  return { signedURL };
}

/**
 * Generates a signed URL for downloading a file from an S3 bucket.
 */
async function getSignedUrlForDownload(filePath, bucket) {
  const signedURL = await _getSignedUrl(
    new GetObjectCommand({
      Bucket: bucket,
      Key: filePath,
    }),
  );

  return { signedURL };
}

/*
 * Generates a signed URL for uploading a file to an S3 bucket.
 */

async function getSignedUrlForUpload(companyId, fileName, bucket) {
  const filePath = `${companyId}/${Date.now()}/${fileName}`;

  const signedURL = await _getSignedUrl(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filePath,
    }),
  );

  return { signedURL, filePath };
}

/**
 * Delete file from s3
 */
function deleteFromS3(filePath, bucket) {
  return s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: filePath,
    }),
  );
}

/**
 * Function to download from S3
 */
async function downloadFromS3(filePath) {
  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: config.aws.s3.bucket,
      Key: filePath,
    }),
  );
  // Use `Response` from `fetch` API to convert readable stream to `Buffer`.
  return Buffer.from(await new Response(result.Body).arrayBuffer());
}

/**
 * Stream file from S3 (memory-efficient)
 * @param {string} filePath
 * @returns {ReadableStream} The S3 file stream
 */
async function streamFromS3(filePath) {
  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: filePath,
    }),
  );
  return Readable.from(result.Body);
}

/**
 * Function to upload to S3
 */
function uploadToS3(data, contentType, fileName) {
  return s3Client.send(
    new PutObjectCommand({
      Key: fileName,
      Body: data,
      ContentType: contentType,
      Bucket: config.s3.bucket,
    }),
  );
}

module.exports =  {
  getSignedUrlForDelete,
  getSignedUrlForDownload,
  getSignedUrlForUpload,
  deleteFromS3,
  downloadFromS3,
  streamFromS3,
  uploadToS3,
};
