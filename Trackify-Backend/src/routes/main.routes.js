const fs = require("fs");
const path = require("path");
const express = require("express");
const Router = express.Router();

const authenticateJWT = require("../middleware/auth.middleware.js");
const { homeController } = require("../controller/home.controller.js");

async function routes(app) {
  const routesPath = path.join(__dirname);
  const files = fs.readdirSync(routesPath);

  app.use(Router.get("/", homeController));
  files.forEach((file) => {
    if (file.endsWith(".route.js")) {
      const route = require(path.join(routesPath, file));
      const routePath = `/api/${file.replace(".route.js", "")}`;

      if (
        routePath.includes("auth") ||
        routePath.includes("user") ||
        routePath.includes("profile")
      ) {
        // No authentication for auth/home routes
        app.use(routePath, route);
      } else {
        app.use(routePath, authenticateJWT, route);
      }
    }
  });
}

module.exports = { routes };
