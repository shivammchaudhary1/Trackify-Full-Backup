const express = require("express");
const {
  createClient,
  updateClient,
  deleteClient,
  getWorkspaceClients,
} = require("../controller/client.controller.js");

const { isAllowed } = require("../middleware/isAllowed.js");
const {
  withAsyncErrorHandling,
} = require("../utility/withAsyncErrorHandling.js");

const Router = express.Router();

Router.route("/create")
  .all(isAllowed)
  .post(withAsyncErrorHandling(createClient));

Router.route("/get-all")
  .all(isAllowed)
  .get(withAsyncErrorHandling(getWorkspaceClients));

Router.route("/update/:clientId")
  .all(isAllowed)
  .patch(withAsyncErrorHandling(updateClient));

Router.route("/delete/:clientId")
  .all(isAllowed)
  .delete(withAsyncErrorHandling(deleteClient));

module.exports = Router;
