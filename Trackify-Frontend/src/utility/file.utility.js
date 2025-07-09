
import Api from "##/src/client.js";
import { extractFileNameFromS3Path } from "##/src/utility/string.js";
import { config } from "##/src/utility/config/config.js";

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64
    reader.onerror = (error) => reject(error);
  });
}

async function getSignedUrlForS3(s3Key, options = {}) {
  if (options.method === 'PUT' && !options.body?.fileName) {
    throw new Error('Expected `fileName` when uploading attachment');
  }

  const url = new URL(`${config.api}/api/file/files`, window.origin);
  url.searchParams.set('file', s3Key);
  const response = await Api.fetch(url, options);
  // Fix casing on `signedURL` parameter.
  const { signedURL: signedUrl, ...rest } = response;
  return { signedUrl, ...rest };
}

/**
 * Deletes a file from S3 using a pre-signed URL.
 *
 * 1. Retrieves a signed URL for deletion based on the file path.
 * 2. Sends a DELETE request to the signed URL.
 *
 * On failure, logs the error and returns the original file.
 * On success, returns null.
 */
async function deleteFile(filePath, handleError) {
  try {
    const { signedUrl } = await getSignedUrlForS3(filePath, {
      method: 'DELETE',
    });

    await fetch(signedUrl, { method: 'DELETE' });
    return null;
  } catch (error) {
    handleError('deleteFile', error, '');
    return filePath;
  }
}

/**
 * Downloads a file from S3 using a pre-signed URL.
 *
 * 1. Retrieves a signed URL for downloading based on the file path.
 * 2. Creates and triggers a temporary anchor tag to initiate the file download.
 */
async function downloadFile(filePath) {
  if (!filePath) {
    return;
  }
  const { signedUrl } = await getSignedUrlForS3(filePath);

  const link = document.createElement('a');
  link.href = signedUrl;
  link.target = '_blank';
  link.download = extractFileNameFromS3Path(filePath);

  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Uploads a new file to S3 using a pre-signed URL.
 *
 * 1. Requests a signed URL to upload the file.
 * 2. Sends a PUT request with the file content.
 *
 * On success, returns the updated file with its new file path.
 * On failure, logs the error and returns null.
 */
async function uploadFile(file, handleError) {

  try {
      const { signedUrl, filePath } = await getSignedUrlForS3(file.name, {
        method: 'PUT',
        body: { fileName: file.name },
      });

      await fetch(signedUrl, { method: 'PUT', body: file });

      return { ...file, value: filePath };
  } catch (error) {
    handleError('uploadFile', error, '');
    return null;
  }
}

const getFileNameFromS3Key = (filePath) => {
  const match = filePath && filePath.match(/[^/]+\/\d+\/(.+)$/);

  if (!match) return '';
  return match[1];
};

export {
  uploadFile,
  downloadFile,
  deleteFile,
  convertFileToBase64,
  getFileNameFromS3Key,
};
