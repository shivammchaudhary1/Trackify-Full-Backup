const { config } = require("../config/env/default");
const {getSignedUrlForDelete, getSignedUrlForUpload, getSignedUrlForDownload} = require("../services/file.services")

async function getSignedUrlForUploadApi(req, res) {
  let bucket = config.s3.bucket;

  if (req.path === '/picture') {
    bucket = config.s3.publicPucket;
  }

  const { signedURL, filePath } = await getSignedUrlForUpload(
    req.user._id,
    req.body.fileName,
    bucket,
  );

  return res.json({ signedURL, filePath });
}

/**
 * Generates a pre-signed S3 URL for deleting a file.
 * This URL allows the frontend to delete the specified file from the S3 bucket.
 */
async function handleS3FileDeleteSignedUrl(req, res) {
  const bucket = config.s3.bucket;

  const { signedURL } = await getSignedUrlForDelete(req.query.file, bucket);

  return res.json({ signedURL });
}

/**
 * Generates a pre-signed S3 URL for downloading a file.
 * This URL allows the frontend to download the specified file from the S3 bucket.
 */
async function handleS3FileDownloadSignedUrl(req, res) {
  const {
    query: { file: s3Path },
  } = req;

  const bucket = config.s3.bucket;
  const { signedURL } = await getSignedUrlForDownload(s3Path, bucket);

  return res.json({ signedURL });
}

/**
 * Generates a pre-signed S3 URL for uploading a file.
 * This URL allows the frontend to securely upload a file to the S3 bucket.
 */
async function handleS3FileUploadSignedUrl(req, res) {
  let bucket = config.s3.bucket;

  const { signedURL, filePath } = await getSignedUrlForUpload(
    req.user._id,
    req.body.fileName,
    bucket,
  );

  return res.json({ signedURL, filePath });
}

/**
 * Gets a signed url which allows the UI to delete a particular file.
 */
async function getSignedUrlForDeleteApi(req, res) {
  const bucket =
    // Profile picture are meant to be in a publicly accessible bucket
    req.path === '/api/profile/picture'
      ? config.s3.publicPucket
      : config.s3.bucket;

  const { signedURL } = await getSignedUrlForDelete(req.query.file, bucket);

  return res.json({ signedURL });
}

module.exports = {
    getSignedUrlForUploadApi,
    handleS3FileDeleteSignedUrl,
    handleS3FileDownloadSignedUrl,
    handleS3FileUploadSignedUrl,
    getSignedUrlForDeleteApi
}