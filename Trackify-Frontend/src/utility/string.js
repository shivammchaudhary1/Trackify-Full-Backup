/**
 * Extracts the file name from a full S3 file path.
 *
 * Example:
 *   Input:  "folder/subfolder/document.pdf"
 *   Output: "document.pdf"
 *
 * Throws an error if the path is invalid or doesn't contain a file name.
 */
function extractFileNameFromS3Path(s3Path) {
  const match = s3Path.match(/[^/]+$/);
  if (!match) {
    throw new Error(`Invalid S3 path: ${s3Path}`);
  }
  return match[0];
}

export { extractFileNameFromS3Path };
