const { config } = require("../config/env/default.js");
const worker = require("../worker/worker.js");

// Redirect back to frontend domain
const homeController = (req, res) => {
  // return res.json(Object.keys(worker.processJobs));
  res.redirect(config.frontend_domain);
};

module.exports = { homeController };
