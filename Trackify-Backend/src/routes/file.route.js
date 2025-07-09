const express = require("express");
const {
    handleS3FileDeleteSignedUrl,
    handleS3FileDownloadSignedUrl,
    handleS3FileUploadSignedUrl,
} = require("../controller/file.controller.js");

const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route('/files')
    .all(isAllowed)
    .get(withAsyncErrorHandling(handleS3FileDownloadSignedUrl))
    .put(withAsyncErrorHandling(handleS3FileUploadSignedUrl))
    .delete(withAsyncErrorHandling(handleS3FileDeleteSignedUrl));

module.exports = Router;
